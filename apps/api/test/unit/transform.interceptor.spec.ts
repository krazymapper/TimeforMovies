import { describe, expect, it } from 'vitest';
import { lastValueFrom, of } from 'rxjs';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';

const run = (data: unknown) =>
  lastValueFrom(new TransformInterceptor().intercept({} as never, { handle: () => of(data) }) as never);

describe('TransformInterceptor', () => {
  it('enveloppe les réponses dans { success, data }', async () => {
    expect(await run({ id: 1 })).toEqual({ success: true, data: { id: 1 } });
  });

  it('ne ré-enveloppe pas une réponse déjà formatée', async () => {
    const already = { success: false, error: { code: 'X', message: 'y' } };
    expect(await run(already)).toBe(already);
  });
});
