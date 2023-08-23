import chai, { expect } from 'chai'
import 'mocha'
import sinonChai from 'sinon-chai'
import { Page } from '../../src/elastic/types'
import { ContentDisplayReport } from '../../src/entity/reports/content_display_report'
import { User } from '../../src/entity/user'
import { ReportType } from '../../src/generated/graphql'
import { getRepository } from '../../src/repository'
import { saveContentDisplayReport } from '../../src/services/reports'
import { createTestUser, deleteTestUser } from '../db'
import { createTestElasticPage } from '../util'

chai.use(sinonChai)

describe('saveContentDisplayReport', () => {
  let user: User
  let page: Page

  before(async () => {
    user = await createTestUser('fakeContentUser')
    page = await createTestElasticPage(user.id)
  })

  after(async () => {
    await deleteTestUser(user.id)
  })

  it('creates a report', async () => {
    const result = await saveContentDisplayReport(user.id, {
      itemUrl: 'https://fake.url.com',
      pageId: page.id,
      reportComment: 'report comment',
      reportTypes: [ReportType.ContentDisplay],
    })
    expect(result).to.eql(true)
    const saved = await getRepository(ContentDisplayReport).findOneBy({
      user: { id: user.id },
      elasticPageId: page.id,
    })

    expect(saved?.reportComment).to.eql('report comment')
  })
})
