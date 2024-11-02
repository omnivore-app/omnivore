import chokidar from 'chokidar'
import { simpleParser } from 'mailparser'
import * as fs from 'node:fs'
import { sendToEmailApi } from './lib/emailApi'
import { env } from './env'

chokidar.watch(env.filesystem.filePath).on('add', (path, _event) => {
  console.log(path)
  const contents = fs.readFileSync(path).toString()
  simpleParser(contents)
    .then((it) => ({
      from: it.from?.value[0]?.address || '',
      to: (Array.isArray(it.to) ? it.to[0].text : it.to?.text) || '',
      subject: it.subject || '',
      html: it.html || '',
      text: it.text || '',
      headers: it.headers,
    }))
    .then(async (emailData) => {
      await sendToEmailApi(emailData)
      console.log('Sent to email API')
    })
    .then(() => {
      fs.unlinkSync(path)
      console.log('Deleted File')
    })
})
