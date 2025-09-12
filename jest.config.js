/**
 * Jest configuration with optional coverage thresholds.
 * Enable coverage locally or in CI by setting env vars, e.g.:
 *   COVERAGE=1 COVERAGE_GLOBAL=75 npm test
 */

const asNum = (v, d) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  collectCoverage: Boolean(process.env.COVERAGE),
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/types.{ts,tsx}',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      statements: asNum(process.env.COVERAGE_STATEMENTS || process.env.COVERAGE_GLOBAL, 70),
      branches: asNum(process.env.COVERAGE_BRANCHES || process.env.COVERAGE_GLOBAL, 60),
      functions: asNum(process.env.COVERAGE_FUNCTIONS || process.env.COVERAGE_GLOBAL, 70),
      lines: asNum(process.env.COVERAGE_LINES || process.env.COVERAGE_GLOBAL, 70),
    },
  },
};

