import { Injectable, NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common/exceptions';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { nanoid } from 'nanoid';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.getUser({ username });
    if (!user) return null;
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!user) {
      throw new NotAcceptableException('could not find the user');
    }
    if (user && passwordValid) {
      return user;
    }
    return null;
  }
  async login(user: any) {
    const authSessionKey = nanoid(10);
    const payload = {
      username: user.username,
      sub: user._id,
      fullName: user?.fullName,
      otp: user?.otp,
      authSessionKey,
    };
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '1d',
      }),
      user,
      authSessionKey,
    };
  }
  async loginSSO(data: {
    ssoId: string;
    ssoEmail: string;
    ssoFullName: string;
  }) {
    const { ssoId, ssoEmail, ssoFullName } = data;
    const user = (await this.usersService.getUser({
      ssoId: ssoId,
    })) as UserDocument;
    console.log({ ssoId });

    if (user) {
      const payload = {
        username: user.username,
        sub: user._id,
      };
      return {
        access_token: this.jwtService.sign(payload, { expiresIn: '2 days' }),
        user,
        exist: true,
      };
    }
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash('nhan', saltOrRounds);
    const newUser = (await this.usersService.createUserFromSSO({
      ...data,
      fullName: ssoFullName + Math.random(),
      password: hashedPassword,
      username: 'user' + ssoId,
    })) as UserDocument;
    const payload = { username: newUser.username, sub: newUser._id };
    return {
      access_token: this.jwtService.sign(payload),
      user: newUser,
    };
  }
}
