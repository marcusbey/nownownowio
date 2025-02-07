import type { Config } from '@jest/types';
import baseConfig from './jest.config';

const config: Config.InitialOptions = {
  ...baseConfig,
  testMatch: ['**/*.e2e.test.ts'],
  testTimeout: 60000,
  maxConcurrency: 1,
  maxWorkers: 1,
};

export default config;
