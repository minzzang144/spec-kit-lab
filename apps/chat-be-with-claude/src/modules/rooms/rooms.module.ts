import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { MemoryStore } from '../../storage/memory-store';

/**
 * 채팅방 관리 모듈
 *
 * 채팅방 생성, 조회, 참여자 관리 등의 기능을 제공하는 모듈입니다.
 * User Story 3: 채팅방 목록 조회 및 관리 기능을 구현합니다.
 *
 * 포함된 기능:
 * - 채팅방 목록 조회 (HTTP REST API)
 * - 채팅방 상세 정보 조회
 * - 새 채팅방 생성
 * - 채팅방 참여자 관리 (입장/퇴장)
 * - 사용자별 현재 방 조회
 * - 채팅방 통계 및 관리 기능
 */
@Module({
  imports: [
    // 필요한 다른 모듈들을 여기에 임포트
    // 현재는 MemoryStore를 직접 의존성으로 사용
  ],
  controllers: [RoomsController],
  providers: [RoomsService, MemoryStore],
  exports: [
    RoomsService,
    // 다른 모듈에서 RoomsService를 사용할 수 있도록 내보냄
    // 예: ChatGateway에서 방 정보 업데이트 시 사용
  ],
})
export class RoomsModule {
  constructor() {
    // 모듈 초기화 로그 (선택적)
    // console.log('RoomsModule initialized');
  }
}
