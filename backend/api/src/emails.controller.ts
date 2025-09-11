import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { EmailsService } from './emails.service';

@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Get()
  findAll(@Query('limit') limit = '50') {
    return this.emailsService.findAll(Number(limit));
  }

  @Get('folders')
  listFolders(@Query('account') account?: string) {
    return this.emailsService.listFolders(account);
  }

  @Get('folder')
  findByFolder(@Query('path') path: string, @Query('account') account?: string, @Query('limit') limit = '50') {
    return this.emailsService.findByFolder(path, account, Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emailsService.findById(id);
  }

  @Patch(':id/flags')
  updateFlags(@Param('id') id: string, @Body() body: { seen?: boolean; flagged?: boolean; answered?: boolean; draft?: boolean; deleted?: boolean }) {
    return this.emailsService.updateFlags(id, body);
  }
}
