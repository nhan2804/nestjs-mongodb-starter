import { Module } from '@nestjs/common';
import { GroupUsersService } from './group-users.service';
import { GroupUsersController } from './group-users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupUser, GroupUserSchema } from './entities/group-user.entity';

@Module({
  controllers: [GroupUsersController],
  providers: [GroupUsersService],
  imports: [
    MongooseModule.forFeature([
      { name: GroupUser.name, schema: GroupUserSchema },
    ]),
  ],
})
export class GroupUsersModule {}
