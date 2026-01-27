import { IsString, IsOptional, IsInt, Min, Max, IsDateString, IsArray, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { MessageType } from '../interfaces/message.interface';

/**
 * 메시지 히스토리 조회 DTO
 * User Story 2: 채팅방의 메시지 히스토리 조회를 위한 쿼리 파라미터
 */
export class GetMessagesDto {
  @ApiPropertyOptional({
    description: '조회할 채팅방 ID',
    example: 'room-123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  roomId: string;

  @ApiPropertyOptional({
    description: '조회 시작 일시 (ISO 8601 형식)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: '조회 종료 일시 (ISO 8601 형식)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: '한 페이지에 조회할 메시지 수 (최대 100개)',
    example: 50,
    minimum: 1,
    maximum: 100,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: '최소 1개 이상의 메시지를 조회해야 합니다' })
  @Max(100, { message: '한 번에 최대 100개까지 조회할 수 있습니다' })
  limit?: number = 50;

  @ApiPropertyOptional({
    description: '건너뛸 메시지 수 (페이지네이션)',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: '오프셋은 0 이상이어야 합니다' })
  offset?: number = 0;

  @ApiPropertyOptional({
    description: '조회할 메시지 타입 목록',
    example: ['user', 'system'],
    enum: MessageType,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(MessageType, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value];
    }
    return value;
  })
  messageTypes?: MessageType[];
}

/**
 * 메시지 통계 조회 DTO
 */
export class GetMessageStatsDto {
  @ApiPropertyOptional({
    description: '조회할 채팅방 ID',
    example: 'room-123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  roomId: string;

  @ApiPropertyOptional({
    description: '통계 조회 시작 일시 (ISO 8601 형식)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: '통계 조회 종료 일시 (ISO 8601 형식)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}