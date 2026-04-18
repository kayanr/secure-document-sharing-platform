import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '../services/documentService';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ALLOWED_TYPES = ['application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'image/jpeg', 'image/png'];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && !ALLOWED_TYPES.includes(selected.type)) {
      setError('File type not allowed. Accepted types: PDF, DOCX, TXT, JPG, PNG');
      setFile(null);
      e.target.value = '';
      return;
    }
    setFile(selected);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await uploadDocument(file);
      navigate('/documents');
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>SecureDoc</h1>
      </div>

      <div style={styles.content}>
        <h2>Upload Document</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.dropzone}>
            <p style={styles.dropzoneText}>Select a file to upload</p>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
            {file && (
              <p style={styles.selectedFile}>
                Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => navigate('/documents')}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={styles.uploadButton}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
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
    padding: '1rem 2rem',
    backgroundColor: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  title: {
    margin: 0,
  },
  content: {
    maxWidth: '500px',
    margin: '2rem auto',
    padding: '0 1rem',
  },
  form: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  dropzone: {
    border: '2px dashed #ccc',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center',
  },
  dropzoneText: {
    margin: '0 0 1rem',
    color: '#555',
  },
  fileInput: {
    cursor: 'pointer',
  },
  selectedFile: {
    marginTop: '0.75rem',
    fontSize: '0.875rem',
    color: '#555',
  },
  error: {
    color: '#dc2626',
    fontSize: '0.875rem',
    margin: 0,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  },
  cancelButton: {
    padding: '0.6rem 1.2rem',
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  uploadButton: {
    padding: '0.6rem 1.2rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
};

export default UploadPage;
