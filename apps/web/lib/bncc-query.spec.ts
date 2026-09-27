import { describe, expect, it } from 'vitest';
import { serializeQuery } from './bncc-query';

describe('serializeQuery', () => {
  it('preserva filtros combináveis e omite valores vazios', () => {
    expect(serializeQuery({ levelId: 'level', stageId: 'stage', axis: 'MUNDO_DIGITAL', q: 'rede', page: 2, pageSize: 20 })).toBe('levelId=level&stageId=stage&axis=MUNDO_DIGITAL&q=rede&page=2&pageSize=20');
    expect(serializeQuery({ q: '' })).toBe('');
  });
});
