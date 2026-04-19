function UserAvatar({ email, dark = false }) {
  if (!email) return null;

  const parts = email.split('@')[0].split(/[._-]/);
  const initials = parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('');

  const wrapper = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const avatar = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: dark ? 'rgba(255,255,255,0.15)' : '#e5e7eb',
    color: dark ? '#fff' : '#374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '600',
    flexShrink: 0,
    cursor: 'default',
    border: 'none',
    padding: 0,
  };

  return (
    <div style={wrapper}>
      <button
        style={avatar}
        title={email}
        aria-label={`Signed in as ${email}`}
        tabIndex={0}
      >
        {initials}
      </button>
      <span className="avatar-email">{email}</span>
    </div>
  );
}

export default UserAvatar;
