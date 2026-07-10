const DEFAULT_MAX_SLUG_LENGTH = 48;
const BUG_TYPE_PATTERN = /bug|🐞/i;
const POLISH_TYPE_PATTERN = /polish/i;
const DOCS_TYPE_PATTERN = /\bdocs?\b|documentation/i;

export function getBranchPrefix(taskType) {
  if (BUG_TYPE_PATTERN.test(taskType)) {
    return 'bugfix';
  }

  if (POLISH_TYPE_PATTERN.test(taskType)) {
    return 'polish';
  }

  if (DOCS_TYPE_PATTERN.test(taskType)) {
    return 'docs';
  }

  return 'feature';
}

export function slugifyTitle(title, maxLength = DEFAULT_MAX_SLUG_LENGTH) {
  const slug = title
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, maxLength)
    .replace(/-+$/g, '');

  return slug || 'task';
}

export function getBranchName(taskType, title) {
  return `${getBranchPrefix(taskType)}/${slugifyTitle(title)}`;
}
