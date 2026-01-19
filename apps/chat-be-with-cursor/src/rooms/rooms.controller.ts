import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RoomsService } from './rooms.service';

interface CreateRoomDto {
  nickname: string;
}

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  listRooms() {
    return this.roomsService.listRooms();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createRoom(@Body() createRoomDto: CreateRoomDto) {
    if (!createRoomDto.nickname || createRoomDto.nickname.trim().length === 0) {
      throw new Error('nickname is required');
    }
    return this.roomsService.createRoom(createRoomDto.nickname.trim());
  }
}
