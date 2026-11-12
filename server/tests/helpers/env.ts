// Runs before every test file: deterministic, fast, never touches real services.
// NOTE: src/config/env.ts does NOT load .env when NODE_ENV=test, so a developer's real
// secrets/emails can never leak into tests. Every value the app needs is set here.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
process.env.MONGO_URI = 'mongodb://unused-in-tests';
process.env.EMAIL_USER = 'project@example.com';
process.env.EMAIL_PASS = 'test-pass';
process.env.CONTACT_EMAIL = 'project@example.com';
process.env.BCRYPT_ROUNDS = '4'; // fast hashing in tests
process.env.OTP_RESEND_COOLDOWN_SECONDS = '0';
process.env.ADMIN_EMAILS = 'admin@example.com';
