import { useEffect } from 'react';

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div style={styles.toast}>
      {message}
    </div>
  );
}

const styles = {
  toast: {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    backgroundColor: '#16a34a',
    color: '#fff',
    padding: '0.75rem 1.25rem',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontSize: '0.9rem',
    zIndex: 200,
  },
};

export default Toast;
