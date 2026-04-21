import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Auth } from '../../auth/entity/auth.entity';
import { LoginLogContract } from '../contract/login-log.contract';
import type { LoginLogRepoContract } from '../contract/login-log.repo.contract';
import { UserDeviceDataDTO } from '../dto/user-device-data.dto';
import {
  DeviceInfo,
  IpInfoApiResponse,
  IpInfoLocationData,
  LOGIN_LOG_REPO,
} from '../login-log.constant';
import { LoginLogModel } from '../model/login-log.model';

@Injectable()
export class LoginLogService implements LoginLogContract {
  logger = new Logger(LoginLogService.name);
  constructor(
    @Inject(LOGIN_LOG_REPO) private readonly loginLogRepo: LoginLogRepoContract,
    private readonly configService: ConfigService,
  ) {}

  public async createLoginLog(
    data: UserDeviceDataDTO,
    auth: Auth,
  ): Promise<void> {
    const deviceInfo = this.detectDevice(data.userAgent);
    const ipInfo = await this.findInfoByIp(data.clientIp);

    const entity: LoginLogModel = {
      loginAt: new Date(),
      auth: auth,
      ip: data.clientIp,
      city: ipInfo?.city,
      region: ipInfo?.region,
      country: ipInfo?.country,
      asn: ipInfo?.asn,
      timezone: ipInfo?.timezone,

      browser: deviceInfo.browser,
      os: deviceInfo.os,
      deviceId: data.deviceId,
      location: ipInfo?.location,

      rawUserAgent: data.userAgent,
    };
    await this.loginLogRepo.create(entity);
  }

  private detectDevice(ua: string): DeviceInfo {
    const device: DeviceInfo = {
      isMobile: false,
      isDesktop: true,
      os: 'Unknown',
      browser: 'Unknown',
    };

    // ---- Device Type ----
    device.isMobile = /Mobi|Android|iPhone/i.test(ua);
    device.isDesktop = !device.isMobile;

    // ---- OS (order matters!) ----
    if (/Android/i.test(ua)) device.os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) device.os = 'iOS';
    else if (/Windows NT/i.test(ua)) device.os = 'Windows';
    else if (/Mac OS X/i.test(ua)) device.os = 'Mac OS';
    else if (/Linux/i.test(ua)) device.os = 'Linux';

    // ---- Browser (order matters!) ----
    if (/Edg/i.test(ua)) device.browser = 'Edge';
    else if (/OPR|Opera/i.test(ua)) device.browser = 'Opera';
    else if (/Chrome/i.test(ua)) device.browser = 'Chrome';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua))
      device.browser = 'Safari';
    else if (/Firefox/i.test(ua)) device.browser = 'Firefox';
    else if (/MSIE|Trident/i.test(ua)) device.browser = 'Internet Explorer';

    return device;
  }

  private async findInfoByIp(ip: string): Promise<IpInfoLocationData | null> {
    const ipInfoApiKey = this.configService.get<string>('IP_INFO_API_KEY');
    if (ipInfoApiKey) {
      try {
        const response = await fetch(
          `https://ipinfo.io/${ip}?token=${ipInfoApiKey}`,
        );
        const data = (await response.json()) as IpInfoApiResponse;

        const resp: IpInfoLocationData = {
          location: data?.loc,
          city: data?.city,
          region: data?.region,
          country: data?.country,
          asn: data?.org,
          timezone: data?.timezone,
        };
        return resp;
      } catch (err: any) {
        const message =
          err instanceof Error
            ? err.message
            : typeof err === 'string'
              ? err
              : JSON.stringify(err);
        this.logger.error(`Failed to fetch IP info for ${ip}: ${message}`);
        return null;
      }
    }
    return null;
  }
}
