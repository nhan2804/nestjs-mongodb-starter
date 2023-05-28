import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Callback,
  Document,
  FilterQuery,
  Model,
  PopulateOptions,
  ProjectionType,
  QueryOptions,
  Types,
  UpdateQuery,
} from 'mongoose';
import { ERROR_CODE } from '../../constants/error.cons';
import { BaseDocument, BaseModel } from '../../models/base.schema';
import { ULog, UResult, UThrowError } from 'src/helper/ulti';
export type ID = string | Types.ObjectId;
@Injectable()
export class BaseService<T, S = T & Document> {
  protected model: Model<S>;
  constructor(
    // @InjectModel(BaseModel.name)
    model: Model<S>,
  ) {
    this.model = model;
  }
  changePosition(array: any[]) {
    const operates = array?.map((e) => {
      return {
        updateOne: {
          filter: { _id: new Types.ObjectId(e?._id) },
          update: {
            $set: { position: e?.position },
          },
        },
      };
    }) as any;

    return this.model.bulkWrite(operates);
  }

  async create(data: T, errorCallback = null) {
    try {
      const result = await this.model.create(data);
      return result;
    } catch (error) {
      errorCallback
        ? errorCallback(error, ERROR_CODE.TRY_CATCH)
        : UThrowError(
            error,
            ERROR_CODE.BAD_REQUEST,
            ERROR_CODE.BASE_CREATE_ERROR,
          );
    }
  }
  async countDocument(filter?: FilterQuery<T>) {
    return await this.model.countDocuments(filter);
  }
  async findAllWithPaginate(
    filter?: FilterQuery<T>,
    sort = {},
    page = 1,
    perPage = 20,
    populates?: PopulateOptions | Array<PopulateOptions> | any,
  ) {
    sort = !sort || Object.keys(sort).length === 0 ? { createdAt: -1 } : sort;

    // const result = await this.model
    //   .find(filter || {})
    //   .sort(sort)
    //   .skip(page)
    //   .limit(perPage)
    //   .exec();

    const getCount = this.model.countDocuments(filter);
    const getDocuments = this.model.find(
      filter,
      {},
      { limit: perPage, skip: (page - 1) * perPage },
    );
    if (sort) {
      getDocuments.sort(sort);
    }
    if (populates) {
      getDocuments.populate(populates);
    }

    const [documents, count] = await Promise.all([
      await getDocuments,
      await getCount,
    ]);
    const paginate = {
      count: count,
      totalPages: Math.ceil(count / perPage),
      perPage,
    };

    return { data: documents, paginate };
  }

  async updateOne(id: ID, data: T | { data: any }) {
    try {
      const result = await this.model.findByIdAndUpdate(id, data);
      return result;
    } catch (error) {}
  }

  async baseCreateArray(datas: T[], errorCallback = null) {
    try {
      const result = await this.model.insertMany(datas);
      if (!result || result.length <= 0) {
        return UResult(false, `${ERROR_CODE.NO_DATA_MATCH}`, result);
      }

      return UResult(true, '', result);
    } catch (error) {
      errorCallback
        ? errorCallback(error, ERROR_CODE.TRY_CATCH)
        : UThrowError(
            error,
            ERROR_CODE.BAD_REQUEST,
            ERROR_CODE.BASE_CREATE_ARRAY_ERROR,
          );
    }
  }

  async baseFilter(
    filter?: FilterQuery<T>,
    sort = {},
    page = 1,
    perPage = 20,
    populates?: PopulateOptions | Array<PopulateOptions> | any,
    errorCallback = null,
  ) {
    sort = !sort || Object.keys(sort).length === 0 ? { createdAt: -1 } : sort;
    try {
      const result = await this.model
        .find(filter || {})
        .sort(
          !sort || Object.keys(sort).length === 0 ? { createdAt: -1 } : sort,
        )
        .skip(page)
        .limit(perPage)
        .exec();

      const getCount = this.model.countDocuments(filter);
      const getDocuments = this.model.find(
        filter,
        {},
        { limit: perPage, skip: (page - 1) * perPage },
      );
      if (sort) {
        getDocuments.sort(sort);
      }
      if (populates) {
        getDocuments.populate(populates);
      }

      const [documents, count] = await Promise.all([
        await getDocuments,
        await getCount,
      ]);
      const paginate = {
        count: count,
        totalPages: Math.ceil(count / perPage),
        perPage,
      };
      if (!result || result.length <= 0) {
        return UResult(
          false,
          `${ERROR_CODE.NO_DATA_MATCH}`,
          documents,
          paginate,
        );
      }

      return UResult(true, '', documents, paginate);
    } catch (error) {
      throw new Error(error);
      // errorCallback
      //   ? errorCallback(error, ERROR_CODE.TRY_CATCH)
      //   : UThrowError(
      //       error,
      //       ERROR_CODE.BAD_REQUEST,
      //       ERROR_CODE.BASE_FILTER_ERROR,
      //     );
    }
  }
  findAll(
    filter: FilterQuery<S>,
    projection?: ProjectionType<S> | null | undefined,
    options?: QueryOptions<S> | null | undefined,
    sort?: {},
  ) {
    sort = !sort || Object.keys(sort).length === 0 ? { createdAt: -1 } : sort;
    return this.model
      .find(filter, projection, options)
      .sort(!sort || Object.keys(sort).length === 0 ? { createdAt: -1 } : sort);
  }
  findOne(...args: Parameters<Model<S>['findOne']>) {
    return this.model.findOne(...args);
  }
  async findOneById(id: ID, errorCallback = null) {
    try {
      const result = await this.model.findOne({ _id: id });
      if (!result) {
        return UResult(false, `${ERROR_CODE.NO_DATA_MATCH}`, result);
      }

      return UResult(true, '', result);
    } catch (error) {
      errorCallback
        ? errorCallback(error, ERROR_CODE.TRY_CATCH)
        : UThrowError(
            error,
            ERROR_CODE.BAD_REQUEST,
            ERROR_CODE.BASE_FIND_ONE_ERROR,
          );
    }
  }

