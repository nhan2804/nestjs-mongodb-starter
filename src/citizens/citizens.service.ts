import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AbstractService } from 'src/app/services/abstract.service';
import { Citizen, CitizenDocument } from './entities/citizens.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ExamRecord,
  ExamRecordDocument,
} from 'src/exam-records/entities/exam-records.entity';
import {
  ExamSession,
  ExamSessionDocument,
} from 'src/exam-sessions/entities/exam-sessions.entity';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';
import { AuditAction } from 'src/audit-logs/entities/audit-logs.entity';

export interface ImportCitizenRow {
  CCCD: string;
  fullName: string;
  day?: number | string;
  birthDate?: string;
  address?: string;
  village?: string;
  rawVillage?: string;
  carrer?: string;
  workplace?: string;
  father?: string;
  mother?: string;
  family?: string;
  note?: string;
  status?: any;
  type?: string;
  subType?: string;
  fileName?: string;
  index?: number;
  idx?: number;
  [key: string]: any;
}

@Injectable()
export class CitizensService extends AbstractService<Citizen> {
  constructor(
    @InjectModel(Citizen.name)
    readonly model: Model<CitizenDocument>,
    @InjectModel(ExamRecord.name)
    private readonly examRecordModel: Model<ExamRecordDocument>,
    @InjectModel(ExamSession.name)
    private readonly examSessionModel: Model<ExamSessionDocument>,
    private readonly auditLogsService: AuditLogsService,
  ) {
    super(model);
  }

  // Validate 12-digit CCCD with leading zeros
  private normalizeAndValidateCCCD(rawCCCD: any): {
    valid: boolean;
    cccd: string;
    error?: string;
  } {
    if (rawCCCD === null || rawCCCD === undefined) {
      return { valid: false, cccd: '', error: 'CCCD không được để trống' };
    }
    let cccd = String(rawCCCD).trim();
    // If user passed a number or string with fewer than 12 digits, pad leading zeros up to 12 if plausible
    if (/^\d{9,12}$/.test(cccd)) {
      cccd = cccd.padStart(12, '0');
    }
    if (!/^\d{12}$/.test(cccd)) {
      return {
        valid: false,
        cccd,
        error: `CCCD phải gồm đúng 12 chữ số (giá trị hiện tại: "${rawCCCD}")`,
      };
    }
    return { valid: true, cccd };
  }

  // Validate day with year and month into YYYY-MM-DD
  private resolveScheduledDate(
    dayRaw: any,
    year: number,
    month: number,
  ): { valid: boolean; dateStr: string; error?: string } {
    const day = Number(dayRaw);
    if (!day || isNaN(day) || day < 1 || day > 31) {
      return {
        valid: false,
        dateStr: '',
        error: `Ngày khám không hợp lệ: "${dayRaw}"`,
      };
    }

    const testDate = new Date(year, month - 1, day);
    if (
      testDate.getFullYear() !== year ||
      testDate.getMonth() !== month - 1 ||
      testDate.getDate() !== day
    ) {
      return {
        valid: false,
        dateStr: '',
        error: `Ngày ${day}/${month}/${year} không tồn tại trong lịch`,
      };
    }

    const mStr = String(month).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return { valid: true, dateStr: `${year}-${mStr}-${dStr}` };
  }

  async previewImport(dto: {
    sessionId: string;
    year: number;
    month: number;
    records: ImportCitizenRow[];
  }) {
    const { sessionId, year, month, records } = dto;
    if (!sessionId || !Types.ObjectId.isValid(sessionId)) {
      throw new BadRequestException('Session ID không hợp lệ');
    }
    const session = await this.examSessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Không tìm thấy phiên khám');
    }
    if (!year || !month || month < 1 || month > 12) {
      throw new BadRequestException('Năm và tháng không hợp lệ');
    }
    if (!Array.isArray(records) || records.length === 0) {
      throw new BadRequestException('Danh sách công dân import rỗng');
    }

    const validRows: any[] = [];
    const invalidRows: any[] = [];
    const seenCCCDs = new Set<string>();

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const cccdCheck = this.normalizeAndValidateCCCD(row.CCCD);
      if (!cccdCheck.valid) {
        invalidRows.push({ index: i + 1, row, error: cccdCheck.error });
        continue;
      }

      if (seenCCCDs.has(cccdCheck.cccd)) {
        invalidRows.push({
          index: i + 1,
          row,
          error: `CCCD ${cccdCheck.cccd} bị trùng lặp trong file`,
        });
        continue;
      }
      seenCCCDs.add(cccdCheck.cccd);

      const dateCheck = this.resolveScheduledDate(row.day, year, month);
      if (!dateCheck.valid) {
        invalidRows.push({ index: i + 1, row, error: dateCheck.error });
        continue;
      }

