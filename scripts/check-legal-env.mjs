const required = [
  'COMPANY_NUMBER',
  'COMPANY_JURISDICTION',
  'COMPANY_REGISTERED_OFFICE',
  'CONTACT_EMAIL',
];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(`PRODUCTION BUILD BLOCKED: missing ${missing.join(', ')}.`);
  console.error('These details must come from verified company records; values are never inferred.');
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.CONTACT_EMAIL)) {
  console.error('PRODUCTION BUILD BLOCKED: CONTACT_EMAIL is not an email address.');
  process.exit(1);
}
console.log('Legal environment fields present (NOT a Companies House validation).');
