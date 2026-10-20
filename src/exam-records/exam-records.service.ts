import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AbstractService } from 'src/app/services/abstract.service';
import {
  ExamRecord,
  ExamRecordDocument,
  ExamPhoto,
} from './entities/exam-records.entity';
import { UpdateHealthExamDto } from './dto/update-health-exam.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';
import { AuditAction } from 'src/audit-logs/entities/audit-logs.entity';
import {
  ExamSession,
  ExamSessionDocument,
} from 'src/exam-sessions/entities/exam-sessions.entity';
import {
  Citizen,
  CitizenDocument,
} from 'src/citizens/entities/citizens.entity';
import { buildVietnameseRegex } from 'src/helper/vietnameseRegex';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
const sharp = require('sharp');

@Injectable()
export class ExamRecordsService extends AbstractService<ExamRecord> {
  private readonly logger = new Logger(ExamRecordsService.name);
  private readonly storageRoot: string;

  constructor(
    @InjectModel(ExamRecord.name)
    readonly model: Model<ExamRecordDocument>,
    @InjectModel(ExamSession.name)
    private readonly sessionModel: Model<ExamSessionDocument>,
    @InjectModel(Citizen.name)
    private readonly citizenModel: Model<CitizenDocument>,
    private readonly auditLogsService: AuditLogsService,
    private readonly configService: ConfigService,
  ) {
    super(model);
    const envRoot = this.configService.get<string>('PHOTO_STORAGE_ROOT');
    this.storageRoot = envRoot
      ? path.resolve(envRoot)
      : path.resolve(process.cwd(), 'storage');

    // Ensure uploads and trash root directories exist
    this.ensureDir(path.join(this.storageRoot, 'uploads'));
    this.ensureDir(path.join(this.storageRoot, 'trash'));
    this.ensureDir(path.join(this.storageRoot, 'backups'));
  }

  private ensureDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // --- ATTENDANCE MANAGEMENT ---

  async updateAttendance(
    id: string,
    arrived: boolean,
    user?: any,
  ): Promise<ExamRecordDocument> {
    const record = await this.model.findById(id).populate('citizen');
    if (!record) {
      throw new NotFoundException('Không tìm thấy hồ sơ khám');
    }

    const operatorName = user?.fullName || user?.username || 'Cán bộ điểm danh';
    const operatorId = user?._id?.toString() || user?.sub || 'operator';
    const beforeAttendance = { ...record.attendance };

    if (arrived) {
      // Do not overwrite original check-in timestamp if already arrived
      const arrivedAt =
        record.attendance?.arrived && record.attendance?.arrivedAt
          ? record.attendance.arrivedAt
          : new Date();

      record.attendance = {
        arrived: true,
        arrivedAt,
        arrivedBy: record.attendance?.arrivedBy || operatorName,
      };

      await record.save();

      await this.auditLogsService.logAction({
        action: AuditAction.ATTENDANCE_CHECK_IN,
        entityType: 'exam_record',
        entityId: id,
        actorId: operatorId,
        actorName: operatorName,
        before: beforeAttendance,
        after: record.attendance,
        metadata: {
          citizenId: record.citizenId,
          village: record.village,
          scheduledDate: record.scheduledDate,
        },
      });
    } else {
      // Undo attendance
      record.attendance = {
        arrived: false,
        arrivedAt: null,
        arrivedBy: null,
      };

      await record.save();

      await this.auditLogsService.logAction({
        action: AuditAction.ATTENDANCE_UNDO,
        entityType: 'exam_record',
        entityId: id,
        actorId: operatorId,
        actorName: operatorName,
        before: beforeAttendance,
        after: record.attendance,
        metadata: {
          citizenId: record.citizenId,
          village: record.village,
          scheduledDate: record.scheduledDate,
        },
      });
    }

    return record;
  }

  // --- NOTE MANAGEMENT ---

