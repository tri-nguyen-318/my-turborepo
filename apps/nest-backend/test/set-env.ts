// Runs in each Jest worker before tests — sets env vars pointing at the test DB
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5435/test_db';
process.env.JWT_SECRET = 'test-jwt-secret-32-chars-minimum!!';
process.env.NODE_ENV = 'test';
