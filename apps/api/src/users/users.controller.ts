import { Body, Controller, Inject, Param, ParseUUIDPipe, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators';
import { UpdateUserStatusDto } from '../auth/dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  @Patch(':userId/status')
  @Roles(Role.ADMIN)
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  async update(@Param('userId', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: UpdateUserStatusDto, @Req() req: any) {
    const user = await this.users.updateStatus(req.user.sub, id, dto.active);
    return this.users.publicView(user);
  }
}