  async updateNote(
    id: string,
    note: string,
    user?: any,
  ): Promise<ExamRecordDocument> {
    const record = await this.model.findById(id).populate('citizen');
    if (!record) {
      throw new NotFoundException('Không tìm thấy hồ sơ khám');
    }

    const beforeNote = record.note;
    record.note = (note || '').trim();
    await record.save();

    await this.auditLogsService.logAction({
      action: AuditAction.RECORD_NOTE_UPDATE,
      entityType: 'exam_record',
      entityId: id,
      actorId: user?._id?.toString() || user?.sub || 'system',
      actorName: user?.fullName || user?.username || 'Cán bộ',
      before: { note: beforeNote },
      after: { note: record.note },
      metadata: {
        citizenId: record.citizenId,
      },
    });

    return record;
  }

  // --- HEALTH EXAMINATION WORKFLOW ---

  async updateHealthExam(
    id: string,
    dto: UpdateHealthExamDto,
    user?: any,
  ): Promise<ExamRecordDocument> {
    const record = await this.model.findById(id).populate('citizen');
    if (!record) {
      throw new NotFoundException('Không tìm thấy hồ sơ khám');
    }

    const beforeHealth = record.healthExam
      ? JSON.parse(JSON.stringify(record.healthExam))
      : null;

    const operatorName = user?.fullName || user?.username || 'Cán bộ y tế';
    const operatorId = user?._id?.toString() || user?.sub || 'system';

    const parseNum = (val: any) => {
      if (val === null || val === undefined || val === '') return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    const physical = {
      height: parseNum(dto.physical?.height),
      weight: parseNum(dto.physical?.weight),
      chest: parseNum(dto.physical?.chest),
    };

    record.healthExam = {
      physical,
      healthStatus: (dto.healthStatus || '').trim(),
      isQualified:
        dto.isQualified === true
          ? true
          : dto.isQualified === false
          ? false
          : null,
      isDisqualified:
        dto.isDisqualified === true
          ? true
          : dto.isDisqualified === false
          ? false
          : null,
      exemptCategory: (dto.exemptCategory || '').trim(),
      otherReason: (dto.otherReason || '').trim(),
      healthNote: (dto.healthNote || '').trim(),
      updatedAt: new Date(),
      updatedBy: operatorName,
    };

    await record.save();

    await this.auditLogsService.logAction({
      action: AuditAction.HEALTH_EXAM_UPDATE,
      entityType: 'exam_record',
      entityId: id,
      actorId: operatorId,
      actorName: operatorName,
      before: beforeHealth,
      after: record.healthExam,
      metadata: {
        citizenId: record.citizenId,
        village: record.village,
        scheduledDate: record.scheduledDate,
      },
    });

    return record;
  }

  // --- LOCAL PHOTO STORAGE & PHOTO WORKFLOWS ---

  async uploadPhoto(
    recordId: string,
    file: Express.Multer.File,
    user?: any,
  ): Promise<{ photo: ExamPhoto; record: ExamRecordDocument }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Không tìm thấy tệp ảnh tải lên');
    }

    const record = await this.model.findById(recordId);
    if (!record) {
      throw new NotFoundException('Không tìm thấy hồ sơ khám');
    }

    const session = await this.sessionModel.findById(record.sessionId);
    if (!session) {
      throw new NotFoundException('Không tìm thấy phiên khám liên kết');
    }

    // Process image with Sharp (normalize orientation and encode to JPEG)
    let processedBuffer: Buffer;
    try {
      processedBuffer = await sharp(file.buffer)
        .rotate() // auto-orient EXIF orientation
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
    } catch (err) {
      throw new BadRequestException(
        `Tệp hình ảnh không hợp lệ hoặc bị lỗi giải mã: ${err.message}`,
      );
    }

    const photoId = crypto.randomBytes(8).toString('hex');
    const year = session.year || new Date().getFullYear();
    const phase = session.phase || 'preliminary';
    const serviceType = session.serviceType || 'military';
    const sessionId = session._id.toString();
    const cccd = record.citizenId;

