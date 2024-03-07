import { VStack } from '../elements/LayoutPrimitives'
import { theme } from '../tokens/stitches.config'
import { EditInfoIcon } from './icons/EditInfoIcon'

type InfoLinkProps = {
  href: string
}

export function InfoLink(props: InfoLinkProps): JSX.Element {
  return (
    <VStack
      css={{
        marginLeft: '10px',
      }}
    >
      <a
        href={props.href}
        style={{ textDecoration: 'none', width: '24px', height: '24px' }}
        target="_blank"
        rel="noreferrer"
        title="Lean more"
      >
        <EditInfoIcon size={24} color={theme.colors.grayText.toString()} />
      </a>
    </VStack>
  )
}
