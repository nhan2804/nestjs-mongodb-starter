import { Injectable } from '@nestjs/common';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { BaseService } from 'src/app/controllers/services/base.service';
import { Option, OptionDocument } from './entities/option.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class OptionsService extends BaseService<Option> {
  constructor(
    @InjectModel(Option.name) readonly optionModel: Model<OptionDocument>,
  ) {
    super(optionModel);
  }
  changePos(array: any[]) {
    const operates = array?.map((e) => {
      return {
        updateOne: {
          filter: { _id: new Types.ObjectId(e?._id) },
          update: {
            $set: { postition: e?.postition },
          },
        },
      };
    });
    console.log({ operates });

    return this.optionModel.bulkWrite(operates);
  }
}
