import { Authorize, ROLES_KEY } from '../authenticate/rest/authorize.decorator';
import { Role } from '../../enum/role.enum';
import { RestEndpoint } from './rest-endpoint.decorator';

/**
 * Regression guard for a critical authorization bypass.
 *
 * The AuthorizationGuard reads role requirements from ROLES_KEY metadata and
 * early-returns `true` when none is present. Previously `Authorize()` wired up
 * the guard via UseGuards but never called SetMetadata(ROLES_KEY, roles), so
 * the guard saw no roles and let *every* authenticated caller through — a plain
 * USER could reach SUPER_ADMIN-only endpoints. These tests assert the metadata
 * is actually attached to the handler.
 */
describe('role metadata wiring', () => {
  // Nest's SetMetadata attaches metadata to the method function itself
  // (descriptor.value), which is exactly what the guard's Reflector reads via
  // context.getHandler().
  const rolesOn = (
    proto: Record<string, unknown>,
    key: string,
  ): Role[] | undefined => Reflect.getMetadata(ROLES_KEY, proto[key] as object);

  it('Authorize() attaches the required roles as ROLES_KEY metadata', () => {
    class Ctrl {
      handler() {}
    }
    Authorize([Role.ADMIN, Role.SUPER_ADMIN])(
      Ctrl.prototype,
      'handler',
      Object.getOwnPropertyDescriptor(Ctrl.prototype, 'handler')!,
    );

    expect(rolesOn(Ctrl.prototype, 'handler')).toEqual([
      Role.ADMIN,
      Role.SUPER_ADMIN,
    ]);
  });

  it('RestEndpoint({ roles }) attaches ROLES_KEY metadata', () => {
    class Ctrl {
      handler() {}
    }
    RestEndpoint({ summary: 's', roles: [Role.SUPER_ADMIN] })(
      Ctrl.prototype,
      'handler',
      Object.getOwnPropertyDescriptor(Ctrl.prototype, 'handler')!,
    );

    expect(rolesOn(Ctrl.prototype, 'handler')).toEqual([Role.SUPER_ADMIN]);
  });

  it('RestEndpoint({ kycVerified, roles }) still attaches ROLES_KEY metadata', () => {
    class Ctrl {
      handler() {}
    }
    RestEndpoint({ summary: 's', kycVerified: true, roles: [Role.USER] })(
      Ctrl.prototype,
      'handler',
      Object.getOwnPropertyDescriptor(Ctrl.prototype, 'handler')!,
    );

    expect(rolesOn(Ctrl.prototype, 'handler')).toEqual([Role.USER]);
  });
});
