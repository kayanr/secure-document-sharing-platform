function Header({ title = 'SecureDoc', dark = false, children }) {
  const header = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: dark ? '#1e1e2e' : '#fff',
    boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.1)',
  };

  const titleStyle = {
    margin: 0,
    color: dark ? '#fff' : '#111',
  };

  const nav = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  };

  return (
    <div style={header}>
      <h1 style={titleStyle}>{title}</h1>
      <div style={nav}>{children}</div>
    </div>
  );
}

export default Header;
