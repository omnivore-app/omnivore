import { PageMetaData } from "../components/patterns/PageMetaData"
import { About } from "../components/templates/About"

export default function LandingPage(): JSX.Element {
  return (
    <>
      <PageMetaData
        title="Omnivore"
        path="/about"
        ogImage="/static/images/og-homepage-03.png"
        description="Omnivore is the free, open source, read-it-later app for serious readers."
      />

      <About lang="en" />
    </>
  )
}
