#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { getBranchName } from './branch-name-utils.mjs';

const USAGE = [
  'Usage:',
  '  npm run workflow:branch -- --type "<task type>" --title "<task title>"',
  '  npm run workflow:branch -- --type "🐞 Bug" --title "Sitemap double slashes" --create',
].join('\n');

/**
 * Returns the value that follows a named CLI flag.
 *
 * @param {string[]} args - CLI arguments passed after the script name.
 * @param {string} name - Flag name to find, for example `--title`.
 * @returns {string | undefined} The flag value, or undefined when missing.
 */
function getArgValue(args, name) {
  const index = args.indexOf(name);

  if (index < 0) {
    return undefined;
  }

  return args[index + 1];
}

/**
 * Checks whether a named boolean CLI flag is present.
 *
 * @param {string[]} args - CLI arguments passed after the script name.
 * @param {string} name - Flag name to find, for example `--create`.
 * @returns {boolean} True when the flag is present.
 */
function hasArg(args, name) {
  return args.includes(name);
}

/**
 * Reads the current git worktree status in porcelain format.
 *
 * @returns {string} Empty string for a clean worktree, otherwise status lines.
 */
function getGitStatus() {
  return execFileSync('git', ['status', '--porcelain'], {
    encoding: 'utf8',
  }).trim();
}

/**
 * Creates a new branch only when the worktree is clean.
 *
 * @param {string} branchName - Branch name to create with `git switch -c`.
 * @throws {Error} When uncommitted changes are present.
 */
function createBranch(branchName) {
  const status = getGitStatus();

  if (status) {
    throw new Error(
      'Cannot create a workflow branch with uncommitted changes. Commit, stash, or clean them first.',
    );
  }

  execFileSync('git', ['switch', '-c', branchName], {
    stdio: 'inherit',
  });
}

/**
 * Parses CLI flags, prints the generated branch name, and optionally creates it.
 */
function run() {
  const args = process.argv.slice(2);
  const taskType = getArgValue(args, '--type');
  const title = getArgValue(args, '--title');

  if (hasArg(args, '--help') || !taskType || !title) {
    console.log(USAGE);
    process.exit(taskType && title ? 0 : 1);
  }

  const branchName = getBranchName(taskType, title);

  if (hasArg(args, '--create')) {
    createBranch(branchName);
  }

  console.log(branchName);
}

try {
  run();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
