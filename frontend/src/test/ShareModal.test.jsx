import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import DocumentsPage from '../pages/DocumentsPage';
import * as documentService from '../services/documentService';
import * as shareService from '../services/shareService';
import * as AuthContext from '../context/AuthContext';

vi.mock('../services/documentService');
vi.mock('../services/shareService');
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const TEST_DOC = {
  id: 1,
  originalFilename: 'report.pdf',
  fileSize: 1024,
  uploadedAt: '2026-04-18T10:00:00',
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <DocumentsPage />
    </MemoryRouter>
  );

beforeEach(() => {
  AuthContext.useAuth.mockReturnValue({ logout: vi.fn(), isAdmin: false });
  documentService.getDocuments.mockResolvedValue([TEST_DOC]);
  shareService.getShares.mockResolvedValue([]);
});

describe('Share modal', () => {
  test('Share button opens modal with email input', async () => {
    renderPage();

    await waitFor(() => screen.getByText('report.pdf'));
    await userEvent.click(screen.getAllByRole('button', { name: /^share$/i })[0]);

    expect(screen.getByPlaceholderText(/recipient email/i)).toBeInTheDocument();
  });

  test('submitting valid email shows success message', async () => {
    shareService.shareDocument.mockResolvedValue();

    renderPage();
    await waitFor(() => screen.getByText('report.pdf'));

    // Open modal via card Share button (first one in the DOM)
    await userEvent.click(screen.getAllByRole('button', { name: /^share$/i })[0]);

    await userEvent.type(
      screen.getByPlaceholderText(/recipient email/i),
      'recipient@test.com'
    );

    // Submit via modal Share button (last one in the DOM)
    await userEvent.click(screen.getAllByRole('button', { name: /^share$/i }).at(-1));

    await waitFor(() => {
      expect(screen.getByText(/Shared with recipient@test\.com/i)).toBeInTheDocument();
    });
  });

  test('submitting own email shows inline error', async () => {
    shareService.shareDocument.mockRejectedValue({
      response: { data: { error: 'You cannot share a document with yourself' } },
    });

    renderPage();
    await waitFor(() => screen.getByText('report.pdf'));
    await userEvent.click(screen.getAllByRole('button', { name: /^share$/i })[0]);

    await userEvent.type(
      screen.getByPlaceholderText(/recipient email/i),
      'owner@test.com'
    );
    await userEvent.click(screen.getAllByRole('button', { name: /^share$/i }).at(-1));

    await waitFor(() => {
      expect(
        screen.getByText(/cannot share a document with yourself/i)
      ).toBeInTheDocument();
    });
  });

  test('submitting duplicate share shows inline error', async () => {
    shareService.shareDocument.mockRejectedValue({
      response: { data: { error: 'Document already shared with this user' } },
    });

    renderPage();
    await waitFor(() => screen.getByText('report.pdf'));
    await userEvent.click(screen.getAllByRole('button', { name: /^share$/i })[0]);

    await userEvent.type(
      screen.getByPlaceholderText(/recipient email/i),
      'recipient@test.com'
    );
    await userEvent.click(screen.getAllByRole('button', { name: /^share$/i }).at(-1));

    await waitFor(() => {
      expect(
        screen.getByText(/already shared with this user/i)
      ).toBeInTheDocument();
    });
  });

  test('modal shows existing recipients with Revoke button', async () => {
    shareService.getShares.mockResolvedValue([
      { userId: 2, email: 'recipient@test.com', sharedAt: '2026-04-18T10:00:00' },
    ]);

    renderPage();
    await waitFor(() => screen.getByText('report.pdf'));
    await userEvent.click(screen.getByRole('button', { name: /^share$/i }));

    await waitFor(() => {
      expect(screen.getByText('recipient@test.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /revoke/i })).toBeInTheDocument();
    });
  });

  test('clicking Revoke removes recipient from modal', async () => {
    shareService.getShares.mockResolvedValue([
      { userId: 2, email: 'recipient@test.com', sharedAt: '2026-04-18T10:00:00' },
    ]);
    shareService.revokeShare.mockResolvedValue();

    renderPage();
    await waitFor(() => screen.getByText('report.pdf'));
    await userEvent.click(screen.getByRole('button', { name: /^share$/i }));

    await waitFor(() => screen.getByText('recipient@test.com'));
    await userEvent.click(screen.getByRole('button', { name: /revoke/i }));

    await waitFor(() => {
      expect(screen.queryByText('recipient@test.com')).not.toBeInTheDocument();
    });
  });
});
