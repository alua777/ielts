function adminEmails() {
  return (process.env.ADMIN_EMAILS || 'admin@example.com')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmail(email) {
  return adminEmails().includes(String(email || '').toLowerCase());
}

function resolveRole(email, role = 'user') {
  return role === 'admin' || isAdminEmail(email) ? 'admin' : 'user';
}

module.exports = { adminEmails, isAdminEmail, resolveRole };
