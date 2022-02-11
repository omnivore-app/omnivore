/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Storage } from '@google-cloud/storage'
import { parsePdf } from './pdf'
import axios from 'axios'

const storage = new Storage()

const postUpdate = async (
  fileId: string,
  content: string,
  title?: string,
  author?: string,
  description?: string
) => {
  const url =
    'https://backend-dot-omnivore-production.wl.r.appspot.com/svc/pubsub/content/search?token=aYYLeK0kYlwnQg0wBMHO6EoAjf0LkoQ4Dyx0NGtpdjbh7F52EzHda8'

  // const localUrl =
  //   'http://localhost:4000/svc/pubsub/content/search?token=aYYLeK0kYlwnQg0wBMHO6EoAjf0LkoQ4Dyx0NGtpdjbh7F52EzHda8'

  const data = JSON.stringify({
    fileId,
    content,
    title,
    author,
    description,
  })

  const body = {
    message: {
      data: Buffer.from(data).toString('base64'),
    },
  }

  const res = await axios.post(url, body)
  console.log('res', res.status)
}

const listFiles = async () => {
  const res = await storage
    .bucket('omnivore')
    .getFiles({ prefix: 'u/', maxResults: 50 })
  console.log('result', res)

  const [files] = res
  console.log('Files:')
  for (const file of files) {
    const url = file.publicUrl()
    const [isPublic] = await file.isPublic()
    console.log(file.publicUrl(), 'is public:', isPublic)
    if (isPublic) {
      const parsed = await parsePdf(new URL(url))
      // console.log(text)
      // console.log('\n\n')
      await postUpdate(
        file.name,
        parsed.content,
        parsed.title,
        parsed.author,
        parsed.description
      )
    }
  }
}

listFiles().catch(console.error)
