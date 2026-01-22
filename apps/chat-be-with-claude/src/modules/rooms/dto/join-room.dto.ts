import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

/**
 * 채팅방 참여 요청 DTO
 */
export class JoinRoomDto {
  @ApiProperty({
    description: '참여할 채팅방 ID',
    example: '456e7890-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsUUID()
  roomId: string;

  @ApiPropertyOptional({
    description: '참여자 닉네임 (검증용)',
    example: '귀여운펭귄',
    maxLength: 20,
    minLength: 1,
  })
  @IsString()
  @MinLength(1, { message: '닉네임은 최소 1자 이상이어야 합니다.' })
  @MaxLength(20, { message: '닉네임은 최대 20자까지 가능합니다.' })
  participantNickname?: string;
}

/**
 * 채팅방 참여 응답 DTO
 */
export class JoinRoomResponseDto {
  @ApiProperty({
    description: '참여한 채팅방 ID',
    example: '456e7890-e89b-12d3-a456-426614174000',
  })
  roomId: string;

  @ApiProperty({
    description: '참여한 채팅방 이름',
    example: '채팅방 #001',
  })
  roomName: string;

  @ApiProperty({
    description: '방 참여 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: '추가 메시지',
    example: '채팅방에 참여했습니다.',
  })
  message?: string;

  @ApiProperty({
    description: '방 참여 시간',
    example: '2026-01-22T10:30:00Z',
  })
  joinedAt: Date;

  @ApiProperty({
    description: '현재 참여자 수',
    example: 3,
  })
  currentParticipants: number;

  @ApiProperty({
    description: '최대 참여자 수',
    example: 5,
  })
  maxParticipants: number;

  @ApiProperty({
    description: '방이 가득 찼는지 여부',
    example: false,
  })
  isFull: boolean;
}