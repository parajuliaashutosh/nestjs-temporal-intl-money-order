import { Controller, Inject, Post } from '@nestjs/common';
import { AUTH_SERVICE } from '../../auth.constant';
import type { AuthContract } from '../../contract/auth.contract';

@Controller('/auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: AuthContract) {}

  @Post('/login')
  async login() {
    this.authService.
    throw new Error('Not implemented');
  }
}
