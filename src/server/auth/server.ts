import 'server-only';

import { auth, currentUser } from '@clerk/nextjs/server';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export const requireUserId = async (): Promise<string> => {
  const { userId } = await auth();

  if (!userId) {
    throw new UnauthorizedError();
  }

  return userId;
};

export const getCurrentUser = currentUser;
