import {
  Injectable,
  Logger,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { MemoryStore, User as StorageUser } from '../../storage/memory-store';
import { UserDto, CreateUserDto, UpdateUserDto } from './dto';
import {
  generateUniqueNickname,
  validateNickname,
  getNicknameGeneratorStats,
} from '../../common/utils';

/**
 * 사용자 관리 서비스
 * - 세션 기반 사용자 생성 및 관리
 * - 닉네임 검증 및 자동 생성
 * - Socket.IO 연결과 연동
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly memoryStore: MemoryStore) {}

  /**
   * 새로운 사용자를 생성합니다.
   * @param createUserDto 사용자 생성 데이터
   * @param socketId Socket.IO 연결 ID
   * @returns 생성된 사용자 정보
   */
  async createUser(
    createUserDto: CreateUserDto,
    socketId: string,
  ): Promise<UserDto> {
    this.logger.debug(`Creating user with socket ${socketId}`);

    let nickname = createUserDto.nickname;

    // 닉네임이 제공되지 않았으면 랜덤 생성
    if (!nickname) {
      const existingNicknames = this.getAllNicknames();
      nickname = generateUniqueNickname(existingNicknames);
      this.logger.debug(`Generated random nickname: ${nickname}`);
    } else {
      // 제공된 닉네임 검증
      const validation = validateNickname(nickname);
      if (!validation.isValid) {
        throw new BadRequestException({
          message: '닉네임이 유효하지 않습니다',
          errors: validation.errors,
        });
      }

      // 중복 검사 (대소문자 구분하지 않음)
      if (this.isNicknameTaken(nickname)) {
        throw new ConflictException('이미 사용 중인 닉네임입니다');
      }
    }

    // 기존 소켓 연결이 있는지 확인
    const existingUser = this.memoryStore.getUserBySocket(socketId);
    if (existingUser) {
      this.logger.warn(
        `Socket ${socketId} already has user ${existingUser.id}`,
      );
      throw new ConflictException('이미 연결된 소켓입니다');
    }

    // 사용자 생성
    const now = new Date();
    const user: StorageUser = {
      id: uuidv4(),
      nickname,
      connectedAt: now,
      socketId,
    };

    // 저장소에 저장
    const savedUser = this.memoryStore.createUser(user);
    this.memoryStore.setUserSocket(savedUser.id, socketId);

    this.logger.log(`User created: ${nickname} (${savedUser.id})`);

    return this.mapToUserDto(savedUser);
  }

  /**
   * 사용자 ID로 사용자 정보를 조회합니다.
   */
  findById(userId: string): UserDto {
    const user = this.memoryStore.getUser(userId);
    if (!user) {
      throw new NotFoundException(`사용자를 찾을 수 없습니다: ${userId}`);
    }
    return this.mapToUserDto(user);
  }

  /**
   * Socket ID로 사용자 정보를 조회합니다.
   */
  findBySocketId(socketId: string): UserDto | null {
    const user = this.memoryStore.getUserBySocket(socketId);
    return user ? this.mapToUserDto(user) : null;
  }

  /**
   * 모든 사용자 목록을 조회합니다.
   */
  findAll(): UserDto[] {
    const users = this.memoryStore.getAllUsers();
    return users.map((user) => this.mapToUserDto(user));
  }

  /**
   * 현재 연결된 사용자 목록을 조회합니다.
   */
  findConnected(): UserDto[] {
    const users = this.memoryStore.getAllUsers();
    const connectedUsers = users.filter((user) => user.socketId);
    return connectedUsers.map((user) => this.mapToUserDto(user));
  }

  /**
   * 사용자 정보를 업데이트합니다.
   */
  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    const existingUser = this.memoryStore.getUser(userId);
    if (!existingUser) {
      throw new NotFoundException(`사용자를 찾을 수 없습니다: ${userId}`);
    }

    // 닉네임 변경 시 검증
    if (updateUserDto.nickname) {
      const validation = validateNickname(updateUserDto.nickname);
      if (!validation.isValid) {
        throw new BadRequestException({
          message: '닉네임이 유효하지 않습니다',
          errors: validation.errors,
        });
      }

      // 중복 검사 (자기 자신 제외)
      if (
        updateUserDto.nickname !== existingUser.nickname &&
        this.isNicknameTaken(updateUserDto.nickname)
      ) {
        throw new ConflictException('이미 사용 중인 닉네임입니다');
      }
    }

    // 업데이트 실행
    const updatedUser = this.memoryStore.updateUser(
      userId,
      updateUserDto as Partial<StorageUser>,
    );
    if (!updatedUser) {
      throw new NotFoundException(`사용자 업데이트에 실패했습니다: ${userId}`);
    }

    this.logger.debug(`User updated: ${updatedUser.nickname} (${userId})`);
    return this.mapToUserDto(updatedUser);
  }

  /**
   * 사용자 연결을 해제합니다.
   */
  disconnectUser(socketId: string): void {
    const user = this.memoryStore.getUserBySocket(socketId);
    if (user) {
      this.logger.debug(`Disconnecting user: ${user.nickname} (${user.id})`);
      this.memoryStore.removeSocketMapping(socketId);

      // 필요시 여기서 방에서도 제거하는 로직 추가 가능
      // (채팅 게이트웨이에서 처리할 예정)
    }
  }

  /**
   * 사용자를 완전히 삭제합니다.
   */
  removeUser(userId: string): void {
    const user = this.memoryStore.getUser(userId);
    if (user) {
      const deleted = this.memoryStore.deleteUser(userId);
      if (deleted) {
        this.logger.log(`User removed: ${user.nickname} (${userId})`);
      }
    }
  }

  /**
   * 사용자 활동 시간을 업데이트합니다.
   */
  updateActivity(userId: string): void {
    const user = this.memoryStore.getUser(userId);
    if (user) {
      // connectedAt을 lastSeen처럼 사용 (기존 구조 유지)
      this.memoryStore.updateUser(userId, { connectedAt: new Date() });
    }
  }

  /**
   * 닉네임 중복 검사
   */
  private isNicknameTaken(nickname: string): boolean {
    const users = this.memoryStore.getAllUsers();
    return users.some(
      (user) => user.nickname.toLowerCase() === nickname.toLowerCase(),
    );
  }

  /**
   * 기존 모든 닉네임 목록을 반환합니다.
   */
  private getAllNicknames(): string[] {
    const users = this.memoryStore.getAllUsers();
    return users.map((user) => user.nickname);
  }

  /**
   * 스토리지 User를 UserDto로 변환합니다.
   */
  private mapToUserDto(user: StorageUser): UserDto {
    return new UserDto({
      id: user.id,
      nickname: user.nickname,
      socketId: user.socketId || '',
      currentRoomId: null, // 추후 방 시스템 구현 시 추가
      createdAt: user.connectedAt,
      lastSeen: user.connectedAt, // 현재는 같은 값으로 설정
      isConnected: !!user.socketId,
    });
  }

  /**
   * 서비스 통계 정보를 반환합니다.
   */
  getStats() {
    const storeStats = this.memoryStore.getStats();
    const nicknameStats = getNicknameGeneratorStats();

    return {
      users: {
        total: storeStats.users,
        connected: storeStats.activeSockets,
      },
      nickname: nicknameStats,
    };
  }

  /**
   * 개발/디버그용: 모든 데이터 초기화
   */
  clearAll(): void {
    this.memoryStore.clear();
    this.logger.warn('All user data cleared');
  }
}
