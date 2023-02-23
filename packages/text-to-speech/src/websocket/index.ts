import { server } from './app'
import { redisClient } from '../redis'

const PORT = parseInt(process.env.PORT || '') || 8080
server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})

// Clean up resources on shutdown
process.on('SIGTERM', () => {
  console.log('received SIGTERM')
  server.close(() => {
    console.log('HTTP server closed')
    redisClient
      .quit()
      .then(() => {
        console.log('Redis Client Disconnected')
      })
      .catch((err) => console.error('Redis Client Disconnection Error', err))
      .finally(() => process.exit(0))
  })
})
