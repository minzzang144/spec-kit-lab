import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [ChatModule, RoomsModule],
})
export class AppModule {}
