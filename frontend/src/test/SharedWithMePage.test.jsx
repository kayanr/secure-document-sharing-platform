import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import SharedWithMePage from '../pages/SharedWithMePage';
import * as shareService from '../services/shareService';
import * as AuthContext from '../context/AuthContext';

vi.mock('../services/shareService');
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <SharedWithMePage />
    </MemoryRouter>
  );

beforeEach(() => {
  AuthContext.useAuth.mockReturnValue({ logout: vi.fn() });
});

describe('SharedWithMePage', () => {
  test('renders shared documents with owner email', async () => {
    shareService.getSharedWithMe.mockResolvedValue([
      {
        id: 1,
        originalFilename: 'report.pdf',
        ownerEmail: 'owner@test.com',
        fileSize: 2048,
        uploadedAt: '2026-04-18T10:00:00',
      },
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('report.pdf')).toBeInTheDocument();
      expect(screen.getByText(/owner@test\.com/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no documents shared', async () => {
    shareService.getSharedWithMe.mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText(/No documents have been shared with you yet/)
      ).toBeInTheDocument();
    });
  });
});
