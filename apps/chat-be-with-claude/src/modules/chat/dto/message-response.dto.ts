import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Message, MessageType, MessageStatus, MessagesResult, MessageStats } from '../interfaces/message.interface';

/**
 * 메시지 응답 DTO
 * User Story 2: API 응답에서 사용할 메시지 데이터 구조
 */
export class MessageResponseDto implements Message {
  @ApiProperty({
    description: '메시지 고유 ID',
    example: 'msg-123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: '메시지가 속한 채팅방 ID',
    example: 'room-123e4567-e89b-12d3-a456-426614174000',
  })
  roomId: string;

  @ApiProperty({
    description: '발신자 사용자 ID (시스템 메시지의 경우 null)',
    example: 'user-123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  senderId: string | null;

  @ApiProperty({
    description: '발신자 닉네임',
    example: '사용자123',
    nullable: true,
  })
  senderNickname: string | null;

  @ApiProperty({
    description: '메시지 내용',
    example: '안녕하세요! 반갑습니다.',
  })
  content: string;

  @ApiProperty({
    description: '메시지 타입',
    enum: MessageType,
    example: MessageType.USER,
  })
  type: MessageType;

  @ApiProperty({
    description: '메시지 상태',
    enum: MessageStatus,
    example: MessageStatus.SENT,
  })
  status: MessageStatus;

  @ApiProperty({
    description: '메시지 생성 시간',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: '메시지 수정 시간',
    example: '2024-01-15T10:31:00Z',
  })
  updatedAt?: Date;

  @ApiPropertyOptional({
    description: '추가 메타데이터',
    example: { imageUrl: 'https://example.com/image.jpg' },
  })
  metadata?: Record<string, any>;
}

/**
 * 메시지 목록 응답 DTO
 */
export class MessagesResponseDto implements MessagesResult {
  @ApiProperty({
    description: '메시지 목록',
    type: [MessageResponseDto],
  })
  messages: MessageResponseDto[];

  @ApiProperty({
    description: '전체 메시지 수',
    example: 150,
  })
  totalCount: number;

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: '이전 페이지 존재 여부',
    example: false,
  })
  hasPrevious: boolean;

  @ApiProperty({
    description: '조회 옵션',
  })
  queryOptions: {
    roomId: string;
    fromDate?: Date;
    toDate?: Date;
    limit: number;
    offset: number;
    messageTypes?: MessageType[];
  };
}

/**
 * 메시지 통계 응답 DTO
 */
export class MessageStatsResponseDto implements MessageStats {
  @ApiProperty({
    description: '방 ID',
    example: 'room-123e4567-e89b-12d3-a456-426614174000',
  })
  roomId: string;

  @ApiProperty({
    description: '전체 메시지 수',
    example: 150,
  })
  totalMessages: number;

  @ApiProperty({
    description: '사용자 메시지 수',
    example: 142,
  })
  userMessages: number;

  @ApiProperty({
    description: '시스템 메시지 수',
    example: 8,
  })
  systemMessages: number;

  @ApiProperty({
    description: '가장 최근 메시지 시간',
    example: '2024-01-15T10:30:00Z',
    nullable: true,
  })
  lastMessageAt: Date | null;

  @ApiProperty({
    description: '가장 오래된 메시지 시간',
    example: '2024-01-10T09:15:00Z',
    nullable: true,
  })
  firstMessageAt: Date | null;
}

/**
 * 메시지 전송 성공 응답 DTO
 */
export class SendMessageResponseDto {
  @ApiProperty({
    description: '전송된 메시지',
    type: MessageResponseDto,
  })
  message: MessageResponseDto;

  @ApiProperty({
    description: '성공 메시지',
    example: '메시지가 성공적으로 전송되었습니다',
  })
  message_text: string;

  @ApiProperty({
    description: '응답 시간',
    example: '2024-01-15T10:30:00Z',
  })
  timestamp: string;
}

/**
 * Socket.IO 메시지 브로드캐스트 DTO
 */
export class MessageBroadcastDto {
  @ApiProperty({
    description: '전송된 메시지',
    type: MessageResponseDto,
  })
  message: MessageResponseDto;

  @ApiProperty({
    description: '방 ID',
    example: 'room-123e4567-e89b-12d3-a456-426614174000',
  })
  roomId: string;

  @ApiProperty({
    description: '방 이름',
    example: '재미있는 채팅방',
  })
  roomName: string;

  @ApiProperty({
    description: '브로드캐스트 시간',
    example: '2024-01-15T10:30:00Z',
  })
  timestamp: string;
}