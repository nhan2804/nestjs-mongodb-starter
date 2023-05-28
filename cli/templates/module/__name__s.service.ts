import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/app/services/abstract.service';
import { __name__(sentenceCase), __name__(sentenceCase)Document } from './entities/__name__s.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class __name__(sentenceCase)sService extends AbstractService<__name__(sentenceCase)> {
  constructor(
    @InjectModel(__name__(sentenceCase).name)
    readonly model: Model<__name__(sentenceCase)Document>,
  ) {
    super(model);
  }
}
