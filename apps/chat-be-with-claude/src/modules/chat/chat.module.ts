import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from '../users/users.module';
import { RoomsModule } from '../rooms/rooms.module';

/**
 * 채팅 모듈
 * - Socket.IO Gateway 관리
 * - 실시간 연결 및 메시지 처리
 * - Users 모듈과 연동
 */
@Module({
  imports: [UsersModule, RoomsModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