  async baseUpdateMany(filter: T, values: T[], errorCallback = null) {
    try {
      const result = await this.model
        .updateMany(filter, [{ $set: values }])
        .exec();
      return UResult(
        result.modifiedCount > 0,
        result.modifiedCount > 0
          ? ''
          : result.matchedCount > 0
          ? `${ERROR_CODE.NO_DATA_CHANGE}`
          : `${ERROR_CODE.NO_DATA_MATCH}`,
        result,
      );
    } catch (error) {
      errorCallback
        ? errorCallback(error, ERROR_CODE.TRY_CATCH)
        : UThrowError(
            error,
            ERROR_CODE.BAD_REQUEST,
            ERROR_CODE.BASE_UPDATE_MANY_ERROR,
          );
    }
  }

  async baseUpdateArray(values: any[], errorCallback = null) {
    try {
      const result = await this.model.bulkWrite(values);
      return UResult(
        result.nModified > 0,
        result.nModified > 0
          ? ''
          : result.nMatched > 0
          ? `${ERROR_CODE.NO_DATA_CHANGE}`
          : `${ERROR_CODE.NO_DATA_MATCH}`,
        result,
      );
    } catch (error) {
      console.log(error);
      errorCallback
        ? errorCallback(error, ERROR_CODE.TRY_CATCH)
        : UThrowError(
            error,
            ERROR_CODE.BAD_REQUEST,
            ERROR_CODE.BASE_UPDATE_ARRAY_ERROR,
          );
    }
  }

  async baseUpdateOne(id: ID, data: UpdateQuery<S>, errorCallback = null) {
    if (data?._id) delete data?._id;
    try {
      const result = await this.model.findByIdAndUpdate(id, data, {
        new: true,
      });

      return UResult(
        !!result,
        !!result ? '' : `${ERROR_CODE.NO_DATA_MATCH}`,
        result,
      );
    } catch (error) {
      errorCallback
        ? errorCallback(error, ERROR_CODE.TRY_CATCH)
        : UThrowError(
            error,
            ERROR_CODE.BAD_REQUEST,
            ERROR_CODE.BASE_UPDATE_ONE_ERROR,
          );
    }
  }

  async baseDeleteMany(filter: FilterQuery<S>, errorCallback = null) {
    try {
      const result = await this.model.deleteMany(filter).exec();
      return UResult(
        result.deletedCount > 0,
        result.deletedCount > 0
          ? ''
          : `TABLE PROJECTS ${ERROR_CODE.NO_DATA_MATCH}`,
        result,
      );
    } catch (error) {
      errorCallback
        ? errorCallback(error, ERROR_CODE.TRY_CATCH)
        : UThrowError(
            error,
            ERROR_CODE.BAD_REQUEST,
            ERROR_CODE.BASE_DELETE_ONCE_ERROR,
          );
    }
  }

  async deleteOneById(id: ID) {
    return await this.model.deleteOne({ _id: id });
  }

  async deleteOne(id: ID, errorCallback = null) {
    try {
      const result = await this.model.deleteOne({ _id: id }).exec();
      return UResult(
        result.deletedCount > 0,
        result.deletedCount > 0
          ? ''
          : `TABLE PROJECTS ${ERROR_CODE.NO_DATA_MATCH}`,
        result,
      );
    } catch (error) {
      errorCallback
        ? errorCallback(error, ERROR_CODE.TRY_CATCH)
        : UThrowError(
            error,
            ERROR_CODE.BAD_REQUEST,
            ERROR_CODE.BASE_DELETE_MANY_ERROR,
          );
    }
  }
}
