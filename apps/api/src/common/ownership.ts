import { ForbiddenException } from '@nestjs/common';

export function requireOwnership(actorId: string, ownerId: string): void {
  if (actorId !== ownerId) throw new ForbiddenException('Resource ownership is required');
}
