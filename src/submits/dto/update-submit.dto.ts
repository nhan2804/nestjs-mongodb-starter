import { PartialType } from '@nestjs/mapped-types';
import { CreateSubmitDto } from './create-submit.dto';

export class UpdateSubmitDto extends PartialType(CreateSubmitDto) {}
