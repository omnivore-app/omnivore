import { Box, VStack, HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { LabelChip } from '../../elements/LabelChip'
import type { LinkedItemCardProps } from './CardTypes'
import { CoverImage } from '../../elements/CoverImage'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ChangeEvent, useCallback, useState } from 'react'
import Link from 'next/link'
import {
  AuthorInfoStyle,
  CardCheckbox,
  DescriptionStyle,
  LibraryItemMetadata,
  MetaStyle,
  siteName,
  TitleStyle,
  MenuStyle,
} from './LibraryCardStyles'
import { sortedLabels } from '../../../lib/labelsSort'
import { LibraryHoverActions } from './LibraryHoverActions'
import {
  useHover,
  useFloating,
  useInteractions,
  size,
  offset,
  autoUpdate,
} from '@floating-ui/react'
import { CardMenu } from '../CardMenu'
import { DotsThree } from 'phosphor-react'
import { isTouchScreenDevice } from '../../../lib/deviceType'
import { ProgressBarOverlay } from './LibraryListCard'
import { FallbackImage } from './FallbackImage'

dayjs.extend(relativeTime)

type ProgressBarProps = {
  fillPercentage: number
  fillColor: string
  backgroundColor: string
  borderRadius: string
}

export function ProgressBar(props: ProgressBarProps): JSX.Element {
  return (
    <Box
      css={{
        height: '4px',
        width: '100%',
        borderRadius: '$1',
        overflow: 'hidden',
        backgroundColor: props.backgroundColor,
      }}
    >
      <Box
        css={{
          height: '100%',
          width: `${props.fillPercentage}%`,
          backgroundColor: props.fillColor,
          borderRadius: props.borderRadius,
        }}
      />
    </Box>
  )
}

export function LibraryGridCard(props: LinkedItemCardProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset({
        mainAxis: -25,
      }),

      size(),
    ],
    placement: 'top-end',
    whileElementsMounted: autoUpdate,
  })

  const hover = useHover(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([hover])

  return (
    <VStack
      ref={refs.setReference}
      {...getReferenceProps()}
      css={{
        pl: '0px',
        padding: '0px',
        width: '320px',
        height: '100%',
        minHeight: '270px',
        background: 'white',
        borderRadius: '5px',
        borderWidth: '1px',
        borderStyle: 'solid',
        overflow: 'hidden',
        borderColor: '$thBorderColor',
        cursor: 'pointer',
        '@media (max-width: 930px)': {
          m: '15px',
          width: 'calc(100% - 30px)',
        },
      }}
      alignment="start"
      distribution="start"
      onMouseEnter={() => {
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
      }}
    >
      {!isTouchScreenDevice() && (
        <Box
          ref={refs.setFloating}
          style={{ ...floatingStyles, zIndex: 10 }}
          {...getFloatingProps()}
        >
          <LibraryHoverActions
            item={props.item}
            viewer={props.viewer}
            handleAction={props.handleAction}
            isHovered={isHovered ?? false}
          />
        </Box>
      )}
      <Link
        href={`${props.viewer.profile.username}/${props.item.slug}`}
        passHref
      >
        <a
          href={`${props.viewer.profile.username}/${props.item.slug}`}
          style={{ textDecoration: 'unset', width: '100%', height: '100%' }}
          tabIndex={-1}
        >
          <LibraryGridCardContent {...props} isHovered={isHovered} />
        </a>
      </Link>
    </VStack>
  )
}

type FallbackProps = {
  title: string
}

const Fallback = (props: FallbackProps): JSX.Element => {
  const idx = (Math.abs(hashCode(props.title)) % Colors.length) - 1
  const color = Colors[idx]

  return (
    <Box
      css={{
        position: 'relative',
        width: '100%',
        height: '100px',
        backgroundColor: color.colors[1],
        color: color.colors[0],
        fontSize: '128px',
        fontWeight: 'bold',
        fontFamily: '$display',
        overflow: 'hidden',
      }}
    >
      <SpanBox
        css={{
          position: 'absolute',
          top: '-58px',
          left: '40px',
        }}
      >
        {props.title.substring(0, 1).toLocaleUpperCase()}
      </SpanBox>
    </Box>
  )
}

type GridImageProps = {
  src?: string
  title?: string
  readingProgress?: number
}

const GridImage = (props: GridImageProps): JSX.Element => {
  const [displayFallback, setDisplayFallback] = useState(props.src == undefined)

  return (
    <>
      {(props.readingProgress ?? 0) > 0 && (
        <ProgressBarOverlay
          width="100%"
          top={95}
          value={props.readingProgress ?? 0}
          bottomRadius={'0px'}
        />
      )}
      {displayFallback ? (
        <FallbackImage
          title={props.title ?? 'Omnivore Fallback'}
          width="100%"
          height="100px"
          fontSize="128px"
        />
      ) : (
        <CoverImage
          src={props.src}
          width="100%"
          height={100}
          css={{
            bg: '$thBackground',
          }}
          onError={(e) => {
            setDisplayFallback(true)
          }}
        />
      )}
    </>
  )
}

