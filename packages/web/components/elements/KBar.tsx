import { KBarResults, useMatches } from 'kbar'
import { theme } from '../tokens/stitches.config'
import { Box, SpanBox } from './LayoutPrimitives'

export const searchStyle = {
  padding: '14px 16px',
  fontSize: '16px',
  width: '100%',
  outline: 'none',
  border: 'none',
  boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
  backgroundColor: theme.colors.grayBase.toString(),
  color: theme.colors.grayTextContrast.toString(),
}

export const animatorStyle = {
  width: '100%',
  overflow: 'hidden',
  maxWidth: '600px',
  borderRadius: '8px',
  color: theme.colors.grayTextContrast.toString(),
  backgroundColor: theme.colors.grayBase.toString(),
  boxShadow: theme.shadows.cardBoxShadow.toString(),
  border: `1px solid ${theme.colors.grayBorder.toString()}`,
}

const groupNameStyle = {
  padding: '8px 16px',
  fontSize: '10px',
  textTransform: 'uppercase' as const,
  opacity: 0.5,
}

export const KBarResultsComponents = () => {
  const { results } = useMatches()

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) => {
        return typeof item === 'string' ? (
          <Box style={groupNameStyle}>{item.toLocaleUpperCase()}</Box>
        ) : (
          <Box
            style={{
              background: active
                ? theme.colors.grayBgActive.toString()
                : theme.colors.grayBase.toString(),
              color: theme.colors.grayTextContrast.toString(),
              padding: '0.8rem 1.5rem',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              height: '100',
              borderLeft: `2px solid ${
                active
                  ? theme.colors.grayTextContrast.toString()
                  : 'transparent'
              }`,
              display: 'flex',
              gap: '0',
              fontSize: 16,
            }}
          >
            <Box>{item.name}</Box>
            <Box style={{ display: 'flex', gap: '4px' }}>
              {item.shortcut?.map((st, idx) => (
                <SpanBox
                  key={idx}
                  style={{
                    padding: '4px 6px',
                    background: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  {st}
                </SpanBox>
              ))}
            </Box>
          </Box>
        )
      }}
    />
  )
}
