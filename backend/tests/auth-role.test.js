const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeRole, getAuthTable } = require('../src/utils/authRoles');

test('normalizeRole keeps admin and user roles stable', () => {
  assert.equal(normalizeRole('admin'), 'admin');
  assert.equal(normalizeRole('user'), 'user');
  assert.equal(normalizeRole('ADMIN'), 'admin');
  assert.equal(normalizeRole('User'), 'user');
});

test('getAuthTable selects the correct database table', () => {
  assert.equal(getAuthTable('admin'), 'admins');
  assert.equal(getAuthTable('user'), 'users');
});
