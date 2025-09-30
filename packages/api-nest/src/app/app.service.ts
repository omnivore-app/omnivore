import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getApplicationInfo() {
    return {
      name: 'Omnivore NestJS API',
      version: '1.0.0',
      description: 'Migration from Express to NestJS',
      status: 'development',
      timestamp: new Date().toISOString(),
    }
  }

  getVersion() {
    return {
      version: '1.0.0',
      node: process.version,
      environment: process.env.NODE_ENV || 'development',
    }
  }
}
