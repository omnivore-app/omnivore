import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { AppService } from './app.service'

describe('AppController', () => {
  let appController: AppController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile()

    appController = app.get<AppController>(AppController)
  })

  describe('getInfo', () => {
    it('should return application info', () => {
      const result = appController.getInfo()
      expect(result).toHaveProperty('name', 'Omnivore NestJS API')
      expect(result).toHaveProperty('version', '1.0.0')
      expect(result).toHaveProperty('status', 'development')
    })
  })

  describe('getVersion', () => {
    it('should return version info', () => {
      const result = appController.getVersion()
      expect(result).toHaveProperty('version', '1.0.0')
      expect(result).toHaveProperty('node')
      expect(result).toHaveProperty('environment')
    })
  })
})
