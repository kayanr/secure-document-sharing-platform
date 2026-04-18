import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments, deleteDocument } from '../services/documentService';
import { shareDocument } from '../services/shareService';
import { useAuth } from '../context/AuthContext';

function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Share modal state
  const [shareDocId, setShareDocId] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [shareError, setShareError] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');
  const [shareLoading, setShareLoading] = useState(false);

  const { logout } = useAuth();
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      setError('Failed to delete document.');
    }
  };

  const openShareModal = (docId) => {
    setShareDocId(docId);
    setRecipientEmail('');
    setShareError('');
    setShareSuccess('');
  };

  const closeShareModal = () => {
    setShareDocId(null);
    setRecipientEmail('');
    setShareError('');
    setShareSuccess('');
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setShareError('');
    setShareSuccess('');
    setShareLoading(true);
    try {
      await shareDocument(shareDocId, recipientEmail);
      setShareSuccess(`Shared with ${recipientEmail}`);
      setRecipientEmail('');
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
      <div style={styles.header}>
        <h1 style={styles.title}>SecureDoc</h1>
        <div style={styles.nav}>
          <button onClick={() => navigate('/shared-with-me')} style={styles.navButton}>
            Shared With Me
          </button>
          <button onClick={() => navigate('/documents/upload')} style={styles.uploadButton}>
            + Upload Document
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <h2>My Documents</h2>

        {loading && <p>Loading...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {!loading && documents.length === 0 && (
          <p style={styles.empty}>No documents yet. Upload your first one.</p>
        )}

        {documents.map((doc) => (
          <div key={doc.id} style={styles.card}>
            <div>
              <p style={styles.filename}>{doc.originalFilename}</p>
              <p style={styles.meta}>
                {(doc.fileSize / 1024).toFixed(1)} KB &nbsp;•&nbsp;
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <div style={styles.cardActions}>
              <button
                onClick={() => openShareModal(doc.id)}
                style={styles.shareButton}
              >
                Share
              </button>
              <button
                onClick={() => handleDelete(doc.id)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Share Modal */}
      {shareDocId && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Share Document</h3>
            <form onSubmit={handleShare}>
              <input
                type="email"
                placeholder="Recipient email address"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
                style={styles.input}
              />
              {shareError && <p style={styles.modalError}>{shareError}</p>}
              {shareSuccess && <p style={styles.modalSuccess}>{shareSuccess}</p>}
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  title: {
    margin: 0,
  },
  nav: {
    display: 'flex',
    gap: '0.75rem',
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
    maxWidth: '700px',
    margin: '2rem auto',
    padding: '0 1rem',
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
  filename: {
    margin: 0,
    fontWeight: '500',
  },
  meta: {
    margin: '0.25rem 0 0',
    fontSize: '0.8rem',
    color: '#888',
  },
  cardActions: {
    display: 'flex',
    gap: '0.5rem',
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
  empty: {
    color: '#888',
    marginTop: '1rem',
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
    margin: '0 0 1.25rem',
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
  modalSuccess: {
    color: '#16a34a',
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
};

export default DocumentsPage;
