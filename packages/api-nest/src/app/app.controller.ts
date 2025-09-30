import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo() {
    return this.appService.getApplicationInfo()
  }

  @Get('version')
  getVersion() {
    return this.appService.getVersion()
  }
}