    // Structure: uploads/{year}/{phase}/{serviceType}/{sessionId}/{CCCD}/{photoId}.jpg
    const relDir = path.posix.join(
      'uploads',
      `${year}`,
      `${phase}`,
      `${serviceType}`,
      sessionId,
      cccd,
    );
    const relPath = path.posix.join(relDir, `${photoId}.jpg`);
    const fullDir = path.join(this.storageRoot, relDir);
    const fullPath = path.join(this.storageRoot, relPath);

    this.ensureDir(fullDir);

    // Save processed JPEG file to disk
    try {
      await fs.promises.writeFile(fullPath, processedBuffer);
    } catch (err) {
      this.logger.error(`Failed to write photo to disk: ${err.message}`);
      throw new InternalServerErrorException(
        'Lỗi lưu trữ ảnh vào ổ đĩa cục bộ',
      );
    }

    const activePhotos = (record.photos || []).filter((p) => !p.deletedAt);
    const isFirstActive = activePhotos.length === 0;

    const operatorName = user?.fullName || user?.username || 'Cán bộ chụp ảnh';
    const operatorId = user?._id?.toString() || user?.sub || 'operator';

    const newPhoto: ExamPhoto = {
      id: photoId,
      fileName: file.originalname || `${photoId}.jpg`,
      path: relPath,
      isPrimary: isFirstActive,
      capturedAt: new Date(),
      capturedBy: operatorName,
      deletedAt: null,
      deletedBy: null,
      trashPath: null,
    };

    // Append to record
    record.photos.push(newPhoto);

    try {
      await record.save();
    } catch (err) {
      // Partial failure handling: delete file on disk if DB save failed
      try {
        await fs.promises.unlink(fullPath);
      } catch (e) {}
      throw new InternalServerErrorException(
        'Lỗi lưu siêu dữ liệu ảnh vào cơ sở dữ liệu',
      );
    }

    // Write audit log
    await this.auditLogsService.logAction({
      action: AuditAction.PHOTO_UPLOAD,
      entityType: 'exam_record',
      entityId: recordId,
      actorId: operatorId,
      actorName: operatorName,
      after: newPhoto,
      metadata: {
        photoId,
        citizenId: record.citizenId,
        path: relPath,
      },
    });

