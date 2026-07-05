const FS = require('node:fs');
const PATH = require('node:path');

const ENV_DECLARATION_PATTERN =
  /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)?$/;
const ENV_EXAMPLE_FILE_NAME = '.env.example';
const VALID_MODES = new Set(['development', 'production', 'test']);

const hasValue = (VALUE) =>
  typeof VALUE === 'string' && VALUE.trim().length > 0;

const normalizeMode = (MODE) => {
  if (VALID_MODES.has(MODE)) {
    return MODE;
  }

  return 'development';
};

const normalizeEnvValue = (RAW_VALUE) => {
  const VALUE = RAW_VALUE.trim();
  const QUOTE = VALUE[0];

  if ((QUOTE === '"' || QUOTE === "'") && VALUE[VALUE.length - 1] === QUOTE) {
    return VALUE.slice(1, -1);
  }

  return VALUE;
};

const parseEnvLine = (LINE) => {
  const MATCH = LINE.match(ENV_DECLARATION_PATTERN);

  if (!MATCH) {
    return null;
  }

  return [MATCH[1], normalizeEnvValue(MATCH[2] ?? '')];
};

const parseEnvAssignments = (CONTENT) => {
  const ENV_VALUES = new Map();

  for (const LINE of CONTENT.split(/\r?\n/)) {
    const TRIMMED_LINE = LINE.trim();

    if (!TRIMMED_LINE || TRIMMED_LINE.startsWith('#')) {
      continue;
    }

    const ASSIGNMENT = parseEnvLine(LINE);

    if (!ASSIGNMENT) {
      continue;
    }

    const [NAME, VALUE] = ASSIGNMENT;
    ENV_VALUES.set(NAME, VALUE);
  }

  return ENV_VALUES;
};

const getEnvFileNames = (MODE) => {
  const NORMALIZED_MODE = normalizeMode(MODE);
  const ENV_FILE_NAMES = [`.env.${NORMALIZED_MODE}.local`];

  if (NORMALIZED_MODE !== 'test') {
    ENV_FILE_NAMES.push('.env.local');
  }

  ENV_FILE_NAMES.push(`.env.${NORMALIZED_MODE}`, '.env');

  return ENV_FILE_NAMES;
};

const loadEnvFiles = (PROJECT_ROOT, MODE) => {
  const ENV_VALUES = new Map();
  const LOADED_FILE_NAMES = [];

  for (const ENV_FILE_NAME of getEnvFileNames(MODE)) {
    const ENV_FILE_PATH = PATH.join(PROJECT_ROOT, ENV_FILE_NAME);

    if (!FS.existsSync(ENV_FILE_PATH)) {
      continue;
    }

    const FILE_VALUES = parseEnvAssignments(
      FS.readFileSync(ENV_FILE_PATH, 'utf8'),
    );
    LOADED_FILE_NAMES.push(ENV_FILE_NAME);

    for (const [NAME, VALUE] of FILE_VALUES) {
      if (ENV_VALUES.has(NAME) || Object.hasOwn(process.env, NAME)) {
        continue;
      }

      ENV_VALUES.set(NAME, VALUE);
    }
  }

  return {
    envValues: ENV_VALUES,
    loadedFileNames: LOADED_FILE_NAMES,
  };
};

const getRequiredEnvVars = (ENV_EXAMPLE_FILE_PATH) => {
  if (!FS.existsSync(ENV_EXAMPLE_FILE_PATH)) {
    throw new Error(`${ENV_EXAMPLE_FILE_NAME} was not found.`);
  }

  const ENV_EXAMPLE_VALUES = parseEnvAssignments(
    FS.readFileSync(ENV_EXAMPLE_FILE_PATH, 'utf8'),
  );

  return [...ENV_EXAMPLE_VALUES.keys()];
};

const getEnvValue = (NAME, ENV_VALUES) => {
  if (Object.hasOwn(process.env, NAME)) {
    return process.env[NAME];
  }

  return ENV_VALUES.get(NAME);
};

const getMissingEnvVars = (REQUIRED_ENV_VARS, ENV_VALUES) =>
  REQUIRED_ENV_VARS.filter((NAME) => !hasValue(getEnvValue(NAME, ENV_VALUES)));

module.exports = {
  ENV_EXAMPLE_FILE_NAME,
  getMissingEnvVars,
  getRequiredEnvVars,
  loadEnvFiles,
  normalizeMode,
};
