function UserAvatar({ email, dark = false }) {
  if (!email) return null;

  const parts = email.split('@')[0].split(/[._-]/);
  const initials = parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('');

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
  };

  return (
    <div style={avatar} title={email}>
      {initials}
    </div>
  );
}

export default UserAvatar;
