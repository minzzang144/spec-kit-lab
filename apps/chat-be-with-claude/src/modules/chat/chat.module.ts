import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from '../users/users.module';

/**
 * 채팅 모듈
 * - Socket.IO Gateway 관리
 * - 실시간 연결 및 메시지 처리
 * - Users 모듈과 연동
 */
@Module({
  imports: [UsersModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
