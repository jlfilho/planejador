import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { N8nClient } from './n8n.client';
import { PlansService } from './plans.service';

@Module({ controllers: [PlansController], providers: [PlansService, N8nClient] })
export class PlansModule {}
