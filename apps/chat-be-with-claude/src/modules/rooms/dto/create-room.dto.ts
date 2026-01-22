import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * 채팅방 생성 요청 DTO
 */
export class CreateRoomDto {
  @ApiPropertyOptional({
    description: '방 생성자의 닉네임 (검증용)',
    example: '귀여운펭귄',
    maxLength: 20,
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: '닉네임은 최소 1자 이상이어야 합니다.' })
  @MaxLength(20, { message: '닉네임은 최대 20자까지 가능합니다.' })
  creatorNickname?: string;
}

/**
 * 채팅방 생성 응답 DTO
 */
export class CreateRoomResponseDto {
  @ApiProperty({
    description: '생성된 채팅방 ID',
    example: '456e7890-e89b-12d3-a456-426614174000',
  })
  roomId: string;

  @ApiProperty({
    description: '생성된 채팅방 이름',
    example: '채팅방 #001',
  })
  roomName: string;

  @ApiProperty({
    description: '방 생성 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: '추가 메시지',
    example: '새로운 채팅방이 생성되었습니다.',
  })
  message?: string;

  @ApiProperty({
    description: '방 생성 시간',
    example: '2026-01-22T10:30:00Z',
  })
  createdAt: Date;
}