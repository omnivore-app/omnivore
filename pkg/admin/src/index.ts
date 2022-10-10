import express from 'express'
import AdminJs from 'adminjs'
import AdminJsExpress from '@adminjs/express'
import {
  registerDatabase,
  AdminUser,
  User,
  UserArticle,
  UserProfile,
} from './db'
import { compare, hashSync } from 'bcryptjs'

const app = express()
const port = process.env.PORT || '8000'
const ADMIN_USER_EMAIL =
  process.env.ADMIN_USER_EMAIL || 'admin-user@omnivore.app'

;(async () => {
  const db = await registerDatabase()

  const adminBro = new AdminJs({
    databases: [db],
    rootPath: '/admin',
    resources: [
      {
        resource: User,
        options: {
          parent: { name: 'Users' },
        },
      },
      { resource: UserProfile, options: { parent: { name: 'Users' } } },
      { resource: UserArticle, options: { parent: { name: 'Users' } } },
    ],
  })

  const router = AdminJsExpress.buildAuthenticatedRouter(adminBro, {
    authenticate: async (email, password) => {
      const user = await AdminUser.findOne({ email })
      if (user) {
        const matched = await compare(password, user.password)
        return matched ? user : false
      } else if (email === ADMIN_USER_EMAIL) {
        // If no admin user has been created yet, create one
        // from the environment variables. This is only done
        // once, and then the admin user should create a user
        // for each user.
        if (!process.env.ADMIN_USER_PASSWORD) {
          throw new Error('ADMIN_USER_PASSWORD is not set')
        }
        return AdminUser.create({
          email: ADMIN_USER_EMAIL,
          password: hashSync(process.env.ADMIN_USER_PASSWORD, 10),
        })
      }
      return false
    },
    cookiePassword:
      process.env.ADMIN_COOKIE_SECRET ||
      'some-secret-password-used-to-secure-cookie',
  })

  app.use(adminBro.options.rootPath, router)

  app.listen(port, () => {
    return console.log(`Server is listening on ${port}`)
  })
})()
