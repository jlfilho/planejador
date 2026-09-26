import { describe, expect, it, vi } from 'vitest';
import { UsersService } from './users.service';

describe('UsersService bootstrap security', () => {
  it('rejects a weak ADMIN bootstrap password before opening a transaction', async () => {
    const prisma = { $transaction: vi.fn() };
    const users = new UsersService(prisma as never, {} as never);
    await expect(users.bootstrap('admin@example.com', 'short')).rejects.toThrow('Password does not meet');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
