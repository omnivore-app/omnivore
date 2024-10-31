import express from 'express'
import AdminJs from 'adminjs'
import AdminJsExpress from '@adminjs/express'
import {
  registerDatabase,
  AdminUser,
  User,
  UserProfile,
  ReceivedEmail,
  Group,
  ContentDisplayReport,
  Subscription,
  Integration,
  LibraryItem,
  Recommendation,
  GroupMembership,
  Features,
  EmailAddress,
  Rule,
  Export,
} from './db'
import { compare, hashSync } from 'bcryptjs'
const readYamlFile = require('read-yaml-file')

const app = express()
const port = process.env.PORT || '8000'
const ADMIN_USER_EMAIL =
  process.env.ADMIN_USER_EMAIL || 'admin-user@omnivore.app'

;(async () => {
  const secrets = await readYamlFile(process.env.SECRETS_FILE)
  const db = await registerDatabase(secrets)

  const adminBro = new AdminJs({
    databases: [db],
    rootPath: '/admin',
    resources: [
      {
        resource: ContentDisplayReport,
      },
      {
        resource: User,
        options: {
          parent: { name: 'Users' },
        },
      },
      { resource: UserProfile, options: { parent: { name: 'Users' } } },
      { resource: ReceivedEmail, options: { parent: { name: 'Users' } } },
      { resource: Group, options: { parent: { name: 'Users' } } },
      { resource: Subscription, options: { parent: { name: 'Users' } } },
      { resource: Integration, options: { parent: { name: 'Users' } } },
      { resource: LibraryItem, options: { parent: { name: 'Users' } } },
      { resource: Recommendation, options: { parent: { name: 'Users' } } },
      { resource: GroupMembership, options: { parent: { name: 'Users' } } },
      { resource: Features, options: { parent: { name: 'Users' } } },
      { resource: EmailAddress, options: { parent: { name: 'Users' } } },
      { resource: Rule, options: { parent: { name: 'Users' } } },
      { resource: Export, options: { parent: { name: 'Users' } } },
    ],
  })

  const router = AdminJsExpress.buildAuthenticatedRouter(adminBro, {
    authenticate: async (email, password) => {
      const user = await AdminUser.findOne({ email })
      if (user) {
        const matched = await compare(password, user.password)
        console.log(' -- failed match')
        return matched ? user : false
      } else if (email === ADMIN_USER_EMAIL) {
        console.log('user is admin user, creating account')
        // If no admin user has been created yet, create one
        // from the environment variables. This is only done
        // once, and then the admin user should create a user
        // for each user.
        if (!secrets.ADMIN_USER_PASSWORD) {
          throw new Error('ADMIN_USER_PASSWORD is not set')
        }
        return AdminUser.create({
          email: ADMIN_USER_EMAIL,
          password: hashSync(secrets.ADMIN_USER_PASSWORD, 10),
        })
      }
      return false
    },
    cookiePassword:
      secrets.ADMIN_USER_PASSWORD ||
      'some-secret-password-used-to-secure-cookie',
  })

  app.use(adminBro.options.rootPath, router)

  app.listen(port, () => {
    return console.log(`Server is listening on ${port}`)
  })
})()
