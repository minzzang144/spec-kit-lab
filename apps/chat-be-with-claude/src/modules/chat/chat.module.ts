import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { UsersModule } from '../users/users.module';
import { RoomsModule } from '../rooms/rooms.module';

/**
 * 채팅 모듈
 * - Socket.IO Gateway 관리
 * - 실시간 연결 및 메시지 처리
 * - 방 참여자 관리
 * - Users, Rooms 모듈과 연동
 */
@Module({
  imports: [UsersModule, RoomsModule],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
