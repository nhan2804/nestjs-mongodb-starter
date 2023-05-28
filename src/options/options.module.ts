import { Module } from '@nestjs/common';
import { OptionsService } from './options.service';
import { OptionsController } from './options.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Option, OptionSchema } from './entities/option.entity';

@Module({
  controllers: [OptionsController],
  providers: [OptionsService],
  imports: [
    MongooseModule.forFeature([{ name: Option.name, schema: OptionSchema }]),
  ],
  exports: [OptionsService],
})
export class OptionsModule {}
