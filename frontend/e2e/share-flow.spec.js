import { test, expect, request as playwrightRequest } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OWNER = { name: 'E2E Owner', email: 'e2e-owner@playwright.com', password: 'password123' };
const RECIPIENT = { name: 'E2E Recipient', email: 'e2e-recipient@playwright.com', password: 'password123' };
const API = 'http://localhost:8080';

test.beforeAll(async () => {
  const api = await playwrightRequest.newContext({ baseURL: API });

  // Register both users — ignore errors if they already exist
  await api.post('/api/auth/register', { data: { fullName: OWNER.name, email: OWNER.email, password: OWNER.password } });
  await api.post('/api/auth/register', { data: { fullName: RECIPIENT.name, email: RECIPIENT.email, password: RECIPIENT.password } });

  await api.dispose();
});

test.afterAll(async () => {
  // Revoke all shares on owner's documents so the next run starts clean
  const api = await playwrightRequest.newContext({ baseURL: API });

  const loginRes = await api.post('/api/auth/login', {
    data: { email: OWNER.email, password: OWNER.password },
  });
  const { token } = await loginRes.json();
  const headers = { Authorization: `Bearer ${token}` };

  const docsRes = await api.get('/api/documents', { headers });
  const docs = await docsRes.json();

  for (const doc of docs) {
    const sharesRes = await api.get(`/api/documents/${doc.id}/shares`, { headers });
    const shares = await sharesRes.json();
    for (const share of shares) {
      await api.delete(`/api/documents/${doc.id}/share/${share.userId}`, { headers });
    }
  }

  await api.dispose();
});

test('full share flow: owner shares document, recipient sees it on Shared With Me page', async ({ page }) => {
  // --- Step 1: Login as owner ---
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(OWNER.email);
  await page.locator('input[type="password"]').fill(OWNER.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL('/documents');

  // --- Step 2: Upload a document ---
  await page.getByRole('button', { name: /upload document/i }).click();
  await expect(page).toHaveURL('/documents/upload');

  await page.locator('input[type="file"]').setInputFiles(
    path.join(__dirname, 'fixtures/test-document.txt')
  );
  await page.getByRole('button', { name: /^upload$/i }).click();
  await expect(page).toHaveURL('/documents');

  // --- Step 3: Open share modal on the first document ---
  await page.getByRole('button', { name: /^share$/i }).first().click();

  const emailInput = page.getByPlaceholder(/recipient email/i);
  await emailInput.waitFor({ state: 'visible' });
  await emailInput.fill(RECIPIENT.email);

  await page.getByRole('button', { name: /^share$/i }).last().click();

  // Accept either success (includes email) or "already shared" error — both mean share exists
  await expect(
    page.getByText(new RegExp(`Shared with ${RECIPIENT.email}|already shared`, 'i'))
  ).toBeVisible({ timeout: 10000 });

  // --- Step 4: Close modal and logout ---
  await page.getByRole('button', { name: /close/i }).click();
  await page.getByRole('button', { name: /logout/i }).click();
  await expect(page).toHaveURL('/login');

  // --- Step 5: Login as recipient ---
  await page.locator('input[type="email"]').fill(RECIPIENT.email);
  await page.locator('input[type="password"]').fill(RECIPIENT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL('/documents');

  // --- Step 6: Navigate to Shared With Me ---
  await page.getByRole('button', { name: /shared with me/i }).click();
  await expect(page).toHaveURL('/shared-with-me');

  // --- Step 7: Verify the document appears with the owner's email ---
  await expect(page.getByText('test-document.txt')).toBeVisible();
  await expect(page.getByText(new RegExp(OWNER.email))).toBeVisible();
});
