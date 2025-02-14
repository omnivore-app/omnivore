import chokidar from 'chokidar'
import { simpleParser } from 'mailparser'
import * as fs from 'node:fs'
import { convertToMailObject, sendToEmailApi } from './lib/emailApi'
import { env } from './env'

chokidar.watch(env.filesystem.filePath).on('add', (path, _event) => {
  console.log(path)
  const contents = fs.readFileSync(path).toString()
  void simpleParser(contents)
    .then(convertToMailObject)
    .then(async (emailData) => {
      await sendToEmailApi(emailData)
      console.log('Sent to email API')
    })
    .then(() => {
      if (process.env['DELETE_FILE'] == 'true') {
        fs.unlinkSync(path)
      }
      console.log('Deleted File')
    })
})
