import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/app/controllers/services/base.service';
import { User, UserDocument } from './entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super(userModel);
  }
  async createUser(username: string, password: string): Promise<User> {
    return this.userModel.create({
      username,
      password,
    });
  }
  async findOnePublic(ID: string): Promise<UserDocument> {
    return this.userModel.findOne(
      { _id: ID },
      {
        password: 0,
        otp: 0,
      },
    );
  }
  async findOneV2(ID: string): Promise<User> {
    const cacheKey = `user_jwt_${ID}`;
    const cachedValue = await this.cacheManager.get<string>(cacheKey);
    if (cachedValue) {
      return JSON.parse(cachedValue);
    }
    const user = await this.userModel.findOne({ _id: ID }, { _id: 1, otp: 1 });
    if (!user) {
      throw new NotFoundException(`User with ID ${ID} not found`);
    }
    await this.cacheManager.set(cacheKey, JSON.stringify(user), 1000 * 60 * 5);
    return user;
  }

  async createUserFromSSO(data: {
    username: string;
    password: string;
    ssoId: string;
    ssoEmail: string;
    fullName: string;
  }): Promise<User> {
    return this.userModel.create(data);
  }
  async getUser(query: object): Promise<User> {
    return this.userModel.findOne(query);
  }
}
