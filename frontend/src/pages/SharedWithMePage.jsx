import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSharedWithMe } from '../services/shareService';
import { downloadDocument } from '../services/documentService';
import { useAuth } from '../context/AuthContext';

function SharedWithMePage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout, currentUserEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSharedDocuments();
  }, []);

  const fetchSharedDocuments = async () => {
    try {
      const data = await getSharedWithMe();
      setDocuments(data);
    } catch (err) {
      setError('Failed to load shared documents.');
    } finally {
      setLoading(false);
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
          {currentUserEmail && <span style={styles.userEmail}>{currentUserEmail}</span>}
          <button onClick={() => navigate('/documents')} style={styles.navButton}>
            My Documents
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <h2>Shared With Me</h2>

        {loading && <p>Loading...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {!loading && documents.length === 0 && (
          <p style={styles.empty}>No documents have been shared with you yet.</p>
        )}

        {documents.map((doc) => (
          <div key={doc.id} style={styles.card}>
            <div>
              <p style={styles.filename}>{doc.originalFilename}</p>
              <p style={styles.meta}>
                Shared by: {doc.ownerEmail} &nbsp;•&nbsp;
                {(doc.fileSize / 1024).toFixed(1)} KB &nbsp;•&nbsp;
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => downloadDocument(doc.id, doc.originalFilename)}
              style={styles.downloadButton}
            >
              Download
            </button>
          </div>
        ))}
      </div>
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
  userEmail: {
    fontSize: '0.85rem',
    color: '#555',
    alignSelf: 'center',
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
  error: {
    color: '#dc2626',
  },
  empty: {
    color: '#888',
    marginTop: '1rem',
  },
  downloadButton: {
    padding: '0.4rem 0.9rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
  },
};

export default SharedWithMePage;
