import { Injectable } from '@nestjs/common';
import {
  Document,
  FilterQuery,
  Model,
  PopulateOptions,
  ProjectionType,
  QueryOptions,
  Types,
} from 'mongoose';
export type ID = string | Types.ObjectId;
@Injectable()
export class AbstractService<T, S = T & Document> {
  protected model: Model<S>;
  constructor(
    // @InjectModel(BaseModel.name)
    model: Model<S>,
  ) {
    this.model = model;
  }

  async create(data: T) {
    const result = await this.model.create(data);
    return result;
  }
  async countDocument(filter?: FilterQuery<T>) {
    return await this.model.countDocuments(filter);
  }
  async findAllWithPaginate(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<S> | null | undefined,
    sort = {},
    page = 1,
    perPage = 20,
    populates?: PopulateOptions | Array<PopulateOptions> | any,
  ) {
    sort = !sort || Object.keys(sort).length === 0 ? { createdAt: -1 } : sort;

    const getCount = this.model.countDocuments(filter);
    const getDocuments = this.model.find(filter, projection, {
      limit: perPage,
      skip: (page - 1) * perPage,
    });
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
    const result = await this.model.findByIdAndUpdate(id, data);
    return result;
  }

  async createArray(datas: T[]) {
    const result = await this.model.insertMany(datas);
    return result;
  }

  findAll(
    filter: FilterQuery<S>,
    projection?: ProjectionType<S> | null | undefined,
    options?: QueryOptions<S> | null | undefined,
    sort?: any,
  ) {
    sort = !sort || Object.keys(sort).length === 0 ? { createdAt: -1 } : sort;
    return this.model
      .find(filter, projection, options)
      .sort(!sort || Object.keys(sort).length === 0 ? { createdAt: -1 } : sort);
  }
  findOne(...args: Parameters<Model<S>['findOne']>) {
    return this.model.findOne(...args);
  }
  async findOneById(id: ID) {
    const result = await this.model.findOne({ _id: id });
    result;
  }

  async update(filter: T, values: T | T[]) {
    const result = await this.model.updateMany(filter, [{ $set: values }]);
    return result;
  }

  async updateMany(values: T[] | any) {
    const result = await this.model.bulkWrite(values);
    return result;
  }

  async deleteMany(filter: FilterQuery<S>) {
    const result = await this.model.deleteMany(filter);
    return result;
  }

  async deleteOneById(id: ID) {
    return await this.model.deleteOne({ _id: id });
  }

  async deleteOne(filter: FilterQuery<S>) {
    const result = await this.model.deleteOne(filter);
    return result;
  }
}
