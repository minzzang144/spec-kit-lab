import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

/**
 * 사용자 생성 요청 DTO
 * - 로비 입장 시 사용
 * - 닉네임이 없으면 서버에서 랜덤 생성
 */
export class CreateUserDto {
  @ApiProperty({
    description: '사용자 닉네임 (선택사항, 없으면 랜덤 생성)',
    example: '재미있는코알라',
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

  constructor(partial: Partial<CreateUserDto> = {}) {
    Object.assign(this, partial);
  }
}
