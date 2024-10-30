import { usePersistedState } from '../../lib/hooks/usePersistedState'
import { CloseButton } from './CloseButton'
import { HStack, SpanBox } from './LayoutPrimitives'

export const AnnouncementBanner = () => {
  const [
    showMaintenanceMode,
    setShowMaintenanceMode,
    isLoadingShowMaintenanceMode,
  ] = usePersistedState({
    key: 'show-maintenance-mode-03',
    isSessionStorage: false,
    initialValue: true,
  })
  return (
    <>
      <SpanBox
        css={{
          p: '5px',
          px: '16px',
          mt: '0px',
          mb: '10px',
          bg: '#FF5733',
          width: '100%',
          color: '#FFFFFF',
          zIndex: '100',
          fontSize: '12px',
        }}
      >
        Omnivore is joining ElevenLabs and will be shutting down the free hosted
        version. Read more <a href=""> here.</a>
      </SpanBox>
    </>
  )
}
