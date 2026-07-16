import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/app/services/abstract.service';
import { ProxyAllocation, ProxyAllocationDocument } from './entities/proxy-allocations.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ProxyAllocationsService extends AbstractService<ProxyAllocation> {
  constructor(
    @InjectModel(ProxyAllocation.name)
    readonly model: Model<ProxyAllocationDocument>,
  ) {
    super(model);
  }
}