const LibraryGridCardContent = (props: LinkedItemCardProps): JSX.Element => {
  const { isChecked, setIsChecked, item } = props
  const [menuOpen, setMenuOpen] = useState(false)
  const originText = siteName(props.item.originalArticleUrl, props.item.url)

  const handleCheckChanged = useCallback(() => {
    const newValue = !isChecked
    setIsChecked(item.id, newValue)
  }, [setIsChecked, isChecked, props])

  return (
    <VStack css={{ p: '0px', m: '0px', width: '100%' }}>
      <Box css={{ position: 'relative', width: '100%' }}>
        <GridImage
          src={props.item.image}
          title={props.item.title}
          readingProgress={item.readingProgressPercent}
        />
        <SpanBox
          css={{
            position: 'absolute',
            top: 0,
            left: 0,
            m: '10px',
            lineHeight: '1',
          }}
        >
          <CardCheckbox
            isChecked={isChecked}
            handleChanged={handleCheckChanged}
          />
        </SpanBox>
        <Box
          css={{
            ...MenuStyle,
            position: 'absolute',
            top: 0,
            right: 0,
            m: '5px',
            visibility: menuOpen ? 'visible' : 'hidden',
            '@media (hover: none)': {
              visibility: 'unset',
            },
          }}
        >
          <CardMenu
            item={props.item}
            viewer={props.viewer}
            onOpenChange={(open) => setMenuOpen(open)}
            actionHandler={props.handleAction}
            triggerElement={
              <DotsThree size={25} weight="bold" color="#ADADAD" />
            }
          />
        </Box>
      </Box>

      <HStack
        css={{
          ...MetaStyle,
          minHeight: '35px',
          pt: '15px',
          px: '15px',
          color: '$grayText',
        }}
        distribution="start"
      >
        <LibraryItemMetadata item={props.item} showProgress={true} />
      </HStack>

      <VStack
        alignment="start"
        distribution="start"
        css={{ height: '100%', width: '100%', px: '15px', pt: '10px' }}
      >
        <Box
          css={{
            ...TitleStyle,
            height: '42px',
          }}
        >
          {props.item.title}
        </Box>
        <SpanBox
          css={{
            ...AuthorInfoStyle,
            mt: '0px',
            mb: '20px',
          }}
        >
          {props.item.author}
          {props.item.author && originText && ' | '}
          <SpanBox css={{ textDecoration: 'underline' }}>{originText}</SpanBox>
        </SpanBox>

        <HStack
          distribution="start"
          alignment="start"
          css={{ width: '100%', minHeight: '50px', pb: '10px' }}
        >
          <HStack
            css={{
              display: 'block',
              minHeight: '35px',
            }}
          >
            {sortedLabels(props.item.labels).map(({ name, color }, index) => (
              <LabelChip key={index} text={name || ''} color={color} />
            ))}
          </HStack>
        </HStack>
      </VStack>
    </VStack>
  )
}

const hashCode = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff
  }
  return hash
}

