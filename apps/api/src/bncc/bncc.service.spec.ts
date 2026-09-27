import { describe, expect, it } from 'vitest';
import { BnccService } from './bncc.service';

describe('BnccService', () => {
  it('retorna metadados completos para a paginação do catálogo', async () => {
    const prisma = {
      habilidadeBNCC: {
        count: () => Promise.resolve(21),
        findMany: () => Promise.resolve([]),
      },
      $transaction: (operations: Promise<unknown>[]) => Promise.all(operations),
    };
    const service = new BnccService(prisma as never, {} as never);
    await expect(service.skills({ page: 2, pageSize: 20 })).resolves.toEqual({
      data: [], meta: { page: 2, pageSize: 20, total: 21, totalPages: 2 },
    });
  });
});
