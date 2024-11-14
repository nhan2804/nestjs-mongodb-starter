import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/app/services/abstract.service';
import { Shorten, ShortenDocument } from './entities/shortens.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ShortensService extends AbstractService<Shorten> {
  constructor(
    @InjectModel(Shorten.name)
    readonly model: Model<ShortenDocument>,
  ) {
    super(model);
  }
}