    return { photo: newPhoto, record };
  }

  async getPhotoFilePath(
    recordId: string,
    photoId: string,
    isTrash = false,
  ): Promise<string> {
    const record = await this.model.findById(recordId);
    if (!record) {
      throw new NotFoundException('Không tìm thấy hồ sơ khám');
    }

    const photo = record.photos.find((p) => p.id === photoId);
    if (!photo) {
      throw new NotFoundException('Không tìm thấy ảnh');
    }

    const relPath = isTrash ? photo.trashPath : photo.path;
    if (!relPath) {
      throw new NotFoundException('Đường dẫn ảnh không tồn tại');
    }

    const fullPath = path.resolve(this.storageRoot, relPath);

    // Prevent path traversal
    if (!fullPath.startsWith(this.storageRoot)) {
      throw new BadRequestException('Đường dẫn ảnh không hợp lệ');
    }

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('Tệp ảnh vật lý không tồn tại trên ổ đĩa');
    }

    return fullPath;
  }

  async setPrimaryPhoto(
    recordId: string,
    photoId: string,
    user?: any,
  ): Promise<ExamRecordDocument> {
    const record = await this.model.findById(recordId);
    if (!record) {
      throw new NotFoundException('Không tìm thấy hồ sơ khám');
    }

    const targetPhoto = record.photos.find(
      (p) => p.id === photoId && !p.deletedAt,
    );
    if (!targetPhoto) {
      throw new NotFoundException(
        'Không tìm thấy ảnh hợp lệ để đặt làm ảnh chính',
      );
    }

    for (const p of record.photos) {
      if (!p.deletedAt) {
        p.isPrimary = p.id === photoId;
      }
    }

    await record.save();

    await this.auditLogsService.logAction({
      action: AuditAction.PHOTO_SET_PRIMARY,
      entityType: 'exam_record',
      entityId: recordId,
      actorId: user?._id?.toString() || user?.sub || 'operator',
      actorName: user?.fullName || user?.username || 'Cán bộ',
      metadata: { photoId, citizenId: record.citizenId },
    });

    return record;
  }

  async deletePhoto(
    recordId: string,
    photoId: string,
    user?: any,
  ): Promise<ExamRecordDocument> {
    const record = await this.model.findById(recordId);
    if (!record) {
      throw new NotFoundException('Không tìm thấy hồ sơ khám');
    }

    const photo = record.photos.find((p) => p.id === photoId && !p.deletedAt);
    if (!photo) {
      throw new NotFoundException('Không tìm thấy ảnh hoặc ảnh đã bị xóa');
    }

    const session = await this.sessionModel.findById(record.sessionId);
    const year = session?.year || new Date().getFullYear();
    const phase = session?.phase || 'preliminary';
    const serviceType = session?.serviceType || 'military';
    const sessionId = record.sessionId.toString();
    const cccd = record.citizenId;

    // Target trash path: trash/{year}/{phase}/{serviceType}/{sessionId}/{CCCD}/{photoId}.jpg
    const trashRelDir = path.posix.join(
      'trash',
      `${year}`,
      `${phase}`,
      `${serviceType}`,
      sessionId,
      cccd,
    );
    const trashRelPath = path.posix.join(trashRelDir, `${photoId}.jpg`);

    const srcFullPath = path.resolve(this.storageRoot, photo.path);
    const destFullPath = path.resolve(this.storageRoot, trashRelPath);

    this.ensureDir(path.dirname(destFullPath));

    // Move physical file to trash
    let fileMoved = false;
    if (fs.existsSync(srcFullPath)) {
      try {
        await fs.promises.rename(srcFullPath, destFullPath);
        fileMoved = true;
      } catch (err) {
        this.logger.error(`Failed to move file to trash: ${err.message}`);
        throw new InternalServerErrorException(
          'Không thể chuyển tệp ảnh vào thùng rác',
        );
      }
    }

    // Update metadata
    const operatorName = user?.fullName || user?.username || 'Cán bộ';
    const operatorId = user?._id?.toString() || user?.sub || 'operator';

    photo.deletedAt = new Date();
    photo.deletedBy = operatorName;
    photo.trashPath = trashRelPath;

    // If deleted photo was primary, assign primary to first active photo
    if (photo.isPrimary) {
      photo.isPrimary = false;
      const nextPrimary = record.photos.find(
        (p) => !p.deletedAt && p.id !== photoId,
      );
      if (nextPrimary) {
        nextPrimary.isPrimary = true;
      }
    }

    try {
      await record.save();
    } catch (err) {
      // Revert file move on failure
      if (fileMoved && fs.existsSync(destFullPath)) {
        try {
          await fs.promises.rename(destFullPath, srcFullPath);
        } catch (e) {}
      }
      throw new InternalServerErrorException(
        'Lỗi cập nhật siêu dữ liệu khi xóa ảnh',
      );
    }

    await this.auditLogsService.logAction({
      action: AuditAction.PHOTO_DELETE,
      entityType: 'exam_record',
      entityId: recordId,
      actorId: operatorId,
      actorName: operatorName,
      metadata: {
        photoId,
        citizenId: record.citizenId,
        trashPath: trashRelPath,
      },
    });

    return record;
  }

  async restorePhoto(
    recordId: string,
    photoId: string,
    user?: any,
  ): Promise<ExamRecordDocument> {
    const record = await this.model.findById(recordId);
    if (!record) {
      throw new NotFoundException('Không tìm thấy hồ sơ khám');
    }

    const photo = record.photos.find((p) => p.id === photoId && p.deletedAt);
    if (!photo) {
      throw new NotFoundException('Không tìm thấy ảnh đã xóa để khôi phục');
    }

    const trashFullPath = path.resolve(this.storageRoot, photo.trashPath || '');
    const uploadFullPath = path.resolve(this.storageRoot, photo.path);

    this.ensureDir(path.dirname(uploadFullPath));

    let fileMoved = false;
    if (fs.existsSync(trashFullPath)) {
      try {
        await fs.promises.rename(trashFullPath, uploadFullPath);
        fileMoved = true;
      } catch (err) {
        this.logger.error(`Failed to restore file from trash: ${err.message}`);
        throw new InternalServerErrorException(
          'Không thể khôi phục tệp ảnh từ thùng rác',
        );
      }
    }

    // Clear deleted metadata
    photo.deletedAt = null;
    photo.deletedBy = null;
    photo.trashPath = null;

    // Ensure valid primary photo state
    const hasPrimary = record.photos.some((p) => !p.deletedAt && p.isPrimary);
    if (!hasPrimary) {
      photo.isPrimary = true;
    }

    try {
      await record.save();
    } catch (err) {
      if (fileMoved && fs.existsSync(uploadFullPath)) {
        try {
          await fs.promises.rename(uploadFullPath, trashFullPath);
        } catch (e) {}
      }
      throw new InternalServerErrorException(
        'Lỗi cập nhật siêu dữ liệu khi khôi phục ảnh',
      );
    }

    await this.auditLogsService.logAction({
      action: AuditAction.PHOTO_RESTORE,
      entityType: 'exam_record',
      entityId: recordId,
      actorId: user?._id?.toString() || user?.sub || 'admin',
      actorName: user?.fullName || user?.username || 'Quản trị viên',
      metadata: {
        photoId,
        citizenId: record.citizenId,
        restoredPath: photo.path,
      },
    });

    return record;
  }

  async getDeletedPhotos(recordId?: string, sessionId?: string) {
    const filter: any = {};
    if (recordId) {
      filter._id = new Types.ObjectId(recordId);
    }
    if (sessionId) {
      filter.sessionId = new Types.ObjectId(sessionId);
    }
    filter['photos.deletedAt'] = { $ne: null };

    const records = await this.model.find(filter).populate('citizen');
    const result: any[] = [];

    for (const rec of records) {
      for (const p of rec.photos) {
        if (p.deletedAt) {
          result.push({
            photo: p,
            recordId: rec._id,
            citizenId: rec.citizenId,
            citizenName: (rec as any).citizen?.fullName || '',
            village: rec.village,
            scheduledDate: rec.scheduledDate,
          });
        }
      }
    }

    result.sort(
      (a, b) =>
        new Date(b.photo.deletedAt).getTime() -
        new Date(a.photo.deletedAt).getTime(),
    );
    return result;
  }

  // --- SUMMARY STATISTICS ---

  async getSummary(
    sessionId: string,
    scheduledDate?: string,
    village?: string,
  ) {
    if (!sessionId || !Types.ObjectId.isValid(sessionId)) {
      throw new BadRequestException('Session ID không hợp lệ');
    }
    const sessionObjId = new Types.ObjectId(sessionId);

    // Get distinct dates and villages for this session
    const [distinctDates, distinctVillages] = await Promise.all([
      this.model.distinct('scheduledDate', { sessionId: sessionObjId }),
      this.model.distinct('village', { sessionId: sessionObjId }),
    ]);

    distinctDates.sort();
    distinctVillages.sort();

    const matchFilter: any = { sessionId: sessionObjId };
    if (scheduledDate && scheduledDate !== 'all') {
      matchFilter.scheduledDate = scheduledDate;
    }
    if (village && village !== 'all') {
      matchFilter.village = village;
    }

    const records = await this.model.find(matchFilter, {
      attendance: 1,
      photos: 1,
      healthExam: 1,
    });

    let totalCitizens = records.length;
    let arrivedCount = 0;
    let photographedCount = 0;
    let totalPhotos = 0;
    let qualifiedCount = 0;
    let disqualifiedCount = 0;
    let examinedHealthCount = 0;

    for (const r of records) {
      if (r.attendance?.arrived) {
        arrivedCount++;
      }
      const activePhotos = (r.photos || []).filter((p) => !p.deletedAt);
      if (activePhotos.length > 0) {
        photographedCount++;
        totalPhotos += activePhotos.length;
      }
      if (r.healthExam?.isQualified === true) {
        qualifiedCount++;
        examinedHealthCount++;
      } else if (r.healthExam?.isDisqualified === true) {
        disqualifiedCount++;
        examinedHealthCount++;
      }
    }

    return {
      totalCitizens,
      arrivedCount,
      notArrivedCount: totalCitizens - arrivedCount,
      photographedCount,
      notPhotographedCount: totalCitizens - photographedCount,
      totalPhotos,
      qualifiedCount,
      disqualifiedCount,
      examinedHealthCount,
      notExaminedHealthCount: totalCitizens - examinedHealthCount,
      distinctDates,
      distinctVillages,
    };
  }

  // --- EXPORT HEALTH EXAM EXCEL ---

  async exportHealthExamExcel(query: any): Promise<Buffer> {
    const { sessionId, scheduledDate, village, status, search } = query;

    const filter: any = {};
    if (sessionId && Types.ObjectId.isValid(sessionId)) {
      filter.sessionId = new Types.ObjectId(sessionId);
    }

    if (scheduledDate && scheduledDate !== 'all') {
      filter.scheduledDate = scheduledDate;
    }

    if (village && village !== 'all') {
      filter.village = village;
    }

    // Status filter
    if (status === 'arrived') {
      filter['attendance.arrived'] = true;
    } else if (status === 'not_arrived') {
      filter['attendance.arrived'] = false;
    } else if (status === 'qualified') {
      filter['healthExam.isQualified'] = true;
    } else if (status === 'disqualified') {
      filter['healthExam.isDisqualified'] = true;
    } else if (status === 'examined_health') {
      filter.$or = [
        { 'healthExam.isQualified': true },
        { 'healthExam.isDisqualified': true },
      ];
    } else if (status === 'not_examined_health') {
      filter['healthExam.isQualified'] = { $ne: true };
      filter['healthExam.isDisqualified'] = { $ne: true };
    }

    // Search query on Citizen
    if (search && search.trim()) {
      const q = search.trim();
      const nameRegex = buildVietnameseRegex(q);
      const citizenSearch: any = {
        $or: [
          { fullName: { $regex: nameRegex } },
          { _id: { $regex: q, $options: 'i' } },
        ],
      };
      if (!isNaN(Number(q))) {
        citizenSearch.$or.push({ index: Number(q) }, { idx: Number(q) });
      }

      const matchingCitizens = await this.citizenModel.find(citizenSearch, {
        _id: 1,
      });
      const matchingCCCDs = matchingCitizens.map((c) => c._id);
      filter.citizenId = { $in: matchingCCCDs };
    }

    const records = await this.model.find(filter).populate('citizen');

    // Sắp xếp danh sách: theo Ngày khám, Thôn, STT công dân, Họ tên
    records.sort((a: any, b: any) => {
      if (a.scheduledDate !== b.scheduledDate) {
        return (a.scheduledDate || '').localeCompare(b.scheduledDate || '');
      }
      const vA = a.village || a.citizen?.village || '';
      const vB = b.village || b.citizen?.village || '';
      const vComp = vA.localeCompare(vB, 'vi');
      if (vComp !== 0) return vComp;

      const idxA = a.citizen?.index ?? a.citizen?.idx ?? 999999;
      const idxB = b.citizen?.index ?? b.citizen?.idx ?? 999999;
      if (idxA !== idxB) return idxA - idxB;

      return (a.citizen?.fullName || '').localeCompare(
        b.citizen?.fullName || '',
        'vi',
      );
    });

    const templatePath = path.resolve(
      process.cwd(),
      'excelTemplate',
      'heathExamTemplate.xlsx',
    );
    if (!fs.existsSync(templatePath)) {
      throw new NotFoundException(
        'Không tìm thấy tệp biểu mẫu heathExamTemplate.xlsx',
      );
    }

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const worksheet = workbook.worksheets[0] || workbook.getWorksheet('Sheet1');

    // Xóa các dòng mẫu trắng ban đầu từ dòng 7 trở đi
    const initialRowCount = Math.max(worksheet.rowCount, 25);
    for (let r = 7; r <= initialRowCount; r++) {
      const row = worksheet.getRow(r);
      for (let c = 1; c <= 12; c++) {
        row.getCell(c).value = null;
        row.getCell(c).border = null;
      }
    }

    const borderStyle = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    const fontStyle = { name: 'Times New Roman', size: 11 };

    records.forEach((record: any, index: number) => {
      const r = 7 + index;
      const row = worksheet.getRow(r);
      row.height = 24;

      const citizen = record.citizen || {};
      const health = record.healthExam || {};
      const phys = health.physical || {};

      const stt = citizen.idx || citizen.index || index + 1;
      const fullName = citizen.fullName || '';
      const birthDate = citizen.birthDate ? String(citizen.birthDate) : '';
      const address =
        citizen.address || (record.village ? `Thôn ${record.village}` : '');
      const cccd = citizen._id ? String(citizen._id) : '';

      const height =
        phys.height !== null && phys.height !== undefined ? phys.height : '';
      const weight =
        phys.weight !== null && phys.weight !== undefined ? phys.weight : '';
      const chest =
        phys.chest !== null && phys.chest !== undefined ? phys.chest : '';
      const healthStatus = health.healthStatus || '';

      const isQualified = health.isQualified === true ? 'X' : '';
      const exemptCategory =
        health.isDisqualified === true ? health.exemptCategory || '' : '';
      const otherReason =
        health.isDisqualified === true
          ? health.otherReason || health.healthNote || ''
          : health.healthNote || '';

      const values = [
        stt,
        fullName,
        birthDate,
        address,
        cccd,
        height,
        weight,
        chest,
        healthStatus,
        isQualified,
        exemptCategory,
        otherReason,
      ];

      for (let c = 1; c <= 12; c++) {
        const cell = row.getCell(c);
        cell.value = values[c - 1];
        cell.border = borderStyle;
        cell.font = fontStyle;

        if ([2, 4, 9, 11, 12].includes(c)) {
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'left',
            wrapText: true,
          };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        if (c === 3 || c === 5) {
          cell.numFmt = '@';
        }
      }
    });

    // Phần ghi chú ở chân bảng
    const noteStart = 7 + records.length + 1;
    const n1 = worksheet.getRow(noteStart);
    n1.getCell(1).value = '* Ghi chú:';
    n1.getCell(1).font = {
      name: 'Times New Roman',
      size: 11,
      bold: true,
      italic: true,
    };

    const n2 = worksheet.getRow(noteStart + 1);
    n2.getCell(1).value =
      '- Thống kê sơ tuyển sức khỏe NVQS sau mỗi ngày cộng dồn các cột phân loại sức khỏe';
    n2.getCell(1).font = { name: 'Times New Roman', size: 11, italic: true };

    const n3 = worksheet.getRow(noteStart + 2);
    n3.getCell(1).value = '- Sau mỗi đợt có tổng kết việc phân loại sức khỏe';
    n3.getCell(1).font = { name: 'Times New Roman', size: 11, italic: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  // --- LIST WITH SEARCH & FILTERS ---

  async findRecords(query: any) {
    const {
      sessionId,
      scheduledDate,
      village,
      status,
      search,
      page = 1,
      perPage = 20,
    } = query;

    if (!sessionId || !Types.ObjectId.isValid(sessionId)) {
      throw new BadRequestException('Session ID không hợp lệ');
    }

    const filter: any = { sessionId: new Types.ObjectId(sessionId) };

    if (scheduledDate && scheduledDate !== 'all') {
      filter.scheduledDate = scheduledDate;
    }

    if (village && village !== 'all') {
      filter.village = village;
    }

    // Status filter
    if (status === 'arrived') {
      filter['attendance.arrived'] = true;
    } else if (status === 'not_arrived') {
      filter['attendance.arrived'] = false;
    } else if (status === 'photographed') {
      filter.photos = { $elemMatch: { deletedAt: null } };
    } else if (status === 'not_photographed') {
      filter.$or = [
        { photos: { $size: 0 } },
        { photos: { $not: { $elemMatch: { deletedAt: null } } } },
      ];
    } else if (status === 'qualified') {
      filter['healthExam.isQualified'] = true;
    } else if (status === 'disqualified') {
      filter['healthExam.isDisqualified'] = true;
    } else if (status === 'examined_health') {
      filter.$or = [
        { 'healthExam.isQualified': true },
        { 'healthExam.isDisqualified': true },
      ];
    } else if (status === 'not_examined_health') {
      filter['healthExam.isQualified'] = { $ne: true };
      filter['healthExam.isDisqualified'] = { $ne: true };
    }

    // Search query on Citizen
    if (search && search.trim()) {
      const q = search.trim();
      const nameRegex = buildVietnameseRegex(q);
      const citizenSearch: any = {
        $or: [
          { fullName: { $regex: nameRegex } },
          { _id: { $regex: q, $options: 'i' } },
        ],
      };
      if (!isNaN(Number(q))) {
        citizenSearch.$or.push({ index: Number(q) }, { idx: Number(q) });
      }

      const matchingCitizens = await this.citizenModel.find(citizenSearch, {
        _id: 1,
      });
      const matchingCCCDs = matchingCitizens.map((c) => c._id);

      filter.citizenId = { $in: matchingCCCDs };
    }

    const p = Math.max(1, Number(page));
    const limit = Math.max(1, Number(perPage));
    const skip = (p - 1) * limit;

    const [totalCount, documents] = await Promise.all([
      this.model.countDocuments(filter),
      this.model
        .find(filter)
        .populate('citizen')
        .sort({
          'attendance.arrived': 1,
          scheduledDate: 1,
          village: 1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),
    ]);

    // Format active photos for each record
    const formattedDocs = documents.map((doc) => {
      const plain = doc.toObject();
      plain.activePhotos = (plain.photos || []).filter(
        (photo: any) => !photo.deletedAt,
      );
      plain.primaryPhoto =
        plain.activePhotos.find((photo: any) => photo.isPrimary) ||
        plain.activePhotos[0] ||
        null;
      return plain;
    });

    return {
      data: formattedDocs,
      paginate: {
        count: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        page: p,
        perPage: limit,
      },
    };
  }

  async findRecordById(id: string) {
    const doc = await this.model
      .findById(id)
      .populate('citizen')
      .populate('sessionId');
    if (!doc) {
      throw new NotFoundException('Không tìm thấy hồ sơ khám');
    }
    const plain = doc.toObject();
    plain.activePhotos = (plain.photos || []).filter(
      (photo: any) => !photo.deletedAt,
    );
    plain.deletedPhotos = (plain.photos || []).filter(
      (photo: any) => !!photo.deletedAt,
    );
    plain.primaryPhoto =
      plain.activePhotos.find((photo: any) => photo.isPrimary) ||
      plain.activePhotos[0] ||
      null;
    return plain;
  }
}
