import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProxyAllocationDocument = ProxyAllocation & Document;

export enum ProxyAllocationStatus {
  ACTIVE = 'active',
  RELEASED = 'released',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

@Schema({
  collection: 'proxy_allocations',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ProxyAllocation {
  /**
   * Account sử dụng proxy
   * VD:
   * zalo_abc
   * vncdc_xyz
   */
  @Prop({
    required: true,
    index: true,
  })
  accountId: string;

  /**
   * Worker đang chạy task
   */
  @Prop({
    required: true,
    index: true,
  })
  workerId: string;

  /**
   * Agent được cấp
   */
  @Prop({
    required: true,
    index: true,
  })
  agentId: string;

  /**
   * VPN IP
   */
  @Prop({
    required: true,
    index: true,
  })
  vpnIp: string;

  /**
   * Loại task
   * login
   * crawl
   * upload
   * ...
   */
  @Prop({
    index: true,
  })
  taskType?: string;

  /**
   * Trạng thái allocation
   */
  @Prop({
    enum: ProxyAllocationStatus,
    default: ProxyAllocationStatus.ACTIVE,
    index: true,
  })
  status: ProxyAllocationStatus;

  /**
   * Acquire lúc nào
   */
  @Prop({
    required: true,
    default: Date.now,
    index: true,
  })
  acquiredAt: Date;

  /**
   * Release lúc nào
   */
  @Prop()
  releasedAt?: Date;

  /**
   * Thời gian sử dụng (ms)
   */
  @Prop()
  durationMs?: number;

  /**
   * Thành công hay thất bại
   */
  @Prop()
  success?: boolean;

  /**
   * Lý do release
   *
   * completed
   * timeout
   * worker_crashed
   * agent_offline
   * manual
   */
  @Prop()
  releaseReason?: string;

  /**
   * Metadata mở rộng
   */
  @Prop({
    type: Object,
  })
  metadata?: Record<string, any>;
}

export const ProxyAllocationSchema =
  SchemaFactory.createForClass(ProxyAllocation);

ProxyAllocationSchema.index({ accountId: 1, acquiredAt: -1 });

ProxyAllocationSchema.index({ agentId: 1, acquiredAt: -1 });

ProxyAllocationSchema.index({ workerId: 1, acquiredAt: -1 });

ProxyAllocationSchema.index({ status: 1, acquiredAt: -1 });

ProxyAllocationSchema.index({ vpnIp: 1, acquiredAt: -1 });
