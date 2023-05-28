import { Module } from '@nestjs/common';
import { __name__(sentenceCase)sService } from './__name__s.service';
import { __name__(sentenceCase)sController } from './__name__s.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { __name__(sentenceCase), __name__(sentenceCase)Schema } from './entities/__name__s.entity';

@Module({
  controllers: [__name__(sentenceCase)sController],
  providers: [__name__(sentenceCase)sService],
  imports: [
    MongooseModule.forFeature([{ name: __name__(sentenceCase).name, schema: __name__(sentenceCase)Schema }]),
  ],
})
export class __name__(sentenceCase)sModule {}
