import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

/**
 * 사용자 업데이트 요청 DTO
 * - 닉네임 변경, 현재 방 변경 등에 사용
 */
export class UpdateUserDto {
  @ApiProperty({
    description: '새로운 닉네임',
    example: '멋진사자',
    required: false,
    minLength: 1,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: '닉네임은 최소 1자 이상이어야 합니다' })
  @MaxLength(20, { message: '닉네임은 최대 20자까지 가능합니다' })
  @Matches(/^[가-힣a-zA-Z0-9\s]+$/, {
    message: '닉네임은 한글, 영문, 숫자, 공백만 사용할 수 있습니다',
  })
  nickname?: string;

  @ApiProperty({
    description: '현재 참여 중인 방 ID',
    example: '456e7890-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: '올바른 UUID v4 형식이어야 합니다' })
  currentRoomId?: string;

  constructor(partial: Partial<UpdateUserDto> = {}) {
    Object.assign(this, partial);
  }
}
