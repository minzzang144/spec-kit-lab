import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatStore } from './chat.store';

@Module({
  providers: [ChatGateway, ChatService, ChatStore],
  exports: [ChatStore],
})
export class ChatModule {}
