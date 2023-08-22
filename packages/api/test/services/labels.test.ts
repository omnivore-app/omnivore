import 'mocha'
import { expect } from 'chai'
import {
  createTestLabel,
  createTestLink,
  createTestPage,
  createTestUser,
  deleteTestUser,
} from '../db'
import { LinkLabel } from '../../src/entity/link_label'
import { Label } from '../../src/entity/label'
import { Link } from '../../src/entity/link'
import { labelsLoader } from '../../src/services/labels'
import { getRepository } from '../../src/entity'
import { User } from '../../src/entity/user'

describe('batch get labels from linkIds', () => {
  let user: User
  let labels: Label[] = []
  let link: Link

  before(async () => {
    // create test user
    user = await createTestUser('fakeUser')

    // Create some test links
    const page = await createTestPage()
    link = await createTestLink(user, page)

    for (let i = 0; i < 3; i++) {
      //  create testing labels
      const label = await createTestLabel(user, `label_${i}`, '#d55757')
      //  set label to a link
      await getRepository(LinkLabel).save({
        link: link,
        label: label,
      })
      labels.push(label)
    }
  })

  after(async () => {
    // clean up
    await deleteTestUser(user.id)
  })

  it('should return a list of label from one link', async () => {
    const result = await labelsLoader.load(link.id)

    expect(result).length(3)
    expect(result[0].id).to.eql(labels[0].id)
    expect(result[1].id).to.eql(labels[1].id)
    expect(result[2].id).to.eql(labels[2].id)
  })
})
