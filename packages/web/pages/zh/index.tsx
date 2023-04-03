import { PageMetaData } from '../../components/patterns/PageMetaData'
import { About } from '../../components/templates/About'

export default function LandingPage(): JSX.Element {
  return (
    <>
      <PageMetaData
        title="Omnivore"
        path="/about"
        ogImage="/static/images/og-homepage-zh.png"
        description="Omnivore 为认真读者提供免付费read-it-later应用程序"
      />

      <About lang="zh" />
    </>
  )
}
