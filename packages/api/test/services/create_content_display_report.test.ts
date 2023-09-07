import chai, { expect } from 'chai'
import 'mocha'
import sinonChai from 'sinon-chai'
import { LibraryItem } from '../../src/entity/library_item'
import { ContentDisplayReport } from '../../src/entity/reports/content_display_report'
import { User } from '../../src/entity/user'
import { ReportType } from '../../src/generated/graphql'
import { getRepository } from '../../src/repository'
import { saveContentDisplayReport } from '../../src/services/reports'
import { deleteUser } from '../../src/services/user'
import { createTestLibraryItem, createTestUser } from '../db'

chai.use(sinonChai)

describe('saveContentDisplayReport', () => {
  let user: User
  let item: LibraryItem

  before(async () => {
    user = await createTestUser('fakeContentUser')
    item = await createTestLibraryItem(user.id)
  })

  after(async () => {
    await deleteUser(user.id)
  })

  it('creates a report', async () => {
    const result = await saveContentDisplayReport(user.id, {
      itemUrl: 'https://fake.url.com',
      pageId: item.id,
      reportComment: 'report comment',
      reportTypes: [ReportType.ContentDisplay],
    })
    expect(result).to.eql(true)
    const saved = await getRepository(ContentDisplayReport).findOneBy({
      user: { id: user.id },
      libraryItemId: item.id,
    })

    expect(saved?.reportComment).to.eql('report comment')
  })
})
