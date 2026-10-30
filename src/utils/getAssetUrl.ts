/** Adds an optional hosting prefix to a public asset's root-relative path. */
export const getAssetUrl = (path: `/${string}`): string => {
  const basePath = process.env.NEXT_PUBLIC_ASSET_BASE_PATH ?? '';

  return `${basePath}${path}`;
};
