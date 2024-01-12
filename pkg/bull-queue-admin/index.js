const { createBullBoard } = require('@bull-board/api')
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter')
const { ExpressAdapter } = require('@bull-board/express')
const { Queue: QueueMQ, Worker } = require('bullmq')
const { Redis } = require('ioredis')
const session = require('express-session')
const bodyParser = require('body-parser')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { ensureLoggedIn } = require('connect-ensure-login')
const express = require('express')

const readYamlFile = require('read-yaml-file')

passport.use(
  new LocalStrategy(function (username, password, cb) {
    readYamlFile(process.env.SECRETS_FILE).then((secrets) => {
      if (
        secrets.ADMIN_USER_PASSWORD &&
        username === secrets.ADMIN_USER_EMAIL &&
        password === secrets.ADMIN_USER_PASSWORD
      ) {
        return cb(null, { user: 'bull-board' })
      }
      return cb(null, false)
    })
  })
)

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser((user, cb) => {
  cb(null, user)
})

passport.deserializeUser((user, cb) => {
  cb(null, user)
})

const run = async () => {
  const secrets = await readYamlFile(process.env.SECRETS_FILE)
  const redisOptions = (secrets) => {
    if (secrets.REDIS_URL?.startsWith('rediss://') && secrets.REDIS_CERT) {
      return {
        tls: {
          cert: secrets.REDIS_CERT,
          rejectUnauthorized: false,
        },
        maxRetriesPerRequest: null,
      }
    }
    return {
      maxRetriesPerRequest: null,
    }
  }

  const connection = new Redis(secrets.REDIS_URL, {
    tls: {
      cert: secrets.REDIS_CERT,
      rejectUnauthorized: false,
    },
    maxRetriesPerRequest: null,
  })
  console.log('set connection: ', connection)

  const rssRefreshFeed = new QueueMQ('rssRefreshFeed', {
    connection: connection,
  })

  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath('/ui')

  createBullBoard({
    queues: [new BullMQAdapter(rssRefreshFeed)],
    serverAdapter,
  })

  const app = express()
  // Configure view engine to render EJS templates.
  app.set('views', __dirname + '/views')
  app.set('view engine', 'ejs')

  app.use(
    session({ secret: 'keyboard cat', saveUninitialized: true, resave: true })
  )
  app.use(bodyParser.urlencoded({ extended: false }))

  // Initialize Passport and restore authentication state, if any, from the session.
  app.use(passport.initialize({}))
  app.use(passport.session({}))

  app.get('/ui/login', (req, res) => {
    res.render('login', { invalid: req.query.invalid === 'true' })
  })

  app.post(
    '/ui/login',
    passport.authenticate('local', {
      failureRedirect: '/ui/login?invalid=true',
    }),
    (req, res) => {
      res.redirect('/ui')
    }
  )

  app.use('/add', (req, res) => {
    const opts = req.query.opts || {}

    if (opts.delay) {
      opts.delay = +opts.delay * 1000 // delay must be a number
    }

    rssRefreshFeed.add('Add', { title: req.query.title }, opts)

    res.json({
      ok: true,
    })
  })

  app.use(
    '/ui',
    ensureLoggedIn({ redirectTo: '/ui/login' }),
    serverAdapter.getRouter()
  )

  app.listen(3000, () => {
    console.log('Running on 3000...')
  })
}

// eslint-disable-next-line no-console
run().catch((e) => console.error(e))
