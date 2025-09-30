import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { UserService } from './user.service'
import { UserResolver } from './user.resolver'
import { RoleService } from './role.service'
import { User, UserProfile, UserPersonalization } from './entities'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, UserPersonalization]),
    ConfigModule,
  ],
  providers: [UserService, UserResolver, RoleService],
  exports: [UserService, RoleService],
})
export class UserModule {}
