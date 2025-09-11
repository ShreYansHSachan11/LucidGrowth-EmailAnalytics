import { Module } from '@nestjs/common';
import { GoogleOAuthService } from './google-oauth.service';
import { AuthController } from './auth.controller';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [SyncModule],
  controllers: [AuthController],
  providers: [GoogleOAuthService],
  exports: [GoogleOAuthService],
})
export class AuthModule {}
