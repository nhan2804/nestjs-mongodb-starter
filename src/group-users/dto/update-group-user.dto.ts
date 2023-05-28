import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupUserDto } from './create-group-user.dto';
import { GroupUser } from '../entities/group-user.entity';

export class UpdateGroupUserDto extends GroupUser {}
