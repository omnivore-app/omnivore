import { PageMetaData } from '../../../components/patterns/PageMetaData'
import { Readwise } from '../../../components/templates/integrations/Readwise'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'

export default function ReadwisePage(): JSX.Element {
  return (
    <>
      <PageMetaData title="Readwise - Omnivore" path="/integrations/readwise" />
      <SettingsLayout>
        <Readwise />
      </SettingsLayout>
      <div data-testid="integrations-readwise-page-tag" />
    </>
  )
}
