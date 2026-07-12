export const ROUTES = {
  LOBBY: '/',
  GAME: '/game',
  LEADERBOARD: '/leaderboard',
  LOGIN: '/login',
  SIGNUP: '/signup',
  ACCOUNT: '/account',
  HOW_TO_PLAY: '/how-to-play',
  PRIVACY: '/privacy',
  TERMS_OF_SERVICE: '/terms-of-service',
  BLOG: '/blog',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export const LOBBY_SETUP_QUERY = {
  param: 'setup',
  value: '1',
  href: `${ROUTES.LOBBY}?setup=1`,
} as const;

export const HIDDEN_ROUTES = [
  ROUTES.BLOG,
] as const satisfies readonly RoutePath[];

export const isHiddenRoute = (pathname: string): boolean =>
  (HIDDEN_ROUTES as readonly string[]).includes(pathname);
