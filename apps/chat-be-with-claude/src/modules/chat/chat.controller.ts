import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';
import {
  SendMessageDto,
  GetMessagesDto,
  GetMessageStatsDto,
  MessageResponseDto,
  MessagesResponseDto,
  MessageStatsResponseDto,
  SendMessageResponseDto,
} from './dto';

/**
 * 채팅 메시지 REST API 컨트롤러
 * User Story 2: 실시간 채팅 메시지 기능을 위한 HTTP API 엔드포인트
 */
@ApiTags('Chat Messages')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 메시지 전송 (HTTP API 방식)
   * 주로 테스트나 백오피스에서 사용
   */
  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '채팅 메시지 전송' })
  @ApiResponse({
    status: 201,
    description: '메시지가 성공적으로 전송되었습니다',
    type: SendMessageResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 404, description: '방 또는 사용자를 찾을 수 없음' })
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @Query('userId') userId?: string,
    @Query('userNickname') userNickname?: string,
  ): Promise<SendMessageResponseDto> {
    // 테스트를 위한 임시 사용자 정보 처리
    if (!userId || !userNickname) {
      throw new BadRequestException(
        'userId와 userNickname 쿼리 파라미터가 필요합니다 (테스트용)',
      );
    }

    const message = this.chatService.createMessage(
      sendMessageDto,
      userId,
      userNickname,
    );

    return {
      message,
      message_text: '메시지가 성공적으로 전송되었습니다',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 방의 메시지 목록 조회
   */
  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: '채팅방 메시지 목록 조회' })
  @ApiParam({ name: 'roomId', description: '채팅방 ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '조회할 메시지 수 (최대 100)',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: '건너뛸 메시지 수',
    example: 0,
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    description: '조회 시작 일시 (ISO 8601)',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    description: '조회 종료 일시 (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: '메시지 목록 조회 성공',
    type: MessagesResponseDto,
  })
  @ApiResponse({ status: 404, description: '방을 찾을 수 없음' })
  async getMessages(
    @Param('roomId') roomId: string,
    @Query() query: Omit<GetMessagesDto, 'roomId'>,
  ): Promise<MessagesResponseDto> {
    const getMessagesDto: GetMessagesDto = {
      roomId,
      ...query,
    };

    const result = this.chatService.getMessages(getMessagesDto);
    return result as MessagesResponseDto;
  }

  /**
   * 특정 메시지 조회
   */
  @Get('messages/:messageId')
  @ApiOperation({ summary: '특정 메시지 조회' })
  @ApiParam({ name: 'messageId', description: '메시지 ID' })
  @ApiResponse({
    status: 200,
    description: '메시지 조회 성공',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 404, description: '메시지를 찾을 수 없음' })
  async getMessage(
    @Param('messageId') messageId: string,
  ): Promise<MessageResponseDto> {
    const message = this.chatService.getMessage(messageId);
    return message as MessageResponseDto;
  }

  /**
   * 방의 메시지 통계 조회
   */
  @Get('rooms/:roomId/messages/stats')
  @ApiOperation({ summary: '채팅방 메시지 통계 조회' })
  @ApiParam({ name: 'roomId', description: '채팅방 ID' })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    description: '통계 조회 시작 일시 (ISO 8601)',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    description: '통계 조회 종료 일시 (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: '메시지 통계 조회 성공',
    type: MessageStatsResponseDto,
  })
  @ApiResponse({ status: 404, description: '방을 찾을 수 없음' })
  async getMessageStats(
    @Param('roomId') roomId: string,
    @Query() query: Omit<GetMessageStatsDto, 'roomId'>,
  ): Promise<MessageStatsResponseDto> {
    const getMessageStatsDto: GetMessageStatsDto = {
      roomId,
      ...query,
    };

    const stats = this.chatService.getMessageStats(getMessageStatsDto);
    return stats as MessageStatsResponseDto;
  }

  /**
   * 방의 최근 메시지 조회 (간단한 버전)
   */
  @Get('rooms/:roomId/recent-messages')
  @ApiOperation({ summary: '채팅방 최근 메시지 조회' })
  @ApiParam({ name: 'roomId', description: '채팅방 ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '조회할 메시지 수',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: '최근 메시지 목록',
    type: [MessageResponseDto],
  })
  @ApiResponse({ status: 404, description: '방을 찾을 수 없음' })
  async getRecentMessages(
    @Param('roomId') roomId: string,
    @Query('limit') limit?: number,
  ): Promise<MessageResponseDto[]> {
    const messages = this.chatService.getRecentMessages(roomId, limit || 50);
    return messages as MessageResponseDto[];
  }

  /**
   * 방의 참여자 정보 조회 (채팅 관련)
   */
  @Get('rooms/:roomId/participants')
  @ApiOperation({ summary: '채팅방 참여자 목록 조회' })
  @ApiParam({ name: 'roomId', description: '채팅방 ID' })
  @ApiResponse({
    status: 200,
    description: '참여자 목록 조회 성공',
  })
  @ApiResponse({ status: 404, description: '방을 찾을 수 없음' })
  async getRoomParticipants(@Param('roomId') roomId: string) {
    return this.chatService.getRoomParticipants(roomId);
  }

  /**
   * 방의 참여자 통계 조회
   */
  @Get('rooms/:roomId/participants/stats')
  @ApiOperation({ summary: '채팅방 참여자 통계 조회' })
  @ApiParam({ name: 'roomId', description: '채팅방 ID' })
  @ApiResponse({
    status: 200,
    description: '참여자 통계 조회 성공',
  })
  @ApiResponse({ status: 404, description: '방을 찾을 수 없음' })
  async getRoomParticipantStats(@Param('roomId') roomId: string) {
    return this.chatService.getRoomParticipantStats(roomId);
  }

  /**
   * 사용자가 특정 방에 참여 중인지 확인
   */
  @Get('rooms/:roomId/participants/:userId/check')
  @ApiOperation({ summary: '사용자의 방 참여 여부 확인' })
  @ApiParam({ name: 'roomId', description: '채팅방 ID' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({
    status: 200,
    description: '참여 여부 확인 결과',
    schema: {
      type: 'object',
      properties: {
        isParticipant: { type: 'boolean' },
        roomId: { type: 'string' },
        userId: { type: 'string' },
        timestamp: { type: 'string' },
      },
    },
  })
  async checkUserInRoom(
    @Param('roomId') roomId: string,
    @Param('userId') userId: string,
  ) {
    const isParticipant = this.chatService.isUserInRoom(roomId, userId);

    return {
      isParticipant,
      roomId,
      userId,
      timestamp: new Date().toISOString(),
    };
  }
}
