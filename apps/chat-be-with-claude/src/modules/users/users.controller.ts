import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserDto, CreateUserDto, UpdateUserDto } from './dto';

/**
 * 사용자 관리 HTTP API 컨트롤러
 * - REST API 엔드포인트 제공
 * - Socket.IO와는 별도로 HTTP 기반 사용자 관리
 * - 주로 개발/디버깅 및 백엔드 타입 생성용
 */
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 새로운 사용자를 생성합니다.
   * 실제 사용 시에는 Socket.IO를 통해 생성하지만, HTTP API도 지원
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '새 사용자 생성',
    description:
      '새로운 사용자를 생성합니다. 닉네임을 지정하지 않으면 랜덤 생성됩니다.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '사용자가 성공적으로 생성되었습니다.',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 데이터 (닉네임 형식 오류 등)',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '이미 사용 중인 닉네임',
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Query('socketId') socketId?: string,
  ): Promise<UserDto> {
    // HTTP API 사용 시 임시 Socket ID 생성
    const tempSocketId =
      socketId ||
      `http-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    return await this.usersService.createUser(createUserDto, tempSocketId);
  }

  /**
   * 모든 사용자 목록을 조회합니다.
   */
  @Get()
  @ApiOperation({
    summary: '사용자 목록 조회',
    description: '등록된 모든 사용자 목록을 반환합니다.',
  })
  @ApiQuery({
    name: 'connected',
    required: false,
    type: Boolean,
    description: '연결된 사용자만 조회할지 여부',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '사용자 목록을 성공적으로 조회했습니다.',
    type: [UserDto],
  })
  async findAll(
    @Query('connected') connectedOnly?: string,
  ): Promise<UserDto[]> {
    const isConnectedFilter = connectedOnly === 'true';

    if (isConnectedFilter) {
      return this.usersService.findConnected();
    }

    return this.usersService.findAll();
  }

  /**
   * 특정 사용자 정보를 조회합니다.
   */
  @Get(':id')
  @ApiOperation({
    summary: '사용자 정보 조회',
    description: '사용자 ID로 특정 사용자의 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '조회할 사용자의 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '사용자 정보를 성공적으로 조회했습니다.',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '사용자를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 UUID 형식',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserDto> {
    return this.usersService.findById(id);
  }

  /**
   * 사용자 정보를 업데이트합니다.
   */
  @Put(':id')
  @ApiOperation({
    summary: '사용자 정보 업데이트',
    description: '사용자의 닉네임이나 기타 정보를 업데이트합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '업데이트할 사용자의 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '사용자 정보가 성공적으로 업데이트되었습니다.',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '사용자를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 데이터 (닉네임 형식 오류 등)',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '이미 사용 중인 닉네임',
  })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return await this.usersService.updateUser(id, updateUserDto);
  }

  /**
   * 사용자를 삭제합니다.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '사용자 삭제',
    description: '특정 사용자를 시스템에서 완전히 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '삭제할 사용자의 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '사용자가 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '사용자를 찾을 수 없습니다.',
  })
  async removeUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.usersService.removeUser(id);
  }

  /**
   * Socket ID로 사용자를 조회합니다.
   */
  @Get('by-socket/:socketId')
  @ApiOperation({
    summary: 'Socket ID로 사용자 조회',
    description: 'Socket.IO 연결 ID로 사용자를 조회합니다.',
  })
  @ApiParam({
    name: 'socketId',
    description: 'Socket.IO 연결 ID',
    example: 'socket_abc123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '사용자 정보를 성공적으로 조회했습니다.',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '해당 소켓 ID와 연결된 사용자를 찾을 수 없습니다.',
  })
  async findBySocket(@Param('socketId') socketId: string): Promise<UserDto> {
    if (!socketId) {
      throw new BadRequestException('Socket ID가 필요합니다');
    }

    const user = this.usersService.findBySocketId(socketId);
    if (!user) {
      throw new BadRequestException(
        `Socket ID ${socketId}와 연결된 사용자를 찾을 수 없습니다`,
      );
    }

    return user;
  }

  /**
   * 사용자 활동을 업데이트합니다.
   */
  @Post(':id/activity')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '사용자 활동 업데이트',
    description: '사용자의 마지막 활동 시간을 현재 시간으로 업데이트합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '활동을 업데이트할 사용자의 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '사용자 활동이 성공적으로 업데이트되었습니다.',
  })
  async updateActivity(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.usersService.updateActivity(id);
  }

  /**
   * 사용자 서비스 통계를 조회합니다.
   */
  @Get('admin/stats')
  @ApiOperation({
    summary: '사용자 서비스 통계',
    description: '사용자 수, 연결 상태, 닉네임 생성기 정보 등을 조회합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '통계 정보를 성공적으로 조회했습니다.',
  })
  async getStats() {
    return this.usersService.getStats();
  }

  /**
   * 개발/디버그용: 모든 사용자 데이터를 삭제합니다.
   */
  @Delete('admin/clear-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '[DEV] 모든 사용자 데이터 삭제',
    description: '⚠️ 개발용: 메모리 저장소의 모든 사용자 데이터를 삭제합니다.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '모든 사용자 데이터가 삭제되었습니다.',
  })
  async clearAll(): Promise<void> {
    this.usersService.clearAll();
  }
}
