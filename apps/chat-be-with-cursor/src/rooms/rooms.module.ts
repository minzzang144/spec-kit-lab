import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { ChatStore } from '../chat/chat.store';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, ChatStore],
  exports: [ChatStore],
})
export class RoomsModule {}
