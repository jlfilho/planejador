import 'reflect-metadata';
import { describe, expect, it } from 'vitest'; import { CatalogQueryDto } from './dto/catalog-query.dto';
describe('catalog query defaults', () => { it('uses the documented pagination defaults', () => { const query = new CatalogQueryDto(); expect(query.page).toBe(1); expect(query.pageSize).toBe(20); }); });
