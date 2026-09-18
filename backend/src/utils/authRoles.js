const normalizeRole = (value = '') => {
  const role = String(value || '').trim().toLowerCase();
  if (role === 'admin') return 'admin';
  return 'user';
};

const getAuthTable = (role) => {
  return normalizeRole(role) === 'admin' ? 'admins' : 'users';
};

module.exports = { normalizeRole, getAuthTable };
