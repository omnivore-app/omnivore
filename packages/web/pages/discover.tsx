import { PrimaryLayout } from '../components/templates/PrimaryLayout'

export default function Discover(): JSX.Element {
  return (
    <PrimaryLayout
      pageMetaDataProps={{
        title: 'Discover - Omnivore',
        path: '/discover',
      }}
      pageTestId="discover-page-tag"
    >
      Discover Page
    </PrimaryLayout>
  )
}
