import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsDate,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 채팅방 참여자 정보 DTO
 */
export class ChatRoomParticipantDto {
  @ApiProperty({
    description: '사용자 고유 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4)
  id: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '귀여운펭귄',
    maxLength: 20,
  })
  @IsString()
  nickname: string;

  @ApiProperty({
    description: '사용자 접속 시간',
    example: '2026-01-22T10:30:00Z',
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: '사용자 연결 상태',
    example: true,
  })
  isConnected: boolean;
}

/**
 * 채팅방 상세 정보 DTO
 */
export class ChatRoomDto {
  @ApiProperty({
    description: '채팅방 고유 ID',
    example: '456e7890-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4)
  id: string;

  @ApiProperty({
    description: '채팅방 이름',
    example: '채팅방 #001',
    pattern: '^채팅방 #\\d{3}$',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '현재 참여자 목록',
    type: [ChatRoomParticipantDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatRoomParticipantDto)
  participants: ChatRoomParticipantDto[];

  @ApiProperty({
    description: '현재 참여자 수',
    example: 3,
    minimum: 0,
    maximum: 5,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  participantCount: number;

  @ApiProperty({
    description: '최대 참여자 수',
    example: 5,
    default: 5,
  })
  @IsNumber()
  maxParticipants: number;

  @ApiProperty({
    description: '방 생성 시간',
    example: '2026-01-22T10:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: '마지막 활동 시간',
    example: '2026-01-22T10:30:00Z',
  })
  @IsDate()
  @Type(() => Date)
  lastActivity: Date;

  @ApiProperty({
    description: '방 생성자 사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4)
  createdBy: string;
}

/**
 * 채팅방 목록 조회용 간소화된 DTO
 */
export class ChatRoomListDto {
  @ApiProperty({
    description: '채팅방 고유 ID',
    example: '456e7890-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4)
  id: string;

  @ApiProperty({
    description: '채팅방 이름',
    example: '채팅방 #001',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '현재 참여자 수',
    example: 3,
    minimum: 0,
    maximum: 5,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  participantCount: number;

  @ApiProperty({
    description: '최대 참여자 수',
    example: 5,
  })
  @IsNumber()
  maxParticipants: number;

  @ApiProperty({
    description: '참여자 닉네임 목록',
    type: [String],
    example: ['귀여운펭귄', '멋진사자', '빠른토끼'],
  })
  @IsArray()
  @IsString({ each: true })
  participantNicknames: string[];

  @ApiProperty({
    description: '방이 가득 찬 상태 여부',
    example: false,
  })
  isFull: boolean;

  @ApiProperty({
    description: '마지막 활동 시간',
    example: '2026-01-22T10:30:00Z',
  })
  @IsDate()
  @Type(() => Date)
  lastActivity: Date;
}

/**
 * 채팅방 목록 응답 DTO
 */
export class ChatRoomListResponseDto {
  @ApiProperty({
    description: '채팅방 목록',
    type: [ChatRoomListDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatRoomListDto)
  rooms: ChatRoomListDto[];

  @ApiProperty({
    description: '전체 채팅방 수',
    example: 5,
  })
  @IsNumber()
  totalCount: number;

  @ApiPropertyOptional({
    description: '데이터 조회 시간',
    example: '2026-01-22T10:30:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  timestamp?: Date;
}

/**
 * 채팅방 상세 조회 응답 DTO
 */
export class ChatRoomDetailResponseDto extends ChatRoomDto {
  @ApiPropertyOptional({
    description: '현재 사용자가 이 방의 참여자인지 여부',
    example: true,
  })
  @IsOptional()
  isCurrentUserParticipant?: boolean;

  @ApiPropertyOptional({
    description: '현재 사용자가 이 방의 생성자인지 여부',
    example: false,
  })
  @IsOptional()
  isCurrentUserCreator?: boolean;
}
