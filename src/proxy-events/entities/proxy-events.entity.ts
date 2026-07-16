import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProxyEventDocument = ProxyEvent & Document;

export enum ProxyEventType {
  ACQUIRED = 'acquired',
  RELEASED = 'released',

  HEARTBEAT = 'heartbeat',

  AGENT_ONLINE = 'agent_online',
  AGENT_OFFLINE = 'agent_offline',

  WORKER_STARTED = 'worker_started',
  WORKER_STOPPED = 'worker_stopped',
  WORKER_CRASHED = 'worker_crashed',

  LOCK_CREATED = 'lock_created',
  LOCK_RELEASED = 'lock_released',
  LOCK_EXPIRED = 'lock_expired',

  PROXY_ERROR = 'proxy_error',

  TIMEOUT = 'timeout',
}

@Schema({
  collection: 'proxy-events',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ProxyEvent {
  /**
   * Allocation liên quan
   */
  @Prop({
    required: true,
    index: true,
  })
  allocationId: string;

  /**
   * Agent
   */
  @Prop({
    index: true,
  })
  agentId?: string;

  /**
   * Worker
   */
  @Prop({
    index: true,
  })
  workerId?: string;

  /**
   * Account
   */
  @Prop({
    index: true,
  })
  accountId?: string;

  /**
   * VPN IP
   */
  @Prop({
    index: true,
  })
  vpnIp?: string;

  /**
   * Event Type
   */
  @Prop({
    required: true,
    enum: ProxyEventType,
    index: true,
  })
  type: ProxyEventType;

  /**
   * Message ngắn
   */
  @Prop()
  message?: string;

  /**
   * Metadata
   */
  @Prop({
    type: Object,
    default: {},
  })
  metadata?: Record<string, any>;

  /**
   * Thời điểm event xảy ra
   */
  @Prop({
    default: Date.now,
    index: true,
  })
  eventAt: Date;
}

export const ProxyEventSchema = SchemaFactory.createForClass(ProxyEvent);

ProxyEventSchema.index({ allocationId: 1, eventAt: 1 });

ProxyEventSchema.index({ agentId: 1, eventAt: -1 });

ProxyEventSchema.index({ workerId: 1, eventAt: -1 });

ProxyEventSchema.index({ accountId: 1, eventAt: -1 });

ProxyEventSchema.index({ type: 1, eventAt: -1 });
ProxyEventSchema.index(
  { eventAt: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 90,
  },
);
