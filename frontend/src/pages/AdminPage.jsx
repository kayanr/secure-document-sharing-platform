import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function AdminPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllDocuments();
  }, []);

  const fetchAllDocuments = async () => {
    try {
      const response = await api.get('/api/admin/documents');
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/api/admin/documents/${id}`);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      setError('Failed to delete document.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>SecureDoc — Admin</h1>
        <div style={styles.nav}>
          <button onClick={() => navigate('/documents')} style={styles.navButton}>
            My Documents
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <h2>All Documents</h2>

        {loading && <p>Loading...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {!loading && documents.length === 0 && (
          <p style={styles.empty}>No documents on the platform yet.</p>
        )}

        {documents.map((doc) => (
          <div key={doc.id} style={styles.card}>
            <div>
              <p style={styles.filename}>{doc.originalFilename}</p>
              <p style={styles.meta}>
                Owner: {doc.ownerEmail} &nbsp;•&nbsp;
                {(doc.fileSize / 1024).toFixed(1)} KB &nbsp;•&nbsp;
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(doc.id)}
              style={styles.deleteButton}
            >
              Delete
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
    backgroundColor: '#1e1e2e',
    color: '#fff',
  },
  title: {
    margin: 0,
    color: '#fff',
  },
  nav: {
    display: 'flex',
    gap: '0.75rem',
  },
  navButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    border: '1px solid #fff',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    color: '#ccc',
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
};

export default AdminPage;
