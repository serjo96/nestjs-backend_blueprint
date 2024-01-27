import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

import { AppService } from './app.service';
import { EmailService } from './email/email.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly emailService: EmailService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string' },
      },
    },
  })
  @Post('send-test-email')
  async sendTestEmail(@Body() { email }: { email: string }) {
    return this.emailService.testSend(email);
  }
}