      validRows.push({
        ...row,
        normalizedCCCD: cccdCheck.cccd,
        resolvedDate: dateCheck.dateStr,
      });
    }

    // Check existing citizens and records in DB
    const cccdList = validRows.map((r) => r.normalizedCCCD);
    const existingCitizens = await this.model.find(
      { _id: { $in: cccdList } },
      { _id: 1 },
    );
    const existingCCCDSet = new Set(existingCitizens.map((c) => c._id));

    const existingRecords = await this.examRecordModel.find(
      {
        sessionId: new Types.ObjectId(sessionId),
        citizenId: { $in: cccdList },
      },
      { citizenId: 1, attendance: 1, photos: 1 },
    );
    const existingRecordSet = new Set(existingRecords.map((r) => r.citizenId));

    return {
      session: {
        id: session._id,
        name: session.name,
        year: session.year,
        phase: session.phase,
        serviceType: session.serviceType,
      },
      targetYear: year,
      targetMonth: month,
      totalRows: records.length,
      validCount: validRows.length,
      invalidCount: invalidRows.length,
      invalidRows: invalidRows.slice(0, 50), // first 50 errors for display
      newCitizensCount: validRows.filter(
        (r) => !existingCCCDSet.has(r.normalizedCCCD),
      ).length,
      existingCitizensCount: validRows.filter((r) =>
        existingCCCDSet.has(r.normalizedCCCD),
      ).length,
      newRecordsCount: validRows.filter(
        (r) => !existingRecordSet.has(r.normalizedCCCD),
      ).length,
      existingRecordsCount: validRows.filter((r) =>
        existingRecordSet.has(r.normalizedCCCD),
      ).length,
      previewItems: validRows.slice(0, 10),
    };
  }

  async executeImport(
    dto: {
      sessionId: string;
      year: number;
      month: number;
      records: ImportCitizenRow[];
    },
    user?: any,
  ) {
    const { sessionId, year, month, records } = dto;
    const preview = await this.previewImport(dto);

    if (preview.validCount === 0) {
      throw new BadRequestException('Không có bản ghi hợp lệ nào để import');
    }

    const sessionObjId = new Types.ObjectId(sessionId);
    const seenCCCDs = new Set<string>();

    let importedCitizens = 0;
    let updatedCitizens = 0;
    let createdRecords = 0;
    let preservedRecords = 0;

    for (const row of records) {
      const cccdCheck = this.normalizeAndValidateCCCD(row.CCCD);
      if (!cccdCheck.valid || seenCCCDs.has(cccdCheck.cccd)) continue;
      seenCCCDs.add(cccdCheck.cccd);

      const dateCheck = this.resolveScheduledDate(row.day, year, month);
      if (!dateCheck.valid) continue;

      const cccd = cccdCheck.cccd;
      const scheduledDate = dateCheck.dateStr;
      const village = (row.village || row.rawVillage || '').trim();

      // Upsert Citizen
      const citizenDoc = {
        _id: cccd,
        fullName: row.fullName?.trim() || '',
        birthDate: row.birthDate?.trim() || '',
        address: row.address?.trim() || '',
        village: village,
        rawVillage: row.rawVillage?.trim() || '',
        carrer: row.carrer?.trim() || '',
        workplace: row.workplace?.trim() || '',
        father: row.father?.trim() || '',
        mother: row.mother?.trim() || '',
        family: row.family?.trim() || '',
        originalNote: row.note?.trim() || '',
        status: row.status || null,
        type: row.type ? String(row.type) : '',
        subType: row.subType ? String(row.subType) : '',
        fileName: row.fileName || '',
        index: row.index !== undefined ? Number(row.index) : undefined,
        idx: row.idx !== undefined ? Number(row.idx) : undefined,
        rawData: row,
      };

      const existingCitizen = await this.model.findById(cccd);
      if (existingCitizen) {
        await this.model.updateOne({ _id: cccd }, { $set: citizenDoc });
        updatedCitizens++;
      } else {
        await this.model.create(citizenDoc);
        importedCitizens++;
      }

      // Upsert ExamRecord (PRESERVE existing attendance, photos, and note!)
      const existingRecord = await this.examRecordModel.findOne({
        citizenId: cccd,
        sessionId: sessionObjId,
      });

      if (existingRecord) {
        // Only update scheduledDate and village if needed, keep attendance, photos, note intact
        await this.examRecordModel.updateOne(
          { _id: existingRecord._id },
          {
            $set: {
              scheduledDate,
              village,
            },
          },
        );
        preservedRecords++;
      } else {
        await this.examRecordModel.create({
          citizenId: cccd,
          sessionId: sessionObjId,
          scheduledDate,
          village,
          attendance: {
            arrived: false,
            arrivedAt: null,
            arrivedBy: null,
          },
          note: '',
          photos: [],
        });
        createdRecords++;
      }
    }

    // Write audit log
    await this.auditLogsService.logAction({
      action: AuditAction.CITIZEN_IMPORT,
      entityType: 'exam_session',
      entityId: sessionId,
      actorId: user?._id || user?.sub || 'system',
      actorName: user?.fullName || user?.username || 'Quản trị viên',
      metadata: {
        totalRows: records.length,
        validCount: preview.validCount,
        importedCitizens,
        updatedCitizens,
        createdRecords,
        preservedRecords,
        month,
        year,
      },
    });

    return {
      message: 'Import dữ liệu công dân thành công',
      totalRows: records.length,
      validRows: preview.validCount,
      importedCitizens,
      updatedCitizens,
      createdRecords,
      preservedRecords,
    };
  }
}