const Colors = [
  {
    name: 'Omolon',
    colors: ['#091E3A', '#2F80ED', '#2D9EE0'],
  },
  {
    name: 'Farhan',
    colors: ['#9400D3', '#4B0082'],
  },
  {
    name: 'Purple',
    colors: ['#c84e89', '#F15F79'],
  },
  {
    name: 'Ibtesam',
    colors: ['#00F5A0', '#00D9F5'],
  },
  {
    name: 'Radioactive Heat',
    colors: ['#F7941E', '#72C6EF', '#00A651'],
  },
  {
    name: 'The Sky And The Sea',
    colors: ['#F7941E', '#004E8F'],
  },
  {
    name: 'From Ice To Fire',
    colors: ['#72C6EF', '#004E8F'],
  },

  {
    name: 'Blue & Orange',
    colors: ['#FD8112', '#0085CA'],
  },
  {
    name: 'Purple Dream',
    colors: ['#bf5ae0', '#a811da'],
  },
  {
    name: 'Blu',
    colors: ['#00416A', '#E4E5E6'],
  },
  {
    name: 'Summer Breeze',
    colors: ['#fbed96', '#abecd6'],
  },
  {
    name: 'Ver',
    colors: ['#FFE000', '#799F0C'],
  },
  {
    name: 'Ver Black',
    colors: ['#F7F8F8', '#ACBB78'],
  },
  {
    name: 'Combi',
    colors: ['#00416A', '#799F0C', '#FFE000'],
  },
  {
    name: 'Anwar',
    colors: ['#334d50', '#cbcaa5'],
  },
  {
    name: 'Bluelagoo',
    colors: ['#0052D4', '#4364F7', '#6FB1FC'],
  },
  {
    name: 'Lunada',
    colors: ['#5433FF', '#20BDFF', '#A5FECB'],
  },
  {
    name: 'Reaqua',
    colors: ['#799F0C', '#ACBB78'],
  },
  {
    name: 'Mango',
    colors: ['#ffe259', '#ffa751'],
  },
  {
    name: 'Bupe',
    colors: ['#00416A', '#E4E5E6'],
  },
  {
    name: 'Rea',
    colors: ['#FFE000', '#799F0C'],
  },
  {
    name: 'Windy',
    colors: ['#acb6e5', '#86fde8'],
  },
  {
    name: 'Royal Blue',
    colors: ['#536976', '#292E49'],
  },
  {
    name: 'Royal Blue + Petrol',
    colors: ['#BBD2C5', '#536976', '#292E49'],
  },
  {
    name: 'Copper',
    colors: ['#B79891', '#94716B'],
  },
  {
    name: 'Anamnisar',
    colors: ['#9796f0', '#fbc7d4'],
  },
  {
    name: 'Petrol',
    colors: ['#BBD2C5', '#536976'],
  },
  {
    name: 'Sky',
    colors: ['#076585', '#fff'],
  },
  {
    name: 'Sel',
    colors: ['#00467F', '#A5CC82'],
  },
  {
    name: 'Afternoon',
    colors: ['#000C40', '#607D8B'],
  },
  {
    name: 'Skyline',
    colors: ['#1488CC', '#2B32B2'],
  },
  {
    name: 'DIMIGO',
    colors: ['#ec008c', '#fc6767'],
  },
  {
    name: 'Purple Love',
    colors: ['#cc2b5e', '#753a88'],
  },
  {
    name: 'Sexy Blue',
    colors: ['#2193b0', '#6dd5ed'],
  },
  {
    name: 'Blooker20',
    colors: ['#e65c00', '#F9D423'],
  },
  {
    name: 'Sea Blue',
    colors: ['#2b5876', '#4e4376'],
  },
  {
    name: 'Nimvelo',
    colors: ['#314755', '#26a0da'],
  },
  {
    name: 'Hazel',
    colors: ['#77A1D3', '#79CBCA', '#E684AE'],
  },
  {
    name: 'Noon to Dusk',
    colors: ['#ff6e7f', '#bfe9ff'],
  },
  {
    name: 'YouTube',
    colors: ['#e52d27', '#b31217'],
  },
  {
    name: 'Cool Brown',
    colors: ['#603813', '#b29f94'],
  },
  {
    name: 'Harmonic Energy',
    colors: ['#16A085', '#F4D03F'],
  },
  {
    name: 'Playing with Reds',
    colors: ['#D31027', '#EA384D'],
  },
  {
    name: 'Sunny Days',
    colors: ['#EDE574', '#E1F5C4'],
  },
  {
    name: 'Green Beach',
    colors: ['#02AAB0', '#00CDAC'],
  },
  {
    name: 'Intuitive Purple',
    colors: ['#DA22FF', '#9733EE'],
  },
  {
    name: 'Emerald Water',
    colors: ['#348F50', '#56B4D3'],
  },
  {
    name: 'Lemon Twist',
    colors: ['#3CA55C', '#B5AC49'],
  },
  {
    name: 'Monte Carlo',
    colors: ['#CC95C0', '#DBD4B4', '#7AA1D2'],
  },
  {
    name: 'Horizon',
    colors: ['#003973', '#E5E5BE'],
  },
  {
    name: 'Rose Water',
    colors: ['#E55D87', '#5FC3E4'],
  },
  {
    name: 'Frozen',
    colors: ['#403B4A', '#E7E9BB'],
  },
  {
    name: 'Mango Pulp',
    colors: ['#F09819', '#EDDE5D'],
  },
  {
    name: 'Bloody Mary',
    colors: ['#FF512F', '#DD2476'],
  },
  {
    name: 'Aubergine',
    colors: ['#AA076B', '#61045F'],
  },
  {
    name: 'Aqua Marine',
    colors: ['#1A2980', '#26D0CE'],
  },
  {
    name: 'Sunrise',
    colors: ['#FF512F', '#F09819'],
  },
  {
    name: 'Purple Paradise',
    colors: ['#1D2B64', '#F8CDDA'],
  },
  {
    name: 'Stripe',
    colors: ['#1FA2FF', '#12D8FA', '#A6FFCB'],
  },
  {
    name: 'Sea Weed',
    colors: ['#4CB8C4', '#3CD3AD'],
  },
  {
    name: 'Pinky',
    colors: ['#DD5E89', '#F7BB97'],
  },
  {
    name: 'Cherry',
    colors: ['#EB3349', '#F45C43'],
  },
  {
    name: 'Mojito',
    colors: ['#1D976C', '#93F9B9'],
  },
  {
    name: 'Juicy Orange',
    colors: ['#FF8008', '#FFC837'],
  },
  {
    name: 'Mirage',
    colors: ['#16222A', '#3A6073'],
  },
  {
    name: 'Steel Gray',
    colors: ['#1F1C2C', '#928DAB'],
  },
  {
    name: 'Kashmir',
    colors: ['#614385', '#516395'],
  },
  {
    name: 'Electric Violet',
    colors: ['#4776E6', '#8E54E9'],
  },
  {
    name: 'Venice Blue',
    colors: ['#085078', '#85D8CE'],
  },
  {
    name: 'Bora Bora',
    colors: ['#2BC0E4', '#EAECC6'],
  },
  {
    name: 'Moss',
    colors: ['#134E5E', '#71B280'],
  },
  {
    name: 'Shroom Haze',
    colors: ['#5C258D', '#4389A2'],
  },
  {
    name: 'Mystic',
    colors: ['#757F9A', '#D7DDE8'],
  },
  {
    name: 'Midnight City',
    colors: ['#232526', '#414345'],
  },
  {
    name: 'Sea Blizz',
    colors: ['#1CD8D2', '#93EDC7'],
  },
  {
    name: 'Opa',
    colors: ['#3D7EAA', '#FFE47A'],
  },
  {
    name: 'Titanium',
    colors: ['#283048', '#859398'],
  },
  {
    name: 'Mantle',
    colors: ['#24C6DC', '#514A9D'],
  },
  {
    name: 'Dracula',
    colors: ['#DC2424', '#4A569D'],
  },
  {
    name: 'Peach',
    colors: ['#ED4264', '#FFEDBC'],
  },
  {
    name: 'Moonrise',
    colors: ['#DAE2F8', '#D6A4A4'],
  },
  {
    name: 'Clouds',
    colors: ['#ECE9E6', '#FFFFFF'],
  },
  {
    name: 'Stellar',
    colors: ['#7474BF', '#348AC7'],
  },
  {
    name: 'Bourbon',
    colors: ['#EC6F66', '#F3A183'],
  },
  {
    name: 'Calm Darya',
    colors: ['#5f2c82', '#49a09d'],
  },
  {
    name: 'Influenza',
    colors: ['#C04848', '#480048'],
  },
  {
    name: 'Shrimpy',
    colors: ['#e43a15', '#e65245'],
  },
  {
    name: 'Army',
    colors: ['#414d0b', '#727a17'],
  },
  {
    name: 'Miaka',
    colors: ['#FC354C', '#0ABFBC'],
  },
  {
    name: 'Pinot Noir',
    colors: ['#4b6cb7', '#182848'],
  },
  {
    name: 'Day Tripper',
    colors: ['#f857a6', '#ff5858'],
  },
  {
    name: 'Namn',
    colors: ['#a73737', '#7a2828'],
  },
  {
    name: 'Blurry Beach',
    colors: ['#d53369', '#cbad6d'],
  },
  {
    name: 'Vasily',
    colors: ['#e9d362', '#333333'],
  },
  {
    name: 'A Lost Memory',
    colors: ['#DE6262', '#FFB88C'],
  },
  {
    name: 'Petrichor',
    colors: ['#666600', '#999966'],
  },
  {
    name: 'Jonquil',
    colors: ['#FFEEEE', '#DDEFBB'],
  },
  {
    name: 'Sirius Tamed',
    colors: ['#EFEFBB', '#D4D3DD'],
  },
  {
    name: 'Kyoto',
    colors: ['#c21500', '#ffc500'],
  },
  {
    name: 'Misty Meadow',
    colors: ['#215f00', '#e4e4d9'],
  },
  {
    name: 'Aqualicious',
    colors: ['#50C9C3', '#96DEDA'],
  },
  {
    name: 'Moor',
    colors: ['#616161', '#9bc5c3'],
  },
  {
    name: 'Almost',
    colors: ['#ddd6f3', '#faaca8'],
  },
  {
    name: 'Forever Lost',
    colors: ['#5D4157', '#A8CABA'],
  },
  {
    name: 'Winter',
    colors: ['#E6DADA', '#274046'],
  },
  {
    name: 'Nelson',
    colors: ['#f2709c', '#ff9472'],
  },
  {
    name: 'Autumn',
    colors: ['#DAD299', '#B0DAB9'],
  },
  {
    name: 'Candy',
    colors: ['#D3959B', '#BFE6BA'],
  },
  {
    name: 'Reef',
    colors: ['#00d2ff', '#3a7bd5'],
  },
  {
    name: 'The Strain',
    colors: ['#870000', '#190A05'],
  },
  {
    name: 'Dirty Fog',
    colors: ['#B993D6', '#8CA6DB'],
  },
  {
    name: 'Earthly',
    colors: ['#649173', '#DBD5A4'],
  },
  {
    name: 'Virgin',
    colors: ['#C9FFBF', '#FFAFBD'],
  },
  {
    name: 'Ash',
    colors: ['#606c88', '#3f4c6b'],
  },
  {
    name: 'Cherryblossoms',
    colors: ['#FBD3E9', '#BB377D'],
  },
  {
    name: 'Parklife',
    colors: ['#ADD100', '#7B920A'],
  },
  {
    name: 'Dance To Forget',
    colors: ['#FF4E50', '#F9D423'],
  },
  {
    name: 'Starfall',
    colors: ['#F0C27B', '#4B1248'],
  },
  {
    name: 'Red Mist',
    colors: ['#000000', '#e74c3c'],
  },
  {
    name: 'Teal Love',
    colors: ['#AAFFA9', '#11FFBD'],
  },
  {
    name: 'Neon Life',
    colors: ['#B3FFAB', '#12FFF7'],
  },
  {
    name: 'Man of Steel',
    colors: ['#780206', '#061161'],
  },
  {
    name: 'Amethyst',
    colors: ['#9D50BB', '#6E48AA'],
  },
  {
    name: 'Cheer Up Emo Kid',
    colors: ['#556270', '#FF6B6B'],
  },
  {
    name: 'Shore',
    colors: ['#70e1f5', '#ffd194'],
  },
  {
    name: 'Facebook Messenger',
    colors: ['#00c6ff', '#0072ff'],
  },
  {
    name: 'SoundCloud',
    colors: ['#fe8c00', '#f83600'],
  },
  {
    name: 'Behongo',
    colors: ['#52c234', '#061700'],
  },
  {
    name: 'ServQuick',
    colors: ['#485563', '#29323c'],
  },
  {
    name: 'Friday',
    colors: ['#83a4d4', '#b6fbff'],
  },
  {
    name: 'Martini',
    colors: ['#FDFC47', '#24FE41'],
  },
  {
    name: 'Metallic Toad',
    colors: ['#abbaab', '#ffffff'],
  },
  {
    name: 'Between The Clouds',
    colors: ['#73C8A9', '#373B44'],
  },
  {
    name: 'Crazy Orange I',
    colors: ['#D38312', '#A83279'],
  },
  {
    name: 'Hersheys',
    colors: ['#1e130c', '#9a8478'],
  },
  {
    name: 'Talking To Mice Elf',
    colors: ['#948E99', '#2E1437'],
  },
  {
    name: 'Purple Bliss',
    colors: ['#360033', '#0b8793'],
  },
  {
    name: 'Predawn',
    colors: ['#FFA17F', '#00223E'],
  },
  {
    name: 'Endless River',
    colors: ['#43cea2', '#185a9d'],
  },
  {
    name: 'Pastel Orange at the Sun',
    colors: ['#ffb347', '#ffcc33'],
  },
  {
    name: 'Twitch',
    colors: ['#6441A5', '#2a0845'],
  },
  {
    name: 'Atlas',
    colors: ['#FEAC5E', '#C779D0', '#4BC0C8'],
  },
  {
    name: 'Instagram',
    colors: ['#833ab4', '#fd1d1d', '#fcb045'],
  },
  {
    name: 'Flickr',
    colors: ['#ff0084', '#33001b'],
  },
  {
    name: 'Vine',
    colors: ['#00bf8f', '#001510'],
  },
  {
    name: 'Turquoise flow',
    colors: ['#136a8a', '#267871'],
  },
  {
    name: 'Portrait',
    colors: ['#8e9eab', '#eef2f3'],
  },
  {
    name: 'Virgin America',
    colors: ['#7b4397', '#dc2430'],
  },
  {
    name: 'Koko Caramel',
    colors: ['#D1913C', '#FFD194'],
  },
  {
    name: 'Fresh Turboscent',
    colors: ['#F1F2B5', '#135058'],
  },
  {
    name: 'Green to dark',
    colors: ['#6A9113', '#141517'],
  },
  {
    name: 'Ukraine',
    colors: ['#004FF9', '#FFF94C'],
  },
  {
    name: 'Curiosity blue',
    colors: ['#525252', '#3d72b4'],
  },
  {
    name: 'Dark Knight',
    colors: ['#BA8B02', '#181818'],
  },
  {
    name: 'Piglet',
    colors: ['#ee9ca7', '#ffdde1'],
  },
  {
    name: 'Lizard',
    colors: ['#304352', '#d7d2cc'],
  },
  {
    name: 'Sage Persuasion',
    colors: ['#CCCCB2', '#757519'],
  },
  {
    name: 'Between Night and Day',
    colors: ['#2c3e50', '#3498db'],
  },
  {
    name: 'Timber',
    colors: ['#fc00ff', '#00dbde'],
  },
  {
    name: 'Passion',
    colors: ['#e53935', '#e35d5b'],
  },
  {
    name: 'Clear Sky',
    colors: ['#005C97', '#363795'],
  },
  {
    name: 'Master Card',
    colors: ['#f46b45', '#eea849'],
  },
  {
    name: 'Back To Earth',
    colors: ['#00C9FF', '#92FE9D'],
  },
  {
    name: 'Deep Purple',
    colors: ['#673AB7', '#512DA8'],
  },
  {
    name: 'Little Leaf',
    colors: ['#76b852', '#8DC26F'],
  },
  {
    name: 'Netflix',
    colors: ['#8E0E00', '#1F1C18'],
  },
  {
    name: 'Light Orange',
    colors: ['#FFB75E', '#ED8F03'],
  },
  {
    name: 'Green and Blue',
    colors: ['#c2e59c', '#64b3f4'],
  },
  {
    name: 'Poncho',
    colors: ['#403A3E', '#BE5869'],
  },
  {
    name: 'Back to the Future',
    colors: ['#C02425', '#F0CB35'],
  },
  {
    name: 'Blush',
    colors: ['#B24592', '#F15F79'],
  },
  {
    name: 'Inbox',
    colors: ['#457fca', '#5691c8'],
  },
  {
    name: 'Purplin',
    colors: ['#6a3093', '#a044ff'],
  },
  {
    name: 'Pale Wood',
    colors: ['#eacda3', '#d6ae7b'],
  },
  {
    name: 'Haikus',
    colors: ['#fd746c', '#ff9068'],
  },
  {
    name: 'Pizelex',
    colors: ['#114357', '#F29492'],
  },
  {
    name: 'Joomla',
    colors: ['#1e3c72', '#2a5298'],
  },
  {
    name: 'Christmas',
    colors: ['#2F7336', '#AA3A38'],
  },
  {
    name: 'Minnesota Vikings',
    colors: ['#5614B0', '#DBD65C'],
  },
  {
    name: 'Miami Dolphins',
    colors: ['#4DA0B0', '#D39D38'],
  },
  {
    name: 'Forest',
    colors: ['#5A3F37', '#2C7744'],
  },
  {
    name: 'Nighthawk',
    colors: ['#2980b9', '#2c3e50'],
  },
  {
    name: 'Superman',
    colors: ['#0099F7', '#F11712'],
  },
  {
    name: 'Suzy',
    colors: ['#834d9b', '#d04ed6'],
  },
  {
    name: 'Dark Skies',
    colors: ['#4B79A1', '#283E51'],
  },
  {
    name: 'Deep Space',
    colors: ['#000000', '#434343'],
  },
  {
    name: 'Decent',
    colors: ['#4CA1AF', '#C4E0E5'],
  },
  {
    name: 'Colors Of Sky',
    colors: ['#E0EAFC', '#CFDEF3'],
  },
  {
    name: 'Purple White',
    colors: ['#BA5370', '#F4E2D8'],
  },
  {
    name: 'Ali',
    colors: ['#ff4b1f', '#1fddff'],
  },
  {
    name: 'Alihossein',
    colors: ['#f7ff00', '#db36a4'],
  },
  {
    name: 'Shahabi',
    colors: ['#a80077', '#66ff00'],
  },
  {
    name: 'Red Ocean',
    colors: ['#1D4350', '#A43931'],
  },
  {
    name: 'Tranquil',
    colors: ['#EECDA3', '#EF629F'],
  },
  {
    name: 'Transfile',
    colors: ['#16BFFD', '#CB3066'],
  },

  {
    name: 'Sylvia',
    colors: ['#ff4b1f', '#ff9068'],
  },
  {
    name: 'Sweet Morning',
    colors: ['#FF5F6D', '#FFC371'],
  },
  {
    name: 'Politics',
    colors: ['#2196f3', '#f44336'],
  },
  {
    name: 'Bright Vault',
    colors: ['#00d2ff', '#928DAB'],
  },
  {
    name: 'Solid Vault',
    colors: ['#3a7bd5', '#3a6073'],
  },
  {
    name: 'Sunset',
    colors: ['#0B486B', '#F56217'],
  },
  {
    name: 'Grapefruit Sunset',
    colors: ['#e96443', '#904e95'],
  },
  {
    name: 'Deep Sea Space',
    colors: ['#2C3E50', '#4CA1AF'],
  },
  {
    name: 'Dusk',
    colors: ['#2C3E50', '#FD746C'],
  },
  {
    name: 'Minimal Red',
    colors: ['#F00000', '#DC281E'],
  },
  {
    name: 'Royal',
    colors: ['#141E30', '#243B55'],
  },
  {
    name: 'Mauve',
    colors: ['#42275a', '#734b6d'],
  },
  {
    name: 'Frost',
    colors: ['#000428', '#004e92'],
  },
  {
    name: 'Lush',
    colors: ['#56ab2f', '#a8e063'],
  },
  {
    name: 'Firewatch',
    colors: ['#cb2d3e', '#ef473a'],
  },
  {
    name: 'Sherbert',
    colors: ['#f79d00', '#64f38c'],
  },
  {
    name: 'Blood Red',
    colors: ['#f85032', '#e73827'],
  },
  {
    name: 'Sun on the Horizon',
    colors: ['#fceabb', '#f8b500'],
  },
  {
    name: 'IIIT Delhi',
    colors: ['#808080', '#3fada8'],
  },
  {
    name: 'Jupiter',
    colors: ['#ffd89b', '#19547b'],
  },
  {
    name: '50 Shades of Grey',
    colors: ['#bdc3c7', '#2c3e50'],
  },
  {
    name: 'Dania',
    colors: ['#BE93C5', '#7BC6CC'],
  },
  {
    name: 'Limeade',
    colors: ['#A1FFCE', '#FAFFD1'],
  },
  {
    name: 'Disco',
    colors: ['#4ECDC4', '#556270'],
  },
  {
    name: 'Love Couple',
    colors: ['#3a6186', '#89253e'],
  },
  {
    name: 'Azure Pop',
    colors: ['#ef32d9', '#89fffd'],
  },
  {
    name: 'Nepal',
    colors: ['#de6161', '#2657eb'],
  },
  {
    name: 'Cosmic Fusion',
    colors: ['#ff00cc', '#333399'],
  },
  {
    name: 'Snapchat',
    colors: ['#fffc00', '#ffffff'],
  },
  {
    name: "Ed's Sunset Gradient",
    colors: ['#ff7e5f', '#feb47b'],
  },
  {
    name: 'Brady Brady Fun Fun',
    colors: ['#00c3ff', '#ffff1c'],
  },
  {
    name: 'Black Rosé',
    colors: ['#f4c4f3', '#fc67fa'],
  },
  {
    name: "80's Purple",
    colors: ['#41295a', '#2F0743'],
  },
  {
    name: 'Radar',
    colors: ['#A770EF', '#CF8BF3', '#FDB99B'],
  },
  {
    name: 'Ibiza Sunset',
    colors: ['#ee0979', '#ff6a00'],
  },
  {
    name: 'Dawn',
    colors: ['#F3904F', '#3B4371'],
  },
  {
    name: 'Mild',
    colors: ['#67B26F', '#4ca2cd'],
  },
  {
    name: 'Vice City',
    colors: ['#3494E6', '#EC6EAD'],
  },
  {
    name: 'Jaipur',
    colors: ['#DBE6F6', '#C5796D'],
  },
  {
    name: 'Jodhpur',
    colors: ['#9CECFB', '#65C7F7', '#0052D4'],
  },
  {
    name: 'Cocoaa Ice',
    colors: ['#c0c0aa', '#1cefff'],
  },
  {
    name: 'EasyMed',
    colors: ['#DCE35B', '#45B649'],
  },
  {
    name: 'Rose Colored Lenses',
    colors: ['#E8CBC0', '#636FA4'],
  },
  {
    name: 'What lies Beyond',
    colors: ['#F0F2F0', '#000C40'],
  },
  {
    name: 'Roseanna',
    colors: ['#FFAFBD', '#ffc3a0'],
  },
  {
    name: 'Honey Dew',
    colors: ['#43C6AC', '#F8FFAE'],
  },
  {
    name: 'Under the Lake',
    colors: ['#093028', '#237A57'],
  },
  {
    name: 'The Blue Lagoon',
    colors: ['#43C6AC', '#191654'],
  },
  {
    name: 'Can You Feel The Love Tonight',
    colors: ['#4568DC', '#B06AB3'],
  },
  {
    name: 'Very Blue',
    colors: ['#0575E6', '#021B79'],
  },
  {
    name: 'Love and Liberty',
    colors: ['#200122', '#6f0000'],
  },
  {
    name: 'Orca',
    colors: ['#44A08D', '#093637'],
  },
  {
    name: 'Venice',
    colors: ['#6190E8', '#A7BFE8'],
  },
  {
    name: 'Pacific Dream',
    colors: ['#34e89e', '#0f3443'],
  },
  {
    name: 'Learning and Leading',
    colors: ['#F7971E', '#FFD200'],
  },
  {
    name: 'Celestial',
    colors: ['#C33764', '#1D2671'],
  },
  {
    name: 'Purplepine',
    colors: ['#20002c', '#cbb4d4'],
  },
  {
    name: 'Sha la la',
    colors: ['#D66D75', '#E29587'],
  },
  {
    name: 'Mini',
    colors: ['#30E8BF', '#FF8235'],
  },
  {
    name: 'Maldives',
    colors: ['#B2FEFA', '#0ED2F7'],
  },
  {
    name: 'Cinnamint',
    colors: ['#4AC29A', '#BDFFF3'],
  },
  {
    name: 'Html',
    colors: ['#E44D26', '#F16529'],
  },
  {
    name: 'Coal',
    colors: ['#EB5757', '#000000'],
  },
  {
    name: 'Sunkist',
    colors: ['#F2994A', '#F2C94C'],
  },
  {
    name: 'Blue Skies',
    colors: ['#56CCF2', '#2F80ED'],
  },
  {
    name: 'Chitty Chitty Bang Bang',
    colors: ['#007991', '#78ffd6'],
  },
  {
    name: 'Visions of Grandeur',
    colors: ['#000046', '#1CB5E0'],
  },
  {
    name: 'Crystal Clear',
    colors: ['#159957', '#155799'],
  },
  {
    name: 'Mello',
    colors: ['#c0392b', '#8e44ad'],
  },
  {
    name: 'Compare Now',
    colors: ['#EF3B36', '#FFFFFF'],
  },
  {
    name: 'Meridian',
    colors: ['#283c86', '#45a247'],
  },
  {
    name: 'Relay',
    colors: ['#3A1C71', '#D76D77', '#FFAF7B'],
  },
  {
    name: 'Alive',
    colors: ['#CB356B', '#BD3F32'],
  },
  {
    name: 'Scooter',
    colors: ['#36D1DC', '#5B86E5'],
  },
  {
    name: 'Terminal',
    colors: ['#000000', '#0f9b0f'],
  },
  {
    name: 'Telegram',
    colors: ['#1c92d2', '#f2fcfe'],
  },
  {
    name: 'Crimson Tide',
    colors: ['#642B73', '#C6426E'],
  },
  {
    name: 'Socialive',
    colors: ['#06beb6', '#48b1bf'],
  },
  {
    name: 'Subu',
    colors: ['#0cebeb', '#20e3b2', '#29ffc6'],
  },
  {
    name: 'Broken Hearts',
    colors: ['#d9a7c7', '#fffcdc'],
  },
  {
    name: 'Kimoby Is The New Blue',
    colors: ['#396afc', '#2948ff'],
  },
  {
    name: 'Dull',
    colors: ['#C9D6FF', '#E2E2E2'],
  },
  {
    name: 'Purpink',
    colors: ['#7F00FF', '#E100FF'],
  },
  {
    name: 'Orange Coral',
    colors: ['#ff9966', '#ff5e62'],
  },
  {
    name: 'Summer',
    colors: ['#22c1c3', '#fdbb2d'],
  },
  {
    name: 'King Yna',
    colors: ['#1a2a6c', '#b21f1f', '#fdbb2d'],
  },
  {
    name: 'Velvet Sun',
    colors: ['#e1eec3', '#f05053'],
  },
  {
    name: 'Zinc',
    colors: ['#ADA996', '#F2F2F2', '#DBDBDB', '#EAEAEA'],
  },
  {
    name: 'Hydrogen',
    colors: ['#667db6', '#0082c8', '#0082c8', '#667db6'],
  },
  {
    name: 'Argon',
    colors: ['#03001e', '#7303c0', '#ec38bc', '#fdeff9'],
  },
  {
    name: 'Lithium',
    colors: ['#6D6027', '#D3CBB8'],
  },
  {
    name: 'Digital Water',
    colors: ['#74ebd5', '#ACB6E5'],
  },
  {
    name: 'Orange Fun',
    colors: ['#fc4a1a', '#f7b733'],
  },
  {
    name: 'Rainbow Blue',
    colors: ['#00F260', '#0575E6'],
  },
  {
    name: 'Pink Flavour',
    colors: ['#800080', '#ffc0cb'],
  },
  {
    name: 'Sulphur',
    colors: ['#CAC531', '#F3F9A7'],
  },
  {
    name: 'Selenium',
    colors: ['#3C3B3F', '#605C3C'],
  },
  {
    name: 'Delicate',
    colors: ['#D3CCE3', '#E9E4F0'],
  },
  {
    name: 'Ohhappiness',
    colors: ['#00b09b', '#96c93d'],
  },
  {
    name: 'Lawrencium',
    colors: ['#0f0c29', '#302b63', '#24243e'],
  },
  {
    name: 'Relaxing red',
    colors: ['#fffbd5', '#b20a2c'],
  },
  {
    name: 'Taran Tado',
    colors: ['#23074d', '#cc5333'],
  },
  {
    name: 'Bighead',
    colors: ['#c94b4b', '#4b134f'],
  },
  {
    name: 'Sublime Vivid',
    colors: ['#FC466B', '#3F5EFB'],
  },
  {
    name: 'Sublime Light',
    colors: ['#FC5C7D', '#6A82FB'],
  },
  {
    name: 'Pun Yeta',
    colors: ['#108dc7', '#ef8e38'],
  },
  {
    name: 'Quepal',
    colors: ['#11998e', '#38ef7d'],
  },
  {
    name: 'Sand to Blue',
    colors: ['#3E5151', '#DECBA4'],
  },
  {
    name: 'Wedding Day Blues',
    colors: ['#40E0D0', '#FF8C00', '#FF0080'],
  },
  {
    name: 'Shifter',
    colors: ['#bc4e9c', '#f80759'],
  },
  {
    name: 'Red Sunset',
    colors: ['#355C7D', '#6C5B7B', '#C06C84'],
  },
  {
    name: 'Moon Purple',
    colors: ['#4e54c8', '#8f94fb'],
  },
  {
    name: 'Pure Lust',
    colors: ['#333333', '#dd1818'],
  },
  {
    name: 'Slight Ocean View',
    colors: ['#a8c0ff', '#3f2b96'],
  },
  {
    name: 'eXpresso',
    colors: ['#ad5389', '#3c1053'],
  },
  {
    name: 'Shifty',
    colors: ['#636363', '#a2ab58'],
  },
  {
    name: 'Vanusa',
    colors: ['#DA4453', '#89216B'],
  },
  {
    name: 'Evening Night',
    colors: ['#005AA7', '#FFFDE4'],
  },
  {
    name: 'Magic',
    colors: ['#59C173', '#a17fe0', '#5D26C1'],
  },
  {
    name: 'Margo',
    colors: ['#FFEFBA', '#FFFFFF'],
  },
  {
    name: 'Blue Raspberry',
    colors: ['#00B4DB', '#0083B0'],
  },
  {
    name: 'Citrus Peel',
    colors: ['#FDC830', '#F37335'],
  },
  {
    name: 'Sin City Red',
    colors: ['#ED213A', '#93291E'],
  },
  {
    name: 'Rastafari',
    colors: ['#1E9600', '#FFF200', '#FF0000'],
  },
  {
    name: 'Summer Dog',
    colors: ['#a8ff78', '#78ffd6'],
  },
  {
    name: 'Wiretap',
    colors: ['#8A2387', '#E94057', '#F27121'],
  },
  {
    name: 'Burning Orange',
    colors: ['#FF416C', '#FF4B2B'],
  },
  {
    name: 'Ultra Voilet',
    colors: ['#654ea3', '#eaafc8'],
  },
  {
    name: 'By Design',
    colors: ['#009FFF', '#ec2F4B'],
  },
  {
    name: 'Kyoo Tah',
    colors: ['#544a7d', '#ffd452'],
  },
  {
    name: 'Kye Meh',
    colors: ['#8360c3', '#2ebf91'],
  },
  {
    name: 'Kyoo Pal',
    colors: ['#dd3e54', '#6be585'],
  },
  {
    name: 'Metapolis',
    colors: ['#659999', '#f4791f'],
  },
  {
    name: 'Flare',
    colors: ['#f12711', '#f5af19'],
  },
  {
    name: 'Witching Hour',
    colors: ['#c31432', '#240b36'],
  },
  {
    name: 'Azur Lane',
    colors: ['#7F7FD5', '#86A8E7', '#91EAE4'],
  },
  {
    name: 'Neuromancer',
    colors: ['#f953c6', '#b91d73'],
  },
  {
    name: 'Harvey',
    colors: ['#1f4037', '#99f2c8'],
  },
  {
    name: 'Amin',
    colors: ['#8E2DE2', '#4A00E0'],
  },
  {
    name: 'Memariani',
    colors: ['#aa4b6b', '#6b6b83', '#3b8d99'],
  },
  {
    name: 'Yoda',
    colors: ['#FF0099', '#493240'],
  },
  {
    name: 'Cool Sky',
    colors: ['#2980B9', '#6DD5FA', '#FFFFFF'],
  },
  {
    name: 'Dark Ocean',
    colors: ['#373B44', '#4286f4'],
  },
  {
    name: 'Evening Sunshine',
    colors: ['#b92b27', '#1565C0'],
  },
  {
    name: 'JShine',
    colors: ['#12c2e9', '#c471ed', '#f64f59'],
  },
  {
    name: 'Moonlit Asteroid',
    colors: ['#0F2027', '#203A43', '#2C5364'],
  },
  {
    name: 'MegaTron',
    colors: ['#C6FFDD', '#FBD786', '#f7797d'],
  },
  {
    name: 'Cool Blues',
    colors: ['#2193b0', '#6dd5ed'],
  },
  {
    name: 'Piggy Pink',
    colors: ['#ee9ca7', '#ffdde1'],
  },
  {
    name: 'Grade Grey',
    colors: ['#bdc3c7', '#2c3e50'],
  },
  {
    name: 'Telko',
    colors: ['#F36222', '#5CB644', '#007FC3'],
  },
  {
    name: 'Zenta',
    colors: ['#2A2D3E', '#FECB6E'],
  },
  {
    name: 'Electric Peacock',
    colors: ['#8a2be2', '#0000cd', '#228b22', '#ccff00'],
  },
  {
    name: 'Under Blue Green',
    colors: ['#051937', '#004d7a', '#008793', '#00bf72', '#a8eb12'],
  },
  {
    name: 'Lensod',
    colors: ['#6025F5', '#FF5555'],
  },
  {
    name: 'Newspaper',
    colors: ['#8a2be2', '#ffa500', '#f8f8ff'],
  },
  {
    name: 'Dark Blue Gradient',
    colors: ['#2774ae', '#002E5D', '#002E5D'],
  },
  {
    name: 'Dark Blu Two',
    colors: ['#004680', '#4484BA'],
  },
  {
    name: 'Lemon Lime',
    colors: ['#7ec6bc', '#ebe717'],
  },
  {
    name: 'Beleko',
    colors: ['#ff1e56', '#f9c942', '#1e90ff'],
  },
  {
    name: 'Mango Papaya',
    colors: ['#de8a41', '#2ada53'],
  },
  {
    name: 'Unicorn Rainbow',
    colors: ['#f7f0ac', '#acf7f0', '#f0acf7'],
  },
  {
    name: 'Flame',
    colors: ['#ff0000', '#fdcf58'],
  },
  {
    name: 'Blue Red',
    colors: ['#36B1C7', '#960B33'],
  },
  {
    name: 'Twitter',
    colors: ['#1DA1F2', '#009ffc'],
  },
  {
    name: 'Blooze',
    colors: ['#6da6be', '#4b859e', '#6da6be'],
  },
  {
    name: 'Blue Slate',
    colors: ['#B5B9FF', '#2B2C49'],
  },
  {
    name: 'Space Light Green',
    colors: ['#9FA0A8', '#5C7852'],
  },
  {
    name: 'Flower',
    colors: ['#DCFFBD', '#CC86D1'],
  },
  {
    name: 'Elate The Euge',
    colors: ['#8BDEDA', '43ADD0', '998EE0', 'E17DC2', 'EF9393'],
  },
  {
    name: 'Peach Sea',
    colors: ['#E6AE8C', '#A8CECF'],
  },
  {
    name: 'Abbas',
    colors: ['#00fff0', '#0083fe'],
  },
  {
    name: 'Winter Woods',
    colors: ['#333333', '#a2ab58', '#A43931'],
  },
  {
    name: 'Ameena',
    colors: ['#0c0c6d', '#de512b', '#98d0c1', '#5bb226', '#023c0d'],
  },
  {
    name: 'Emerald Sea',
    colors: ['#05386b', '#5cdb95'],
  },
  {
    name: 'Bleem',
    colors: ['#4284DB', '#29EAC4'],
  },
  {
    name: 'Coffee Gold',
    colors: ['#554023', '#c99846'],
  },
  {
    name: 'Compass',
    colors: ['#516b8b', '#056b3b'],
  },
  {
    name: "Andreuzza's",
    colors: ['#D70652', '#FF025E'],
  },
  {
    name: 'Moonwalker',
    colors: ['#152331', '#000000'],
  },
  {
    name: 'Whinehouse',
    colors: ['#f7f7f7', '#b9a0a0', '#794747', '#4e2020', '#111111'],
  },
  {
    name: 'Hyper Blue',
    colors: ['#59CDE9', '#0A2A88'],
  },
  {
    name: 'Racker',
    colors: ['#EB0000', '#95008A', '#3300FC'],
  },
  {
    name: 'After the Rain',
    colors: ['#ff75c3', '#ffa647', '#ffe83f', '#9fff5b', '#70e2ff', '#cd93ff'],
  },
  {
    name: 'Neon Green',
    colors: ['#81ff8a', '#64965e'],
  },
  {
    name: 'Dusty Grass',
    colors: ['#d4fc79', '#96e6a1'],
  },
  {
    name: 'Visual Blue',
    colors: ['#003d4d', '#00c996'],
  },
]
