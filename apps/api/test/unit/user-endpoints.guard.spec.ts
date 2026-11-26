import { afterEach, describe, expect, it } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { UserEndpointsGuard } from '../../src/common/guards/user-endpoints.guard';

const saved = { ...process.env };

describe('UserEndpointsGuard', () => {
  afterEach(() => {
    process.env = { ...saved };
  });

  it('autorise en développement', () => {
    process.env.NODE_ENV = 'development';
    expect(new UserEndpointsGuard().canActivate()).toBe(true);
  });

  it('refuse en production par défaut (routes non authentifiées)', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_UNAUTHENTICATED_USER_ENDPOINTS;
    expect(() => new UserEndpointsGuard().canActivate()).toThrow(ForbiddenException);
  });

  it('autorise en production seulement sur dérogation explicite', () => {
    process.env.NODE_ENV = 'production';
    process.env.ALLOW_UNAUTHENTICATED_USER_ENDPOINTS = 'true';
    expect(new UserEndpointsGuard().canActivate()).toBe(true);
  });
});
