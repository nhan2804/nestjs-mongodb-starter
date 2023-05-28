import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserLoggin } from 'src/auth/decorators/user';
import { User, UserDocument } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  //current user
  async create(@Body() req: User, @UserLoggin() user: UserDocument) {
    // Validate req
    // Ex: reset some fields if role of session not allow

    /*Check double xid [redis]*/
    const newUser = await this.usersService.create(req);

    return newUser;
  }
}
