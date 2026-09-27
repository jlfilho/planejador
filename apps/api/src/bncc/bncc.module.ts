import { Module } from '@nestjs/common';
import { BnccAdminController } from './bncc-admin.controller';
import { BnccController } from './bncc.controller';
import { BnccService } from './bncc.service';
@Module({ controllers: [BnccController, BnccAdminController], providers: [BnccService] })
export class BnccModule {}
