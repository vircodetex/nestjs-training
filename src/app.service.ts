import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';
import { DummyService } from './dummy-service/dummy.service';
import { AppConfig } from './config/app.config';
import { TypedConfigService } from './config/typed-config.service';

@Injectable()
export class AppService {
  constructor(
    private readonly dummyService: DummyService,
    private readonly logger: LoggerService,
    private readonly configService: TypedConfigService,
  ) { }

  getHello(): string {
    const prefix = this.configService.get<AppConfig>('app')?.messagePrefix;
    return this.logger.log(`${prefix} Hello World! ${this.dummyService.getWorkDone()}`);
  }
}

