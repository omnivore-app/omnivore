import Link from 'next/link'
import { Plus, Trash } from 'phosphor-react'
import { Toaster } from 'react-hot-toast'
import { Button } from '../../elements/Button'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { MoreOptionsIcon } from '../../elements/images/MoreOptionsIcon'
import { InfoLink } from '../../elements/InfoLink'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { styled, theme } from '../../tokens/stitches.config'
import { PrimaryLayout } from '../PrimaryLayout'

type SettingsTableProps = {
  pageId: string
  pageHeadline: string
  pageInfoLink: string
  headerTitle: string

  createTitle?: string
  createAction?: () => void

  children: React.ReactNode
}

type CreateButtonProps = {
  title: string
  action: () => void
}

type SettingsTableRowProps = {
  title: string
  isLast: boolean

  sublineElement: JSX.Element
  titleElement?: JSX.Element
  extraElement?: JSX.Element

  deleteTitle: string
  onDelete: () => void
}

type MoreOptionsProps = {
  title: string
  onDelete: () => void
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
    <DropdownOption
      onSelect={() => {
        props.onDelete()
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
          {props.title}
        </SpanBox>
      </HStack>
    </DropdownOption>
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
        '&:hover': {
          background: 'rgba(255, 234, 159, 0.12)',
        },
        borderBottomLeftRadius: props.isLast ? '5px' : '',
        borderBottomRightRadius: props.isLast ? '5px' : '',
        '@md': {
          paddingLeft: '0',
        },
      }}
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
            <StyledText
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
            </StyledText>
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
            <MoreOptions title={props.deleteTitle} onDelete={props.onDelete} />
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
          <MoreOptions title={props.deleteTitle} onDelete={props.onDelete} />
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
  return (
    <PrimaryLayout pageTestId={props.pageId}>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />
      <HStack css={{ width: '100%' }} alignment="center">
        <VStack
          distribution="center"
          css={{
            mx: '10px',
            width: '100%',
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
                <InfoLink href={props.pageInfoLink}></InfoLink>
              </HStack>
            </Box>
          </Box>
          {props.children}
        </VStack>
      </HStack>
      <Box css={{ height: '120px' }} />
    </PrimaryLayout>
  )
}
