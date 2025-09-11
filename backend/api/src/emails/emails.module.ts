import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailsService } from '../emails.service';
import { EmailsController } from '../emails.controller';
import { Email, EmailSchema } from './schemas/email.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Email.name, schema: EmailSchema }])],
  controllers: [EmailsController],
  providers: [EmailsService],
  exports: [MongooseModule],
})
export class EmailsModule {}

