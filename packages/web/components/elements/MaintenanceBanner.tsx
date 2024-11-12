import { usePersistedState } from '../../lib/hooks/usePersistedState'
import { CloseButton } from './CloseButton'
import { HStack, SpanBox } from './LayoutPrimitives'

export const MaintenanceBanner = () => {
  const [
    showMaintenanceMode,
    setShowMaintenanceMode,
    isLoadingShowMaintenanceMode,
  ] = usePersistedState({
    key: 'show-maintenance-mode',
    isSessionStorage: false,
    initialValue: false,
  })
  return (
    <>
      {!isLoadingShowMaintenanceMode && showMaintenanceMode && (
        <HStack
          css={{
            p: '5px',
            width: '100%',
            position: 'fixed',
            bg: '#FF5733',
            color: '#FFFFFF',
            zIndex: '100',
          }}
          alignment="center"
          distribution="center"
        >
          Omnivore will be undergoing maintenance for 30 minutes at 05:00 UTC,
          during that time the website and APIs will be unavailable.
          <SpanBox css={{ width: '50px' }} />
          <CloseButton
            close={() => {
              setShowMaintenanceMode(false)
            }}
          />
        </HStack>
      )}
    </>
  )
}
