import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  normalize(email: string) {
    return email.trim().toLowerCase();
  }

  async create(email: string, password: string, role: Role = Role.PROFESSOR) {
    return this.createWith(this.prisma, email, password, role);
  }

  async createWith(client: Pick<Prisma.TransactionClient, 'user'>, email: string, password: string, role: Role = Role.PROFESSOR) {
    this.assertPasswordPolicy(password);
    return client.user.create({ data: { email: this.normalize(email), passwordHash: await argon2.hash(password, { type: argon2.argon2id }), role } });
  }

  async verify(user: { passwordHash: string }, password: string) {
    return argon2.verify(user.passwordHash, password);
  }

  async byEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: this.normalize(email) } });
  }

  async byId(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async bootstrap(email: string, password: string) {
    this.assertPasswordPolicy(password);
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    return this.serializable(async (tx) => {
      if (await tx.user.findFirst({ where: { role: Role.ADMIN } })) throw new BadRequestException('An ADMIN already exists');
      return tx.user.create({ data: { email: this.normalize(email), passwordHash, role: Role.ADMIN } });
    });
  }

  async updateStatus(actorId: string, targetId: string, active: boolean) {
    return this.serializable(async (tx) => {
      const target = await tx.user.findUnique({ where: { id: targetId } });
      if (!target) throw new NotFoundException();
      if (!active && targetId === actorId) throw new BadRequestException('Cannot deactivate own account');
      if (!active && target.role === Role.ADMIN) {
        const count = await tx.user.count({ where: { role: Role.ADMIN, isActive: true } });
        if (count <= 1) throw new BadRequestException('At least one active ADMIN is required');
      }
      const user = await tx.user.update({ where: { id: targetId }, data: { isActive: active } });
      await this.audit.logWith(tx, 'USER_STATUS_CHANGED', 'SUCCESS', targetId, undefined, { actorId, active });
      return user;
    });
  }

  publicView(user: { id: string; email: string; role: Role; isActive: boolean }) {
    return { id: user.id, email: user.email, role: user.role, active: user.isActive };
  }

  private async serializable<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    try {
      return await this.prisma.$transaction(operation, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
        throw new BadRequestException('Concurrent account administration attempt; retry the operation');
      }
      throw error;
    }
  }

  private assertPasswordPolicy(password: string): void {
    if (typeof password !== 'string' || password.length < 12) {
      throw new BadRequestException('Password does not meet the minimum security policy');
    }
  }
}
