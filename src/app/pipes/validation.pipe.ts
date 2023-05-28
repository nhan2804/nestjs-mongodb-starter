import { PipeTransform, Injectable, BadGatewayException } from '@nestjs/common';
import { Types } from 'mongoose';
import { UThrowError } from 'src/helper/ulti';
import { ERROR_CODE } from '../constants/error.cons';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, Types.ObjectId> {
  transform(value: any): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      UThrowError({}, ERROR_CODE.BAD_REQUEST, ERROR_CODE.ID_NOT_VALID);
    }

    return new Types.ObjectId(value);
  }
}
export class ParseArrayObjectIdPipe implements PipeTransform<any, any> {
  transform(value: string[]): Types.ObjectId[] {
    for (const id of value) {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadGatewayException('Array Ids Not Valid');
      }
    }

    return value?.map((e) => new Types.ObjectId(e));
  }
}

@Injectable()
export class NotEmptyPipe implements PipeTransform<any, Types.ObjectId> {
  transform(value: any): Types.ObjectId {
    if (!value || Object.keys(value).length <= 0 || value.length <= 0) {
      UThrowError({}, ERROR_CODE.BAD_REQUEST, ERROR_CODE.FILTER_NOT_EMPTY);
    }

    return value;
  }
}
