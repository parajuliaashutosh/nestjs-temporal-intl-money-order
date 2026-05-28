export const LOGIN_LOG_SERVICE = Symbol('LOGIN_LOG_SERVICE');
export const LOGIN_LOG_REPO = Symbol('LOGIN_LOG_REPO');

export type DeviceInfo = {
  isMobile: boolean;
  isDesktop: boolean;
  os: string;
  browser: string;
};

export type IpInfoApiResponse = {
  loc?: string;
  city?: string;
  region?: string;
  country?: string;
  org?: string;
  timezone?: string;
};

export interface IpInfoLocationData {
  location?: string;
  city?: string;
  region?: string;
  country?: string;
  asn?: string;
  timezone?: string;
}
