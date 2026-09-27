import { describe, expect, it } from 'vitest';
import { assertQueryYear, assertStageYears } from './bncc.validation';
describe('BNCC years', () => { it('rejects years for early childhood', () => expect(() => assertQueryYear('EDUCACAO_INFANTIL', 1)).toThrow()); it('accepts EF range', () => expect(() => assertStageYears('ENSINO_FUNDAMENTAL', 1, 9)).not.toThrow()); });
