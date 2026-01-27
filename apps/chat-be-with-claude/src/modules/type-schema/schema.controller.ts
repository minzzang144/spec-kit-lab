import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SchemaService } from './schema.service';

@ApiTags('Type Schema')
@Controller('api/schema')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Get('socket-types')
  @ApiOperation({
    summary: 'Socket.IO 타입 스키마 조회',
    description:
      'Frontend에서 TypeScript 타입을 자동 생성하기 위한 Socket.IO 이벤트 스키마를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'Socket.IO 타입 스키마 JSON',
    schema: {
      type: 'object',
      properties: {
        version: { type: 'string', example: '1.0.0' },
        timestamp: { type: 'string', format: 'date-time' },
        clientToServer: {
          type: 'object',
          description: 'Client → Server 이벤트 스키마',
        },
        serverToClient: {
          type: 'object',
          description: 'Server → Client 이벤트 스키마',
        },
        dataModels: { type: 'object', description: '데이터 모델 스키마' },
        typescript: {
          type: 'string',
          description: 'TypeScript 인터페이스 코드',
        },
      },
    },
  })
  @Header('Content-Type', 'application/json')
  getSocketTypeSchema() {
    return this.schemaService.getFullSchema();
  }

  @Get('socket-types.ts')
  @ApiOperation({
    summary: 'TypeScript 타입 파일 다운로드',
    description: 'Socket.IO 타입 정의를 TypeScript 파일로 다운로드합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'TypeScript 타입 정의 파일',
    schema: {
      type: 'string',
    },
  })
  @Header('Content-Type', 'text/plain')
  @Header('Content-Disposition', 'attachment; filename="socket-types.ts"')
  getSocketTypesFile() {
    return this.schemaService.generateTypeScriptTypes();
  }

  @Get('client-to-server')
  @ApiOperation({
    summary: 'Client → Server 이벤트 스키마 조회',
    description:
      '클라이언트에서 서버로 전송하는 Socket.IO 이벤트들의 스키마를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'Client → Server 이벤트 스키마 JSON',
  })
  @Header('Content-Type', 'application/json')
  getClientToServerSchema() {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      events: this.schemaService.generateClientToServerSchema(),
    };
  }

  @Get('server-to-client')
  @ApiOperation({
    summary: 'Server → Client 이벤트 스키마 조회',
    description:
      '서버에서 클라이언트로 전송하는 Socket.IO 이벤트들의 스키마를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'Server → Client 이벤트 스키마 JSON',
  })
  @Header('Content-Type', 'application/json')
  getServerToClientSchema() {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      events: this.schemaService.generateServerToClientSchema(),
    };
  }

  @Get('data-models')
  @ApiOperation({
    summary: '데이터 모델 스키마 조회',
    description:
      '애플리케이션에서 사용하는 데이터 모델들의 스키마를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '데이터 모델 스키마 JSON',
  })
  @Header('Content-Type', 'application/json')
  getDataModelsSchema() {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      models: this.schemaService.generateDataModelsSchema(),
    };
  }
}
