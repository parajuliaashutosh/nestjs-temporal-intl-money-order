const CACHE_KEY_PREFIX = 'money-order-cache';

export const CACHE_KEYS = {
  systemConfigByCountry: (countryCode: string) =>
    `${CACHE_KEY_PREFIX}:system-config:${countryCode}`,
  userInvalidatedVersion: (userId: string) =>
    `${CACHE_KEY_PREFIX}:user:${userId}:invalidated-version`,
  cronLeaderLock: (jobName: string) =>
    `${CACHE_KEY_PREFIX}:cron-leader-lock:${jobName}`,
};
