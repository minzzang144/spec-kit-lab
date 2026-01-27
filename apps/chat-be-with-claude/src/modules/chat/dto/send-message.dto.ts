import { IsString, IsNotEmpty, IsOptional, MaxLength, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 메시지 전송 DTO
 * User Story 2: 실시간 채팅 메시지 전송을 위한 데이터 검증
 */
export class SendMessageDto {
  @ApiProperty({
    description: '메시지를 전송할 채팅방 ID',
    example: 'room-123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: '메시지 내용',
    example: '안녕하세요! 반갑습니다.',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: '메시지는 1000자를 초과할 수 없습니다' })
  content: string;

  @ApiPropertyOptional({
    description: '메시지 메타데이터 (이미지 URL, 파일 정보 등)',
    example: { imageUrl: 'https://example.com/image.jpg' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Socket.IO 메시지 전송 이벤트 DTO
 */
export class SocketSendMessageDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: '메시지는 1000자를 초과할 수 없습니다' })
  content: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}