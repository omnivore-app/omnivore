import { Pencil, Trash } from '@phosphor-icons/react'
import { Toaster } from 'react-hot-toast'
import { Button } from '../../elements/Button'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { MoreOptionsIcon } from '../../elements/images/MoreOptionsIcon'
import { InfoLink } from '../../elements/InfoLink'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { styled, theme } from '../../tokens/stitches.config'
import { SettingsLayout } from '../SettingsLayout'
import { usePersistedState } from '../../../lib/hooks/usePersistedState'
import { FeatureHelpBox } from '../../elements/FeatureHelpBox'

// Styles
export const Header = styled(Box, {
  color: '$utilityTextDefault',
  fontSize: 'x-large',
  margin: '20px',
})

type SettingsTableProps = {
  pageId: string
  pageInfoLink?: string | undefined
  headerTitle: string

  createTitle?: string
  createAction?: () => void

  suggestionInfo: SuggestionInfo

  children: React.ReactNode
}

type CreateButtonProps = {
  title: string
  action: () => void
}

type SettingsTableRowProps = {
  title: string | JSX.Element
  isLast: boolean

  onClick?: () => void

  sublineElement: JSX.Element
  titleElement?: JSX.Element
  extraElement?: JSX.Element

  deleteTitle?: string
  onDelete?: () => void

  dropdownItems?: JSX.Element

  editTitle?: string
  onEdit?: () => void
}

type MoreOptionsProps = {
  deleteTitle?: string
  onDelete?: () => void
  dropdownItems?: JSX.Element
  editTitle?: string
  onEdit?: () => void
}

type SuggestionInfo = {
  title: string
  message: string
  docs: string
  key: string

  CTAText?: string
  onClickCTA?: () => void
}

const MoreOptions = (props: MoreOptionsProps) => (
  <Dropdown
    align={'end'}
    triggerElement={
      <Box
        css={{
          '&:hover': {
            cursor: 'pointer',
          },
        }}
      >
        <MoreOptionsIcon
          size={24}
          strokeColor={theme.colors.grayTextContrast.toString()}
          orientation="horizontal"
        />
      </Box>
    }
  >
    {props.onEdit && props.editTitle && (
      <DropdownOption
        onSelect={() => {
          props.onEdit && props.onEdit()
        }}
      >
        <HStack alignment={'center'} distribution={'start'}>
          <Pencil size={24} color={theme.colors.omnivoreLightGray.toString()} />
          <SpanBox
            css={{
              color: theme.colors.omnivoreLightGray.toString(),
              marginLeft: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              '&:hover': {
                border: 'none',
                backgroundColor: 'transparent',
              },
            }}
          >
            {props.editTitle}
          </SpanBox>
        </HStack>
      </DropdownOption>
    )}

    {props.onDelete && props.deleteTitle && (
      <DropdownOption
        onSelect={() => {
          props.onDelete && props.onDelete()
        }}
      >
        <HStack alignment={'center'} distribution={'start'}>
          <Trash size={24} color={theme.colors.omnivoreRed.toString()} />
          <SpanBox
            css={{
              color: theme.colors.omnivoreRed.toString(),
              marginLeft: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              '&:hover': {
                border: 'none',
                backgroundColor: 'transparent',
              },
            }}
          >
            {props.deleteTitle}
          </SpanBox>
        </HStack>
      </DropdownOption>
    )}
    {props.dropdownItems && props.dropdownItems}
  </Dropdown>
)

type EmptySettingsRowProps = {
  text: string
}

export const EmptySettingsRow = (props: EmptySettingsRowProps): JSX.Element => {
  return (
    <Box
      css={{
        backgroundColor: '$grayBg',
        display: 'flex',
        alignItems: 'center',
        padding: '10px 12px',
        border: '0.5px solid $grayBgActive',
        width: '100%',
        borderBottomLeftRadius: '5px',
        borderBottomRightRadius: '5px',
        '@md': {
          paddingLeft: '0',
        },
        justifyContent: 'center',
      }}
    >
      {props.text}
    </Box>
  )
}

