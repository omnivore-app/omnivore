import { PageMetaData } from '../../../components/patterns/PageMetaData'
import { Webhooks } from '../../../components/templates/integrations/Webhooks'
import { SettingsLayout } from '../../../components/templates/SettingsLayout'

export default function ReadwisePage(): JSX.Element {
  return (
    <>
      <PageMetaData title="Readwise - Omnivore" path="/integrations/webhooks" />
      <SettingsLayout>
        <Webhooks />
      </SettingsLayout>
      <div data-testid="integrations-readwise-page-tag" />
    </>
  )
}
