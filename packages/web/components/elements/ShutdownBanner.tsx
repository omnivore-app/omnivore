import { usePersistedState } from '../../lib/hooks/usePersistedState'
import { CloseButton } from './CloseButton'
import { HStack, SpanBox } from './LayoutPrimitives'

export const ShutdownBanner = () => {
  const [
    showMaintenanceMode,
    setShowMaintenanceMode,
    isLoadingShowMaintenanceMode,
  ] = usePersistedState({
    key: 'show-shutdown-mode',
    isSessionStorage: true,
    initialValue: true,
  })
  return (
    <>
      {!isLoadingShowMaintenanceMode && showMaintenanceMode && (
        <HStack
          css={{
            p: '5px',
            top: 0,
            left: 0,
            width: '100vw',
            position: 'absolute',
            bg: '#FF5733',
            color: '#FFFFFF',
            zIndex: '100',
            font: '$inter',
            gap: '10px',
          }}
          alignment="start"
          distribution="center"
        >
          Omnivore is shutting down on Nov. 30th.
          <a
            href="https://blog.omnivore.app/p/details-on-omnivore-shutting-down"
            target="_blank"
            rel="noreferrer"
          >
            Read More
          </a>
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
