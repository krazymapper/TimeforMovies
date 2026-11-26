import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

function host() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const h = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url: '/api/v1/media/movie/1' }),
    }),
  };
  return { h: h as never, status, json };
}

describe('HttpExceptionFilter', () => {
  it('envoie bien une réponse (régression : le corps n’était plus envoyé)', () => {
    const { h, status, json } = host();
    new HttpExceptionFilter().catch(new NotFoundException('Film introuvable'), h);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledTimes(1);
    const body = json.mock.calls[0][0];
    expect(body).toMatchObject({ success: false, path: '/api/v1/media/movie/1' });
    expect(body.error.message).toBe('Film introuvable');
  });

  it('associe un code d’erreur au statut HTTP', () => {
    const cases: Array<[HttpException, string]> = [
      [new BadRequestException(), 'VALIDATION_ERROR'],
      [new HttpException('x', HttpStatus.TOO_MANY_REQUESTS), 'RATE_LIMIT_EXCEEDED'],
      [new HttpException('x', HttpStatus.FORBIDDEN), 'FORBIDDEN'],
    ];
    for (const [exc, code] of cases) {
      const { h, json } = host();
      new HttpExceptionFilter().catch(exc, h);
      expect(json.mock.calls[0][0].error.code).toBe(code);
    }
  });

  it('erreur inattendue : 500 sans fuite de détails hors développement', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const { h, status, json } = host();
    new HttpExceptionFilter().catch(new Error('secret interne'), h);
    process.env.NODE_ENV = prev;
    expect(status).toHaveBeenCalledWith(500);
    const body = json.mock.calls[0][0];
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(body)).not.toContain('secret interne');
  });
});
