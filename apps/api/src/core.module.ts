import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit/audit.service';
import { PrismaService } from './common/prisma.service';

@Global()
@Module({ providers: [PrismaService, AuditService], exports: [PrismaService, AuditService] })
export class CoreModule {}
