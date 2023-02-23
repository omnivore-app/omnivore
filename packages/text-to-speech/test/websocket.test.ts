// End-to-end tests for the Text-to-Speech WebSocket API.
import 'mocha'
import { server } from '../src/websocket/app'
import { redisClient } from '../src/redis'
import { io, Socket } from 'socket.io-client'
import * as jwt from 'jsonwebtoken'
import sinon from 'sinon'
import * as myModule from '../src/index'
import { expect } from 'chai'

describe('End-to-end tests', () => {
  const port = 8080
  const uid = '123'
  const token = jwt.sign({ uid }, process.env.JWT_SECRET || '')
  let clientSocket: Socket

  before((done) => {
    sinon.replace(
      myModule,
      'synthesizeTextToSpeech',
      sinon.fake.resolves({ audioData: Buffer.from('test'), speechMarks: [] })
    )
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
    sinon.restore()
    await redisClient.quit()
    console.log('Redis Client Disconnected')
    clientSocket.close()
    console.log('Websocket client closed')
    // stop the server
    server.close(() => {
      console.log('Websocket server closed')
    })
  })

  it('synthesize text and emit result', (done) => {
    clientSocket.emit('synthesize', {
      text: 'Hello world',
      voice: 'en-US-ChristopherNeural',
      idx: 0,
      isUltraRealisticVoice: false,
    })
    clientSocket.on('synthesizedResult', (result) => {
      expect(result.audioData).to.eql('test')
      done()
    })
  })
})
