import { styled } from '../tokens/stitches.config'

const textVariants = {
  style: {
    body: {
      fontSize: '$2',
      lineHeight: '1.25',
    },
    logoTitle: {
      fontFamily: 'Inter',
      fontWeight: 700,
      fontSize: '18px',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      // '@smDown': {
      //   display: 'none',
      //   visibility: 'collapse',
      // }
    },
    bodyBold: {
      fontWeight: 'bold',
      fontSize: '$2',
      lineHeight: '1.25',
    },
    headline: {
      fontSize: '$4',
      '@md': {
        fontSize: '$6',
      },
    },
    fixedHeadline: {
      fontSize: '$6',
      fontWeight: '500',
    },
    subHeadline: {
      fontSize: '$5',
    },
    boldHeadline: {
      fontWeight: 'bold',
      fontSize: '$4',
      '@md': {
        fontSize: '$6',
      },
      margin: 0,
    },
    modalHeadline: {
      fontWeight: '500',
      fontSize: '16px',
      lineHeight: '1',
      color: '$grayText',
      margin: 0,
    },
    footnote: {
      fontSize: '$1',
    },
    shareTitle: {
      fontSize: '$1',
      fontWeight: '600',
      color: '$grayText',
    },
    shareSubtitle: {
      fontSize: '$1',
      color: '$grayText',
    },
    listTitle: {
      fontSize: '16px',
      fontWeight: '500',
      color: '$grayTextContrast',
      lineHeight: '1.5',
      wordBreak: 'break-word',
    },
    caption: {
      color: '$grayText',
      fontSize: '12px',
      lineHeight: '1.5',
      wordBreak: 'break-word',
    },
    captionLink: {
      fontSize: '$2',
      textDecoration: 'underline',
      lineHeight: '1.5',
      cursor: 'pointer',
    },
    highlightAuthor: {
      fontSize: '14px',
      fontWeight: '600',
      lineHeight: '1.5',
      margin: '0px',
      color: '$omnivoreGray',
    },
    highlightTitle: {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.5',
      margin: '0px',
      color: '$omnivoreGray',
    },
    navLink: {
      m: 0,
      fontSize: '$1',
      fontWeight: 400,
      color: '$graySolid',
      cursor: 'pointer',
      '&:hover': {
        opacity: 0.7,
      },
    },
    controlButton: {
      color: '$grayText',
      fontWeight: '500',
      fontFamily: 'inter',
      fontSize: '14px',
    },
    menuTitle: {
      fontSize: 13,
      pt: '0px',
      m: '0px',
      borderRadius: 3,
      cursor: 'default',
      color: '$grayText'
    },
    error: {
      color: '$error',
      fontSize: '$2',
      lineHeight: '1.25',
    },
  },
}

export const StyledText = styled('p', {
  fontFamily: 'Inter',
  fontWeight: 'normal',
  lineHeight: '1.35',
  color: '$grayTextContrast',
  variants: textVariants,
  defaultVariants: {
    style: 'footnote',
  },
})

export const StyledListElement = styled('li', {
  fontFamily: 'Inter',
  fontWeight: 'normal',
  lineHeight: '1.35',
  color: '$grayTextContrast',
})

export const StyledList = styled('ul', {
  fontFamily: 'Inter',
  fontWeight: 'normal',
  lineHeight: '1.35',
  color: '$grayTextContrast',
})
