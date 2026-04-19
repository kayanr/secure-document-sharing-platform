import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments, deleteDocument, downloadDocument } from '../services/documentService';
import { shareDocument, getShares, revokeShare } from '../services/shareService';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import UserAvatar from '../components/UserAvatar';
import FileIcon from '../components/FileIcon';
import Toast from '../components/Toast';

function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Share modal state
  const [shareDocId, setShareDocId] = useState(null);
  const [shareDocFilename, setShareDocFilename] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [shareError, setShareError] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shares, setShares] = useState([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [revokeError, setRevokeError] = useState('');
  const [toast, setToast] = useState('');

  // Delete modal state
  const [deleteDoc, setDeleteDoc] = useState(null);
  const deleteModalRef = useRef(null);
  const deleteTriggerRef = useRef(null);

  const { logout, currentUserEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (doc) => {
    deleteTriggerRef.current = document.activeElement;
    setDeleteDoc(doc);
  };

  const confirmDelete = async () => {
    deleteTriggerRef.current = null;
    try {
      await deleteDocument(deleteDoc.id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== deleteDoc.id));
      setDeleteDoc(null);
    } catch (err) {
      setError('Failed to delete document.');
      setDeleteDoc(null);
    }
  };

  // Focus trap + Escape key for delete modal
  useEffect(() => {
    if (!deleteDoc) return;
    const modal = deleteModalRef.current;
    if (!modal) return;

    const focusable = modal.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { setDeleteDoc(null); return; }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deleteDoc]);

  // Return focus to trigger button when modal closes
  useEffect(() => {
    if (!deleteDoc && deleteTriggerRef.current) {
      deleteTriggerRef.current.focus();
      deleteTriggerRef.current = null;
    }
  }, [deleteDoc]);

  const openShareModal = async (docId, filename) => {
    setShareDocId(docId);
    setShareDocFilename(filename);
    setRecipientEmail('');
    setShareError('');
    setRevokeError('');
    setShares([]);
    setSharesLoading(true);
    try {
      const data = await getShares(docId);
      setShares(data);
    } catch (err) {
      // non-fatal — modal still opens, revoke list just won't show
    } finally {
      setSharesLoading(false);
    }
  };

  const closeShareModal = () => {
    setShareDocId(null);
    setShareDocFilename('');
    setRecipientEmail('');
    setShareError('');
    setShares([]);
    setRevokeError('');
  };

  const handleRevoke = async (recipientId) => {
    setRevokeError('');
    try {
      await revokeShare(shareDocId, recipientId);
      setShares((prev) => prev.filter((s) => s.userId !== recipientId));
    } catch (err) {
      setRevokeError(err.response?.data?.error || 'Failed to revoke share.');
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setShareError('');
    setShareLoading(true);
    try {
      await shareDocument(shareDocId, recipientEmail);
      setToast(`Shared with ${recipientEmail}`);
      closeShareModal();
    } catch (err) {
      setShareError(err.response?.data?.error || 'Failed to share document.');
    } finally {
      setShareLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <Header>
        <UserAvatar email={currentUserEmail} />
        <button onClick={() => navigate('/shared-with-me')} style={styles.navButton}>
          Shared With Me
        </button>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </Header>

      <div style={styles.content}>
        <div style={styles.pageHeader}>
          <div>
            <h2 style={styles.pageTitle}>My Documents</h2>
            <p style={styles.pageSubtitle}>Manage your uploads and sharing access.</p>
          </div>
          <button onClick={() => navigate('/documents/upload')} style={styles.uploadButton}>
            + Upload Document
          </button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {!loading && documents.length === 0 && (
          <div style={styles.emptyState}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <p style={styles.emptyText}>No documents yet</p>
            <p style={styles.emptySubtext}>Upload your first document to start sharing securely</p>
            <button
              onClick={() => navigate('/documents/upload')}
              style={styles.emptyButton}
            >
              + Upload Document
            </button>
          </div>
        )}

        {documents.map((doc) => (
          <div key={doc.id} style={styles.card}>
            <div style={styles.cardLeft}>
              <FileIcon filename={doc.originalFilename} />
              <div>
                <div style={styles.filenameRow}>
                  <p style={styles.filename}>{doc.originalFilename}</p>
                  {doc.shareCount > 0
                    ? <span style={styles.badgeShared}>Shared with {doc.shareCount}</span>
                    : <span style={styles.badgePrivate}>Private</span>
                  }
                </div>
                <p style={styles.meta}>
                  {(doc.fileSize / 1024).toFixed(1)} KB &nbsp;•&nbsp;
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div style={styles.cardActions}>
              <button
                onClick={() => downloadDocument(doc.id, doc.originalFilename)}
                style={styles.downloadButton}
              >
                Download
              </button>
              <button
                onClick={() => openShareModal(doc.id, doc.originalFilename)}
                style={styles.shareButton}
              >
                Share
              </button>
              <button
                onClick={() => handleDelete(doc)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteDoc && (
        <div style={styles.overlay}>
          <div
            style={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            ref={deleteModalRef}
          >
            <h3 id="delete-modal-title" style={styles.modalTitle}>Delete Document</h3>
            <p style={styles.deleteMessage}>
              Are you sure you want to delete <strong>{deleteDoc.originalFilename}</strong>?
              This permanently removes the document and revokes access for anyone it was shared with.
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setDeleteDoc(null)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={styles.confirmDeleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} onClose={() => setToast('')} />

      {/* Share Modal */}
      {shareDocId && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Share — {shareDocFilename}</h3>
            <p style={styles.modalHelperText}>Manage who can download this file.</p>

            {/* Current recipients */}
            {sharesLoading && <p style={styles.modalMeta}>Loading...</p>}
            {!sharesLoading && shares.length > 0 && (
              <div style={styles.sharesList}>
                <p style={styles.sharesLabel}>People with access</p>
                {shares.map((s) => (
                  <div key={s.userId} style={styles.shareRow}>
                    <span style={styles.shareEmail}>{s.email}</span>
                    <button
                      onClick={() => handleRevoke(s.userId)}
                      style={styles.revokeButton}
                    >
                      Revoke
                    </button>
                  </div>
                ))}
                {revokeError && <p style={styles.modalError}>{revokeError}</p>}
              </div>
            )}

            <form onSubmit={handleShare}>
              <p style={styles.sharesLabel}>Add someone</p>
              <input
                type="email"
                placeholder="Recipient email address"
                aria-label="Recipient email address"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
                style={styles.input}
              />
              {shareError && <p style={styles.modalError}>{shareError}</p>}
              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeShareModal}
                  style={styles.cancelButton}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={shareLoading}
                  style={styles.submitButton}
                >
                  {shareLoading ? 'Sharing...' : 'Share'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
  },
  navButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    border: '1px solid #2563eb',
    color: '#2563eb',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  uploadButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  content: {
    maxWidth: '900px',
    margin: '2rem auto',
    padding: '0 2rem',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  pageTitle: {
    margin: 0,
    textAlign: 'left',
  },
  pageSubtitle: {
    margin: '0.25rem 0 0',
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    marginTop: '1rem',
  },
  cardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  filenameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  badgePrivate: {
    fontSize: '0.7rem',
    fontWeight: '600',
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    whiteSpace: 'nowrap',
  },
  badgeShared: {
    fontSize: '0.7rem',
    fontWeight: '600',
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    whiteSpace: 'nowrap',
  },
  filename: {
    margin: 0,
    fontWeight: '500',
  },
  meta: {
    margin: '0.25rem 0 0',
    fontSize: '0.8rem',
    color: '#6b7280',
  },
  cardActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  downloadButton: {
    padding: '0.4rem 0.9rem',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  shareButton: {
    padding: '0.4rem 0.9rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  deleteButton: {
    padding: '0.4rem 0.9rem',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  error: {
    color: '#dc2626',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '4rem 1rem',
    gap: '0.5rem',
  },
  emptyText: {
    margin: '0.75rem 0 0',
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#374151',
  },
  emptySubtext: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#6b7280',
  },
  emptyButton: {
    marginTop: '1rem',
    padding: '0.6rem 1.4rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  // Modal styles
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '2rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  modalTitle: {
    margin: '0 0 0.25rem',
    fontSize: '1rem',
    wordBreak: 'break-word',
  },
  modalHelperText: {
    margin: '0 0 1.25rem',
    fontSize: '0.8rem',
    color: '#6b7280',
  },
  input: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  },
  modalError: {
    color: '#dc2626',
    fontSize: '0.85rem',
    marginTop: '0.5rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.25rem',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  submitButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  sharesList: {
    marginBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '0.75rem',
  },
  sharesLabel: {
    margin: '0 0 0.4rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  shareRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.25rem 0',
  },
  shareEmail: {
    fontSize: '0.9rem',
    color: '#374151',
  },
  revokeButton: {
    padding: '0.25rem 0.65rem',
    backgroundColor: 'transparent',
    border: '1px solid #dc2626',
    color: '#dc2626',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  deleteMessage: {
    fontSize: '0.95rem',
    color: '#374151',
    margin: '0 0 1.5rem',
    lineHeight: '1.5',
  },
  confirmDeleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  modalMeta: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    marginBottom: '1rem',
  },
};

export default DocumentsPage;
