import { ROLES_KEY } from '@/src/common/decorator/authenticate/rest/authorize.decorator';
import { Role } from '@/src/common/enum/role.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { AuthenticationGuard } from '@/src/common/guard/rest/authentication.guard';
import { AuthorizationGuard } from '@/src/common/guard/rest/authorization.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { SYSTEM_CONFIG_SERVICE } from '../../system-config.constant';
import { CreateSystemConfigReqDTO } from './dto/create-system-config-req.dto';
import { SystemConfigController } from './system-config.controller';

// ─────────────────────────────────────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────────────────────────────────────

const mockSystemConfigService = {
  createOrUpdateSystemConfig: jest.fn(),
  getSystemConfigByKey: jest.fn(),
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a fake ExecutionContext for guard unit tests.
 *
 * WHY a helper: ExecutionContext is just an interface — we never need a real
 * HTTP server to test guard logic. The helper lets each test declare only the
 * parts it cares about (roles on the handler, user on the request) without
 * repeating boilerplate.
 */
const buildExecutionContext = (
  allowedRoles: Role[],
  requestUser: { role: Role } | null,
): ExecutionContext => {
  // A plain function acts as the "handler". We attach metadata to it exactly
  // as @Authorize([...]) would via SetMetadata(ROLES_KEY, roles).
  const handler = () => {};
  Reflect.defineMetadata(ROLES_KEY, allowedRoles, handler);

  return {
    getHandler: () => handler,
    getClass: () => SystemConfigController,
    switchToHttp: () => ({
      getRequest: () => ({ user: requestUser }),
    }),
  } as unknown as ExecutionContext;
};

// ─────────────────────────────────────────────────────────────────────────────
// Suite
// ─────────────────────────────────────────────────────────────────────────────

describe('SystemConfigController', () => {
  let controller: SystemConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemConfigController],
      providers: [
        { provide: SYSTEM_CONFIG_SERVICE, useValue: mockSystemConfigService },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthorizationGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SystemConfigController>(SystemConfigController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 1. Route metadata — what roles are declared on the POST handler?
  //
  // WHY this section exists:
  //   Guards are overridden above (always return true) so we can test
  //   controller logic in isolation. That means we can't rely on a guard
  //   throwing 403 to verify access control in a unit test.
  //   Instead we inspect the metadata @Authorize() stamped onto the method —
  //   this is exactly what AuthorizationGuard reads at runtime via Reflector.
  //   If someone removes a role from @Authorize([...]) these tests fail,
  //   catching the mistake before it ships.
  // ───────────────────────────────────────────────────────────────────────────
  describe('POST /system-config — route metadata', () => {
    it('should require SUDO_ADMIN, SUPER_ADMIN, and ADMIN roles', () => {
      const roles = Reflect.getMetadata(ROLES_KEY, controller.register);

      expect(roles).toBeDefined();
      expect(roles).toContain(Role.SUDO_ADMIN);
      expect(roles).toContain(Role.SUPER_ADMIN);
      expect(roles).toContain(Role.ADMIN);
    });

    it('should NOT permit USER role on POST handler', () => {
      // This is the most important negative assertion in the file.
      // It documents the business rule: regular users must never write
      // system config. If Role.USER is ever accidentally added to
      // @Authorize([...]) this test catches it immediately.
      const roles = Reflect.getMetadata(ROLES_KEY, controller.register);

      expect(roles).not.toContain(Role.USER);
    });

    it('GET handler should have no role restriction', () => {
      // GET is public — no @Authorize decorator — so metadata is undefined.
      // We assert undefined explicitly so a future accidental @Authorize
      // on GET is caught here too.
      const roles = Reflect.getMetadata(ROLES_KEY, controller.getSystemConfig);

      expect(roles).toBeUndefined();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. AuthorizationGuard — unit tested in isolation
  //
  // WHY in isolation:
  //   Testing the guard separately from the controller means a failure
  //   points directly at the guard, not at some interaction between the two.
  //   We instantiate the real guard with a real Reflector so we're testing
  //   actual production code, not a mock.
  // ───────────────────────────────────────────────────────────────────────────
  describe('AuthorizationGuard', () => {
    let guard: AuthorizationGuard;

    // POST route allows these three roles
    const POST_ROLES = [Role.SUDO_ADMIN, Role.SUPER_ADMIN, Role.ADMIN];

    beforeEach(() => {
      // Real Reflector + real guard — no mocks here
      guard = new AuthorizationGuard(new Reflector());
    });

    it('should ALLOW SUDO_ADMIN', () => {
      const ctx = buildExecutionContext(POST_ROLES, { role: Role.SUDO_ADMIN });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should ALLOW SUPER_ADMIN', () => {
      const ctx = buildExecutionContext(POST_ROLES, { role: Role.SUPER_ADMIN });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should ALLOW ADMIN', () => {
      const ctx = buildExecutionContext(POST_ROLES, { role: Role.ADMIN });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should THROW forbidden when role is USER', () => {
      // AppException.forbidden is what your guard throws — we assert the exact
      // exception type rather than a generic Error so a refactor that changes
      // the exception type is immediately visible in tests.
      const ctx = buildExecutionContext(POST_ROLES, { role: Role.USER });
      expect(() => guard.canActivate(ctx)).toThrow(
        AppException.forbidden('NOT_PERMITTED'),
      );
    });

    it('should THROW forbidden when request has no user (unauthenticated)', () => {
      // This covers the case where AuthenticationGuard somehow passed but
      // left no user on the request — belt-and-suspenders protection.
      const ctx = buildExecutionContext(POST_ROLES, null);
      expect(() => guard.canActivate(ctx)).toThrow(
        AppException.forbidden('NOT_AUTHORIZED'),
      );
    });

    it('should PASS THROUGH when handler has no required roles (GET route)', () => {
      // When requiredRoles is undefined the guard returns true without
      // inspecting the user at all — this is the GET /system-config case.
      const ctx = buildExecutionContext([], { role: Role.USER });
      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 3. POST /system-config — controller logic
  // ───────────────────────────────────────────────────────────────────────────
  describe('register (POST /system-config)', () => {
    const countryCode = SupportedCountry.USA;
    const reqDTO: CreateSystemConfigReqDTO = {
      currency: SupportedCurrency.USD,
      exchangeRate: 1.5,
    };

    it('should call service with correctly mapped payload', async () => {
      mockSystemConfigService.createOrUpdateSystemConfig.mockResolvedValue({});

      await controller.register(countryCode, reqDTO);

      // We assert the exact object the service received — if the payload
      // mapping inside the controller changes, this catches it.
      expect(
        mockSystemConfigService.createOrUpdateSystemConfig,
      ).toHaveBeenCalledWith({
        countryCode,
        currency: reqDTO.currency,
        exchangeRate: reqDTO.exchangeRate,
      });
    });

    it('should return success response', async () => {
      mockSystemConfigService.createOrUpdateSystemConfig.mockResolvedValue({});

      const result = await controller.register(countryCode, reqDTO);

      expect(result.success).toBe(true);
      expect(result.message).toBe('System config created/updated successfully');
    });

    it('should propagate service errors', async () => {
      mockSystemConfigService.createOrUpdateSystemConfig.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.register(countryCode, reqDTO)).rejects.toThrow(
        'Service error',
      );
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 4. GET /system-config — controller logic
  // ───────────────────────────────────────────────────────────────────────────
  describe('getSystemConfig (GET /system-config)', () => {
    const countryCode = SupportedCountry.USA;

    it('should call service with the correct country code', async () => {
      mockSystemConfigService.getSystemConfigByKey.mockResolvedValue({});

      await controller.getSystemConfig(countryCode);

      expect(mockSystemConfigService.getSystemConfigByKey).toHaveBeenCalledWith(
        countryCode,
      );
    });

    it('should return success response with data', async () => {
      const mockConfig = {
        id: '123',
        countryCode: 'USA',
        currency: 'USD',
        exchangeRate: '1.5',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSystemConfigService.getSystemConfigByKey.mockResolvedValue(
        mockConfig,
      );

      const result = await controller.getSystemConfig(countryCode);

      expect(result.success).toBe(true);
      expect(result.message).toBe('System config fetched successfully');
      expect(result.data).toEqual(mockConfig);
    });

    it('should return null data when config not found', async () => {
      mockSystemConfigService.getSystemConfigByKey.mockResolvedValue(null);

      const result = await controller.getSystemConfig(countryCode);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should propagate service errors', async () => {
      mockSystemConfigService.getSystemConfigByKey.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(controller.getSystemConfig(countryCode)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
