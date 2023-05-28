import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/app/services/abstract.service';
import { Ticket, TicketDocument } from './entities/ticket.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TicketsService extends AbstractService<Ticket> {
  constructor(
    @InjectModel(Ticket.name)
    readonly model: Model<TicketDocument>,
  ) {
    super(model);
  }
}
