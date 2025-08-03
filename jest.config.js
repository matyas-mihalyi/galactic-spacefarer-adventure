module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: ["srv/**/*.ts", "!srv/**/*.d.ts"],
  moduleNameMapper: {
    "#cds-models/(.*)": "<rootDir>/@cds-models/$1",
  },
};
