#!/usr/bin/env node

const PATH = require('node:path');

const {
  ENV_EXAMPLE_FILE_NAME,
  getMissingEnvVars,
  getRequiredEnvVars,
  loadEnvFiles,
  normalizeMode,
} = require('./utils');

const MODE_FLAG = '--mode';
const PROJECT_ROOT = process.cwd();
const ENV_EXAMPLE_FILE_PATH = PATH.join(PROJECT_ROOT, ENV_EXAMPLE_FILE_NAME);

const getMode = (ARGS) => {
  const INLINE_MODE_ARG = ARGS.find((ARG) => ARG.startsWith(`${MODE_FLAG}=`));

  if (INLINE_MODE_ARG) {
    return normalizeMode(INLINE_MODE_ARG.slice(`${MODE_FLAG}=`.length));
  }

  const MODE_ARG_INDEX = ARGS.indexOf(MODE_FLAG);

  if (MODE_ARG_INDEX >= 0 && ARGS[MODE_ARG_INDEX + 1]) {
    return normalizeMode(ARGS[MODE_ARG_INDEX + 1]);
  }

  return normalizeMode(process.env.NODE_ENV ?? 'development');
};

const formatLoadedFiles = (LOADED_FILE_NAMES) => {
  if (!LOADED_FILE_NAMES.length) {
    return 'No local env files were found.';
  }

  return `Loaded ${LOADED_FILE_NAMES.join(', ')}.`;
};

try {
  const MODE = getMode(process.argv.slice(2));
  const REQUIRED_ENV_VARS = getRequiredEnvVars(ENV_EXAMPLE_FILE_PATH);
  const { envValues: ENV_VALUES, loadedFileNames: LOADED_FILE_NAMES } =
    loadEnvFiles(PROJECT_ROOT, MODE);
  const MISSING_ENV_VARS = getMissingEnvVars(REQUIRED_ENV_VARS, ENV_VALUES);

  if (MISSING_ENV_VARS.length) {
    console.error('[env] Error: missing required environment variables.');
    console.error(`[env] ${formatLoadedFiles(LOADED_FILE_NAMES)}`);
    console.error(`[env] Add these values from ${ENV_EXAMPLE_FILE_NAME}:`);
    console.error('');
    console.error(MISSING_ENV_VARS.map((NAME) => `  - ${NAME}`).join('\n'));
    console.error('');
    console.error(
      '[env] Add the missing values to .env.local or another Next env file before running dev/build.',
    );
    process.exit(1);
  }

  console.log(
    `[env] OK: ${REQUIRED_ENV_VARS.length} required environment variables are set for ${MODE}.`,
  );
  console.log(`[env] ${formatLoadedFiles(LOADED_FILE_NAMES)}`);
} catch (ERROR) {
  console.error('[env] Error: environment check could not run.');
  console.error(`[env] ${ERROR.message}`);
  process.exit(1);
}
