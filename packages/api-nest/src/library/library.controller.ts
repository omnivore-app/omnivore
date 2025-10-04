import { Controller, Post, UseGuards, HttpCode } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../user/decorators/current-user.decorator'
import { User } from '../user/entities/user.entity'
import { seedLibraryItems } from '../database/seeds/library-items.seed'

@Controller('library')
export class LibraryController {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Development endpoint to seed example library items for current user
   * DELETE this endpoint before production deployment
   */
  @Post('seed')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async seedLibrary(@CurrentUser() user: User) {
    console.log(`[Controller] Seeding library for user: ${user.id}`)

    try {
      const items = await seedLibraryItems(this.dataSource, user.id)

      return {
        success: true,
        message: `Seeded ${items.length} example library items`,
        itemIds: items.map((item) => item.id),
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          folder: item.folder,
          state: item.state,
        })),
      }
    } catch (error) {
      console.error('[Controller] Seed failed:', error)
      throw error
    }
  }
}
