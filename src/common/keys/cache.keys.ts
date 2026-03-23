export const CACHE_KEYS = {
  systemConfigByCountry: (countryCode: string) =>
    `system-config:${countryCode}`,
  userInvalidatedVersion: (userId: string) =>
    `user:${userId}:invalidated-version`,
};
