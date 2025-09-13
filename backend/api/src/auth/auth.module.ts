import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleOAuthService } from './google-oauth.service';
import { AuthController } from './auth.controller';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [SyncModule, ConfigModule],
  controllers: [AuthController],
  providers: [GoogleOAuthService],
  exports: [GoogleOAuthService],
})
export class AuthModule {}
