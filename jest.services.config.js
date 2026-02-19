module.exports = {
  testEnvironment: "node",
  testMatch: [
    "**/__tests__/lib/services/**/*.test.[jt]s?(x)",
    "**/__tests__/app/api/services*.test.[jt]s?(x)",
    "**/__tests__/app/api/services/**/*.test.[jt]s?(x)",
  ],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/", "<rootDir>/another-story/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  moduleDirectories: ["node_modules", "<rootDir>/"],
}
