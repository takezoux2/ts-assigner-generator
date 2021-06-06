// eslint-disable-next-line prettier/prettier
module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json"
    },
    jest: {
      setupFilesAfterEnv: ["jest-expect-message"]
    }
  },
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@test/(.*)$": "<rootDir>/test/$1"
  },
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testMatch: ["**/*.test.ts"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "deploy/"]
}
