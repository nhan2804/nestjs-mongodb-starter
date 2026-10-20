import { IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePhysicalMetricsDto {
  @IsOptional()
  @IsNumber()
  height?: number | null; // Cao (cm)

  @IsOptional()
  @IsNumber()
  weight?: number | null; // Cân nặng (kg)

  @IsOptional()
  @IsNumber()
  chest?: number | null; // Vòng ngực trung bình (cm)
}

export class UpdateHealthExamDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePhysicalMetricsDto)
  physical?: UpdatePhysicalMetricsDto;

  @IsOptional()
  @IsString()
  healthStatus?: string; // Tình trạng sức khỏe và bệnh tật

  @IsOptional()
  @IsBoolean()
  isQualified?: boolean | null; // Đủ điều kiện sức khỏe khám NVQS

  @IsOptional()
  @IsBoolean()
  isDisqualified?: boolean | null; // Không đủ điều kiện sức khỏe khám NVQS

  @IsOptional()
  @IsString()
  exemptCategory?: string; // Thuộc diện miễn làm NVQS

  @IsOptional()
  @IsString()
  otherReason?: string; // Lý do khác (ghi cụ thể)

  @IsOptional()
  @IsString()
  healthNote?: string; // Ghi chú sức khỏe
}
