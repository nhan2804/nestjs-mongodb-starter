import { Module } from '@nestjs/common';
import { __name__(pascalCase)sService } from './__name__s.service';
import { __name__(pascalCase)sController } from './__name__s.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { __name__(pascalCase), __name__(pascalCase)Schema } from './entities/__name__s.entity';

@Module({
  controllers: [__name__(pascalCase)sController],
  providers: [__name__(pascalCase)sService],
  imports: [
    MongooseModule.forFeature([{ name: __name__(pascalCase).name, schema: __name__(pascalCase)Schema }]),
  ],
})
export class __name__(pascalCase)sModule {}
