import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import {
  ChatRoomListResponseDto,
  ChatRoomDetailResponseDto,
  CreateRoomDto,
  CreateRoomResponseDto,
} from './dto';

/**
 * 채팅방 관리 HTTP API 컨트롤러
 *
 * 채팅방 목록 조회, 상세 조회, 생성 등의 HTTP 엔드포인트를 제공합니다.
 * User Story 3: 채팅방 목록 조회 및 관리 기능의 REST API를 구현합니다.
 */
@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  private readonly logger = new Logger(RoomsController.name);

  constructor(private readonly roomsService: RoomsService) {}

  /**
   * 모든 채팅방 목록을 조회합니다.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '채팅방 목록 조회',
    description:
      '현재 활성화된 모든 채팅방의 목록을 최신 활동 순으로 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '채팅방 목록이 성공적으로 조회되었습니다.',
    type: ChatRoomListResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류가 발생했습니다.',
  })
  getAllRooms(): ChatRoomListResponseDto {
    this.logger.debug('GET /rooms - Fetching all rooms');

    try {
      const result = this.roomsService.getAllRooms();
      this.logger.debug(`Retrieved ${result.totalCount} rooms`);
      return result;
    } catch (error) {
      this.logger.error('Failed to get all rooms', error);
      throw error;
    }
  }

  /**
   * 특정 채팅방의 상세 정보를 조회합니다.
   */
  @Get(':roomId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '채팅방 상세 조회',
    description: '특정 채팅방의 상세 정보와 참여자 목록을 조회합니다.',
  })
  @ApiParam({
    name: 'roomId',
    description: '조회할 채팅방의 고유 ID',
    example: '456e7890-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'currentUserId',
    description: '현재 사용자 ID (선택적, 제공 시 사용자별 정보 포함)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '채팅방 상세 정보가 성공적으로 조회되었습니다.',
    type: ChatRoomDetailResponseDto,
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청입니다. (방 ID가 없거나 잘못된 형식)',
  })
  @ApiNotFoundResponse({
    description: '해당 ID의 채팅방을 찾을 수 없습니다.',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류가 발생했습니다.',
  })
  getRoomById(
    @Param('roomId') roomId: string,
    @Query('currentUserId') currentUserId?: string,
  ): ChatRoomDetailResponseDto {
    this.logger.debug(`GET /rooms/${roomId} - Fetching room details`);

    try {
      const result = this.roomsService.getRoomById(roomId, currentUserId);
      this.logger.debug(`Retrieved room details: ${result.name}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get room ${roomId}`, error);
      throw error;
    }
  }

  /**
   * 새로운 채팅방을 생성합니다.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '새 채팅방 생성',
    description: '새로운 채팅방을 생성하고 생성자를 자동으로 참여시킵니다.',
  })
  @ApiBody({
    description: '채팅방 생성 요청 데이터',
    type: CreateRoomDto,
    examples: {
      basic: {
        summary: '기본 방 생성',
        description: '별도 파라미터 없이 자동 생성',
        value: {},
      },
      withCreator: {
        summary: '생성자 정보 포함',
        description: '생성자 닉네임을 포함한 방 생성',
        value: {
          creatorNickname: '귀여운펭귄',
        },
      },
    },
  })
  @ApiQuery({
    name: 'creatorId',
    description: '방을 생성할 사용자 ID',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: '채팅방이 성공적으로 생성되었습니다.',
    type: CreateRoomResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청입니다. (생성자 ID가 없거나 더 이상 방을 생성할 수 없음)',
  })
  @ApiNotFoundResponse({
    description: '생성자 사용자를 찾을 수 없습니다.',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류가 발생했습니다.',
  })
  createRoom(
    @Query('creatorId') creatorId: string,
    @Body() _createRoomDto: CreateRoomDto,
  ): CreateRoomResponseDto {
    this.logger.debug(`POST /rooms - Creating room for user ${creatorId}`);

    if (!creatorId) {
      throw new BadRequestException('생성자 ID는 필수입니다.');
    }

    try {
      const result = this.roomsService.createRoom(creatorId);
      this.logger.log(`Room created: ${result.roomName} by user ${creatorId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create room for user ${creatorId}`, error);
      throw error;
    }
  }

  /**
   * 사용자를 채팅방에 추가합니다.
   */
  @Post(':roomId/participants')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '채팅방 참여',
    description: '사용자를 특정 채팅방에 추가합니다.',
  })
  @ApiParam({
    name: 'roomId',
    description: '참여할 채팅방의 고유 ID',
    example: '456e7890-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'userId',
    description: '참여시킬 사용자 ID',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '사용자가 채팅방에 성공적으로 추가되었습니다.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '채팅방에 참여했습니다.' },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청입니다. (방이 가득참, 이미 참여중, 잘못된 파라미터)',
  })
  @ApiNotFoundResponse({
    description: '채팅방 또는 사용자를 찾을 수 없습니다.',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류가 발생했습니다.',
  })
  addUserToRoom(
    @Param('roomId') roomId: string,
    @Query('userId') userId: string,
  ): { success: boolean; message: string } {
    this.logger.debug(
      `POST /rooms/${roomId}/participants - Adding user ${userId}`,
    );

    if (!userId) {
      throw new BadRequestException('사용자 ID는 필수입니다.');
    }

    try {
      const success = this.roomsService.addUserToRoom(roomId, userId);
      const message = success
        ? '채팅방에 참여했습니다.'
        : '이미 채팅방에 참여 중입니다.';

      this.logger.log(`User ${userId} joined room ${roomId}: ${success}`);
      return { success, message };
    } catch (error) {
      this.logger.error(
        `Failed to add user ${userId} to room ${roomId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 채팅방에서 사용자를 제거합니다.
   */
  @Post(':roomId/participants/remove')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '채팅방 나가기',
    description: '사용자를 특정 채팅방에서 제거합니다.',
  })
  @ApiParam({
    name: 'roomId',
    description: '나갈 채팅방의 고유 ID',
    example: '456e7890-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'userId',
    description: '제거할 사용자 ID',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '사용자가 채팅방에서 성공적으로 제거되었습니다.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '채팅방에서 나갔습니다.' },
        roomDeleted: { type: 'boolean', example: false },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청입니다. (잘못된 파라미터)',
  })
  @ApiNotFoundResponse({
    description: '채팅방을 찾을 수 없습니다.',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류가 발생했습니다.',
  })
  removeUserFromRoom(
    @Param('roomId') roomId: string,
    @Query('userId') userId: string,
  ): { success: boolean; message: string; roomDeleted: boolean } {
    this.logger.debug(
      `POST /rooms/${roomId}/participants/remove - Removing user ${userId}`,
    );

    if (!userId) {
      throw new BadRequestException('사용자 ID는 필수입니다.');
    }

    try {
      const success = this.roomsService.removeUserFromRoom(roomId, userId);

      // 방이 삭제되었는지 확인 (제거 후 빈 방이 되면 자동 삭제됨)
      let roomExists;
      try {
        roomExists = this.roomsService.getRoomById(roomId);
      } catch {
        roomExists = null;
      }
      const roomDeleted = !roomExists;

      const message = success
        ? roomDeleted
          ? '채팅방에서 나갔고, 빈 방이 삭제되었습니다.'
          : '채팅방에서 나갔습니다.'
        : '채팅방에서 제거할 수 없습니다.';

      this.logger.log(
        `User ${userId} left room ${roomId}: ${success}, deleted: ${roomDeleted}`,
      );
      return { success, message, roomDeleted };
    } catch (error) {
      this.logger.error(
        `Failed to remove user ${userId} from room ${roomId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 사용자의 현재 참여 중인 채팅방을 조회합니다.
   */
  @Get('users/:userId/current')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '사용자 현재 방 조회',
    description: '특정 사용자가 현재 참여 중인 채팅방을 조회합니다.',
  })
  @ApiParam({
    name: 'userId',
    description: '조회할 사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '사용자의 현재 방 정보가 성공적으로 조회되었습니다.',
    schema: {
      oneOf: [{ $ref: '#/components/schemas/ChatRoomDto' }, { type: 'null' }],
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청입니다. (사용자 ID가 없음)',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류가 발생했습니다.',
  })
  getUserCurrentRoom(@Param('userId') userId: string) {
    this.logger.debug(
      `GET /rooms/users/${userId}/current - Fetching user's current room`,
    );

    try {
      const result = this.roomsService.getUserCurrentRoom(userId);
      this.logger.debug(
        `User ${userId} current room: ${result?.name || 'none'}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to get current room for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * 채팅방 통계 정보를 조회합니다.
   */
  @Get('statistics/summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '채팅방 통계 조회',
    description: '전체 채팅방의 통계 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '채팅방 통계 정보가 성공적으로 조회되었습니다.',
    schema: {
      type: 'object',
      properties: {
        totalRooms: { type: 'number', example: 10 },
        activeRooms: { type: 'number', example: 8 },
        fullRooms: { type: 'number', example: 2 },
        totalParticipants: { type: 'number', example: 25 },
        averageParticipantsPerRoom: { type: 'number', example: 2.5 },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류가 발생했습니다.',
  })
  getRoomStats() {
    this.logger.debug(
      'GET /rooms/statistics/summary - Fetching room statistics',
    );

    try {
      const result = this.roomsService.getRoomStats();
      this.logger.debug(`Room stats: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to get room statistics', error);
      throw error;
    }
  }

  /**
   * 빈 채팅방들을 정리합니다. (관리자 기능)
   */
  @Post('cleanup/empty')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '빈 방 정리',
    description: '참여자가 없는 빈 채팅방들을 모두 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '빈 방 정리가 성공적으로 완료되었습니다.',
    schema: {
      type: 'object',
      properties: {
        deletedCount: { type: 'number', example: 3 },
        message: { type: 'string', example: '3개의 빈 방이 삭제되었습니다.' },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류가 발생했습니다.',
  })
  cleanupEmptyRooms() {
    this.logger.debug('POST /rooms/cleanup/empty - Cleaning up empty rooms');

    try {
      const deletedCount = this.roomsService.cleanupEmptyRooms();
      const message = `${deletedCount}개의 빈 방이 삭제되었습니다.`;

      this.logger.log(`Cleanup completed: ${deletedCount} empty rooms deleted`);
      return { deletedCount, message };
    } catch (error) {
      this.logger.error('Failed to cleanup empty rooms', error);
      throw error;
    }
  }
}
