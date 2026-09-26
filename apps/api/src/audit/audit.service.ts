import { Injectable } from '@nestjs/common';
import { AuditResult, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(type: string, result: AuditResult, userId?: string, sessionId?: string, context?: Record<string, unknown>) {
    return this.logWith(this.prisma, type, result, userId, sessionId, context);
  }

  async logWith(client: Prisma.TransactionClient, type: string, result: AuditResult, userId?: string, sessionId?: string, context?: Record<string, unknown>) {
    return client.auditEvent.create({ data: { type, result, userId, sessionId, context: context as never } });
  }
}
