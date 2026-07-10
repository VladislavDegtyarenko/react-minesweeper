const normalizeProfileValue = (value?: string | null): string | null => {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
};

export const getPublicUsername = (username?: string | null): string | null =>
  normalizeProfileValue(username);

export const canPublishUserScores = (username?: string | null): boolean =>
  getPublicUsername(username) != null;
