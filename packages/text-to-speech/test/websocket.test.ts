// End-to-end tests for the Text-to-Speech WebSocket API.
import 'mocha'
import { server } from '../src/websocket/app'
import { redisClient } from '../src/redis'
import { io, Socket } from 'socket.io-client'

describe('End-to-end tests', () => {
  const port = 8080
  let clientSocket: Socket

  before(() => {
    // start the server
    server.listen(port, () => {
      console.log(`Websocket server listening on port ${port}`)
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

  it('connects websocket clients', (done) => {
    clientSocket = io(`http://localhost:${port}`, {
      extraHeaders: {
        authorization: 'Bearer 123',
      },
    })
    clientSocket.on('connect', done)
  })
})
