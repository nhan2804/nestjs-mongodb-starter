import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AgentDocument = Agent & Document;

export enum AgentStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export enum ProxyProtocol {
  HTTP = 'http',
  SOCKS5 = 'socks5',
}

@Schema({
  _id: false,
})
export class VPNInfo {
  @Prop({ required: true, unique: true })
  ip: string;

  @Prop({ required: true })
  publicKey: string;

  @Prop()
  presharedKey?: string;

  @Prop()
  allowedIps?: string;
}

@Schema({
  _id: false,
})
export class ProxyInfo {
  @Prop({
    enum: ProxyProtocol,
    default: ProxyProtocol.HTTP,
  })
  protocol: ProxyProtocol;

  @Prop({
    default: 8080,
  })
  port: number;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  passwordHash: string;
}

@Schema({
  _id: false,
})
export class DeviceInfo {
  @Prop()
  hostname: string;

  @Prop()
  os: string;

  @Prop()
  cpuModel: string;

  @Prop()
  cpuCores: number;

  @Prop()
  ramGB: number;
}

@Schema({
  collection: 'agents',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Agent {
  /**
   * Hardware Fingerprint
   * SHA256(CPU + BIOS + Disk...)
   */
  @Prop({
    required: true,
    unique: true,
    immutable: true,
    index: true,
  })
  hardwareId: string;

  /**
   * UUID của Agent
   */
  @Prop({
    required: true,
    unique: true,
    immutable: true,
    index: true,
  })
  clientId: string;

  /**
   * Hiển thị
   */
  @Prop()
  name?: string;

  @Prop()
  avatar?: string;

  /**
   * Phòng khám
   */
  @Prop({
    index: true,
  })
  clinicId?: string;

  /**
   * Region để filter
   */
  @Prop({
    index: true,
  })
  region?: string;

  @Prop({
    type: VPNInfo,
    required: true,
  })
  vpn: VPNInfo;

  @Prop({
    type: ProxyInfo,
    required: true,
  })
  proxy: ProxyInfo;

  @Prop({
    type: DeviceInfo,
  })
  device?: DeviceInfo;

  /**
   * Phiên bản Agent
   */
  @Prop({
    required: true,
  })
  version: string;

  @Prop({
    type: [String],
    default: [],
  })
  tags: string[];

  /**
   * Disable thủ công
   */
  @Prop({
    enum: AgentStatus,
    default: AgentStatus.ACTIVE,
    index: true,
  })
  status: AgentStatus;

  /**
   * Thời điểm heartbeat cuối
   * Chỉ để hiển thị.
   * Redis mới quyết định online/offline.
   */
  @Prop()
  lastSeenAt?: Date;

  /**
   * Thời điểm đăng ký
   */
  @Prop({
    default: Date.now,
  })
  registeredAt: Date;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);

AgentSchema.index({ 'vpn.ip': 1 }, { unique: true });
AgentSchema.index({ region: 1, status: 1 });
AgentSchema.index({ clinicId: 1, status: 1 });
AgentSchema.index({ tags: 1 });
