/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  transform: {
      "^.+\\.(ts|tsx)$": "ts-jest"
  },

  testMatch: [
      "**/test/?(*.)+(spec|test).[tj]s?(x)"
  ]

};