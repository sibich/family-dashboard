// jest.config.ts
import type { Config } from 'jest'

const config: Config = {
  collectCoverage: true,
  coverageDirectory: './coverage',
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    }
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    // This allows Jest to understand your "@/" imports
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    // Transform typescript files
    '^.+\\.tsx?$': ['ts-jest', {
        tsconfig: 'tsconfig.json',
    }],
  },
}

export default config