export const SettingsTableRow = (props: SettingsTableRowProps): JSX.Element => {
  return (
    <Box
      css={{
        backgroundColor: '$grayBg',
        display: 'flex',
        alignItems: 'center',
        padding: '10px 12px',
        border: '0.5px solid $grayBgActive',
        width: '100%',
        cursor: !!props.onClick ? 'pointer' : 'unset',
        '&:hover': {
          background: 'rgba(255, 234, 159, 0.12)',
        },
        borderBottomLeftRadius: props.isLast ? '5px' : '',
        borderBottomRightRadius: props.isLast ? '5px' : '',
        '@md': {
          paddingLeft: '0',
        },
      }}
      onClick={props.onClick}
    >
      <Box
        css={{
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
          '@md': {
            paddingLeft: '20px',
            flexDirection: 'row',
          },
        }}
      >
        <HStack
          distribution="start"
          css={{
            display: 'flex',
            padding: '4px 4px 4px 0px',
            '@md': {
              width: '70%',
            },
          }}
        >
          <VStack>
            <SpanBox
              css={{
                m: '0px',
                fontSize: '18px',
                '@mdDown': {
                  fontSize: '12px',
                  fontWeight: 'bold',
                },
              }}
            >
              {props.title}
            </SpanBox>
            {props.sublineElement}
          </VStack>
          <SpanBox css={{ marginLeft: 'auto' }}>{props.titleElement}</SpanBox>
          <Box
            css={{
              marginLeft: 'auto',
              textAlign: 'right',
              display: 'flex',
              '@md': {
                display: 'none',
              },
            }}
          >
            <MoreOptions
              deleteTitle={props.deleteTitle}
              onDelete={props.onDelete}
              dropdownItems={props.dropdownItems}
              editTitle={props.editTitle}
              onEdit={props.onEdit}
            />
          </Box>
        </HStack>
        {props.extraElement}
      </Box>
      <HStack distribution="start" css={{ marginLeft: 'auto' }}>
        <Box
          css={{
            textAlign: 'right',
            display: 'none',
            '@md': {
              display: 'flex',
            },
          }}
        >
          <MoreOptions
            deleteTitle={props.deleteTitle}
            onDelete={props.onDelete}
            dropdownItems={props.dropdownItems}
            editTitle={props.editTitle}
            onEdit={props.onEdit}
          />
        </Box>
      </HStack>
    </Box>
  )
}

const CreateButton = (props: CreateButtonProps): JSX.Element => {
  return (
    <Button
      onClick={props.action}
      style="ctaDarkYellow"
      css={{
        display: 'flex',
        alignItems: 'center',
        marginLeft: 'auto',
      }}
    >
      <SpanBox>{props.title}</SpanBox>
    </Button>
  )
}

export const SettingsTable = (props: SettingsTableProps): JSX.Element => {
  const [showSuggestion, setShowSuggestion] = usePersistedState<boolean>({
    key: props.suggestionInfo.key,
    initialValue: !!props.suggestionInfo,
  })

  return (
    <SettingsLayout>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />
      <HStack css={{ width: '100%' }} alignment="center">
        <VStack
          alignment="start"
          distribution="center"
          css={{
            mx: '10px',
            width: '100%',
            height: '100%',
            maxWidth: '865px',
            color: '$grayText',
            paddingBottom: '5rem',
            paddingTop: '2rem',
            alignSelf: 'center',
            '@md': {
              m: '16px',
              alignSelf: 'center',
              mx: '42px',
              paddingTop: '0',
            },
          }}
        >
          {props.suggestionInfo && showSuggestion && (
            <FeatureHelpBox
              helpTitle={props.suggestionInfo.title}
              helpMessage={props.suggestionInfo.message}
              docsMessage={'Read the Docs'}
              docsDestination={props.suggestionInfo.docs}
              onDismiss={() => {
                setShowSuggestion(false)
              }}
              helpCTAText={props.suggestionInfo.CTAText}
              onClickCTA={props.suggestionInfo.onClickCTA}
            />
          )}
          <Box
            css={{
              width: '100%',
              '@md': {
                display: 'block',
              },
            }}
          >
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
                height: '60px',
              }}
            >
              {props.createAction && props.createTitle && (
                <CreateButton
                  action={props.createAction}
                  title={props.createTitle}
                />
              )}
            </Box>
            <Box
              css={{
                backgroundColor: '$grayBgActive',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderBottom: 'unset',
                alignItems: 'center',
                padding: '10px 0 10px 20px',
                borderRadius: '5px 5px 0px 0px',
                width: '100%',
              }}
            >
              <HStack alignment="start" distribution="start">
                <StyledText
                  style="menuTitle"
                  css={{
                    color: '$grayTextContrast',
                  }}
                >
                  {props.headerTitle}
                </StyledText>
                {props.pageInfoLink && (
                  <InfoLink href={props.pageInfoLink}></InfoLink>
                )}
              </HStack>
            </Box>
          </Box>
          {props.children}
        </VStack>
      </HStack>
      <Box css={{ height: '120px' }} />
    </SettingsLayout>
  )
}
