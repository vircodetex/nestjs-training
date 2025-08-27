import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DummyService } from './dummy-service/dummy.service';
import { LoggerService } from './logger/logger.service';
import { MessageFormatterService } from './message-formatter/message-formatter.service';
import { TasksModule } from './tasks/tasks.module';
import { appConfig } from './config/app.config';
import { appConfigSchema } from './config/config.types';
import { typeOrmConfig } from './config/database.config';
import { TypedConfigService } from './config/typed-config.service';
import { Task } from './tasks/task.entity';
import { User } from './users/user.entity';
import { TaskLabel } from './tasks/task-label.entity';
import { authConfig } from './config/auth.config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, typeOrmConfig, authConfig],
      validationSchema: appConfigSchema,
      validationOptions: {
        allowUnknown: true, // false if in an isolated environment
        abortEarly: true // false to return all errors
      },
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: TypedConfigService) => {
        const dbConfig = {
          ...configService.get('database'),
          entities: [Task, TaskLabel, User]
        };
        console.log('AAAAAAAAAA TypeORM config:', JSON.stringify(dbConfig, null, 2));
        return dbConfig;
      },
    }),
    TasksModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DummyService,
    LoggerService,
    MessageFormatterService,
    {
      provide: TypedConfigService,
      useExisting: ConfigService,
    },
  ],
})
export class AppModule {
  constructor() {
    console.log('BBBBBBBBBB ENV VARIABLES:', JSON.stringify(process.env, null, 2));
  }
}
