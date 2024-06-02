import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/app/services/abstract.service';
import { __name__(pascalCase), __name__(pascalCase)Document } from './entities/__name__s.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class __name__(pascalCase)sService extends AbstractService<__name__(pascalCase)> {
  constructor(
    @InjectModel(__name__(pascalCase).name)
    readonly model: Model<__name__(pascalCase)Document>,
  ) {
    super(model);
  }
}
