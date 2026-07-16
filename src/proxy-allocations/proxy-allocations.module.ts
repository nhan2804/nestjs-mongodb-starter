import { Module } from '@nestjs/common';
import { ProxyAllocationsService } from './proxy-allocations.service';
import { ProxyAllocationsController } from './proxy-allocations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProxyAllocation, ProxyAllocationSchema } from './entities/proxy-allocations.entity';

@Module({
  controllers: [ProxyAllocationsController],
  providers: [ProxyAllocationsService],
  imports: [
    MongooseModule.forFeature([{ name: ProxyAllocation.name, schema: ProxyAllocationSchema }]),
  ],
})
export class ProxyAllocationsModule {}
