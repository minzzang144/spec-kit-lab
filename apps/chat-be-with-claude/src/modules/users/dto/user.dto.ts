import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID, IsDateString, MaxLength, MinLength, Matches } from 'class-validator';

/**
 * 사용자 엔티티 DTO
 * - 세션 기반으로 관리되며 영구 저장되지 않음
 * - Socket.IO 연결과 함께 생성/관리됨
 */
export class UserDto {
  @ApiProperty({
    description: '사용자 고유 식별자 (UUID v4)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: '사용자 닉네임 (최대 20자, 한글/영문/숫자/공백)',
    example: '재미있는코알라',
    minLength: 1,
    maxLength: 20,
  })
  @IsString()
  @MinLength(1, { message: '닉네임은 최소 1자 이상이어야 합니다' })
  @MaxLength(20, { message: '닉네임은 최대 20자까지 가능합니다' })
  @Matches(/^[가-힣a-zA-Z0-9\s]+$/, {
    message: '닉네임은 한글, 영문, 숫자, 공백만 사용할 수 있습니다',
  })
  nickname: string;

  @ApiProperty({
    description: 'Socket.IO 연결 ID',
    example: 'socket_abc123',
  })
  @IsString()
  socketId: string;

  @ApiProperty({
    description: '현재 참여 중인 방 ID (없으면 null)',
    example: '456e7890-e89b-12d3-a456-426614174001',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4')
  currentRoomId: string | null;

  @ApiProperty({
    description: '접속 시간',
    example: '2026-01-22T10:30:00.000Z',
  })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({
    description: '마지막 활동 시간',
    example: '2026-01-22T10:35:00.000Z',
  })
  @IsDateString()
  lastSeen: Date;

  @ApiProperty({
    description: '실시간 연결 상태',
    example: true,
  })
  @IsBoolean()
  isConnected: boolean;

  constructor(partial: Partial<UserDto> = {}) {
    Object.assign(this, partial);
  }
}