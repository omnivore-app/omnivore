// End-to-end tests for the Text-to-Speech WebSocket API.
import 'mocha'
import { server } from '../src/websocket/app'
import { redisClient } from '../src/redis'
import { io, Socket } from 'socket.io-client'
import * as jwt from 'jsonwebtoken'

describe('End-to-end tests', () => {
  const port = 8080
  const uid = '123'
  const token = jwt.sign({ uid }, process.env.JWT_SECRET || '')
  let clientSocket: Socket

  before((done) => {
    // start the server
    server.listen(port, () => {
      console.log(`Websocket server listening on port ${port}`)
      clientSocket = io(`http://localhost:${port}`, {
        extraHeaders: {
          authorization: token,
        },
      })
      clientSocket.on('connect', done)
    })
  })

  after(async () => {
    await redisClient.quit()
    console.log('Redis Client Disconnected')
    clientSocket.close()
    console.log('Websocket client closed')
    // stop the server
    server.close(() => {
      console.log('Websocket server closed')
    })
  })

  it('connects websocket clients', () => {})
})
