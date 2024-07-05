import { Module } from '@nestjs/common';
import { ShortensService } from './shortens.service';
import { ShortensController } from './shortens.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Shorten, ShortenSchema } from './entities/shortens.entity';
import { ShortensRedirectController } from './shortens.redirect.controller';

@Module({
  controllers: [ShortensController, ShortensRedirectController],
  providers: [ShortensService],
  imports: [
    MongooseModule.forFeature([{ name: Shorten.name, schema: ShortenSchema }]),
  ],
})
export class ShortensModule {}
