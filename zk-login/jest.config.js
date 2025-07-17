export default {
  testEnvironment: "node",
  transform: {},
  collectCoverageFrom: ["utils/**/*.js", "server/**/*.js"],
  testMatch: ["**/tests/**/*.test.js"],
  verbose: true,
  testTimeout: 30000,
};
