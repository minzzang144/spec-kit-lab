import { Module } from '@nestjs/common';
import { SchemaController } from './schema.controller';
import { SchemaService } from './schema.service';

@Module({
  controllers: [SchemaController],
  providers: [SchemaService],
  exports: [SchemaService], // 다른 모듈에서 SchemaService를 사용할 수 있도록 export
})
export class SchemaModule {}