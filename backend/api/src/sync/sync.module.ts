import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Email, EmailSchema } from '../emails/schemas/email.schema';
import { SyncService } from '../sync.service';
import { SyncController } from '../sync.controller';
import { ImapModule } from '../imap/imap.module';

@Module({
  imports: [ImapModule, MongooseModule.forFeature([{ name: Email.name, schema: EmailSchema }])],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
