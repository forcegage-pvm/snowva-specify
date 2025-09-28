/* eslint-disable @typescript-eslint/no-require-imports */
// jest.config.js
const nextJest = require("next/jest")({
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.js",
    "<rootDir>/__tests__/setup/nextjs-app-router-setup.ts",
  ],
  testEnvironment: "jest-environment-jsdom",
  preset: "ts-jest/presets/default-esm",
  testMatch: [
    "**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)",
    "!**/__tests__/setup/**/*",
    "!**/__tests__/utils/**/*",
    "!**/e2e/**/*",
  ],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
    },
  },
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
    "^@/app/(.*)$": "<rootDir>/src/app/$1",
    "^@/features/(.*)$": "<rootDir>/src/features/$1",
    "^@/hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@/lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@/styles/(.*)$": "<rootDir>/src/styles/$1",
    "^@/data/(.*)$": "<rootDir>/src/data/$1",
    "^@/services/(.*)$": "<rootDir>/src/services/$1",
    "^@/types/(.*)$": "<rootDir>/src/types/$1",
    "^@/utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@/validation/(.*)$": "<rootDir>/src/validation/$1",
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = nextJest(customJestConfig);
