import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MemoryStore } from '../../storage/memory-store';

/**
 * 사용자 관리 모듈
 * - 사용자 생성, 조회, 업데이트, 삭제 기능
 * - 닉네임 검증 및 자동 생성
 * - Socket.IO 연결 관리
 * - HTTP API 및 내부 서비스 제공
 */
@Module({
  imports: [],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: MemoryStore,
      useClass: MemoryStore,
    },
  ],
  exports: [
    UsersService, // 다른 모듈에서 사용할 수 있도록 내보냄
    MemoryStore,  // 다른 모듈에서 저장소에 직접 접근할 수 있도록 내보냄
  ],
})
export class UsersModule {}