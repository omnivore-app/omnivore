import { styled } from '../tokens/stitches.config'

const textVariants = {
  style: {
    body: {
      fontSize: '$2',
      lineHeight: '1.50',
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
    recommendedByline: {
      fontWeight: 'bold',
      fontSize: '13.5px',
      paddingTop: '4px',
      mt: '0px',
      mb: '16px',
      color: '$grayTextContrast',
    },
    userName: {
      fontWeight: '600',
      fontSize: '13.5px',
      paddingTop: '4px',
      my: '6px',
      color: '$grayText',
    },
    settingsSection: {
      fontWeight: '600',
      fontSize: '22px',
      fontFamily: '$inter',
      color: '$grayText',
      m: '0px',
      marginBlockStart: '0px',
      marginBlockEnd: '0px',
    },
    settingsItem: {
      fontSize: '13px',
      fontFamily: '$display',
      color: '$grayText',
      marginBlockStart: '0px',
      marginBlockEnd: '0px',
    },
    userNote: {
      fontSize: '16px',
      paddingTop: '0px',
      marginTop: '0px',
      lineHeight: '1.5',
      color: '$grayTextContrast',
    },
    headline: {
      fontSize: '$4',
      '@md': {
        fontSize: '$6',
      },
    },
    fixedHeadline: {
      fontSize: '24px',
      fontWeight: '500',
    },
    subHeadline: {
      fontSize: '24px',
      fontWeight: '500',
    },
    articleTitle: {
      fontWeight: 'bold',
      fontSize: '35px',
      '@mdDown': {
        fontSize: '25px',
      },
      margin: 0,
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
      fontWeight: '600',
      fontFamily: '$display',
      fontSize: '20px',
      lineHeight: '20px',
      color: '$grayText',
      margin: 0,
    },
    modalTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '$grayText',
      lineHeight: '1.50',
      margin: 0,
    },
    boldText: {
      fontWeight: '600',
      fontSize: '16px',
      lineHeight: '1',
      color: '$thTextContrast',
    },
    shareHighlightModalAnnotation: {
      fontSize: '18px',
      lineHeight: '23.4px',
      color: '$utilityTextSubtle',
      m: 0,
    },
    footnote: {
      fontSize: '$1',
    },
    shareTitle: {
      fontSize: '$1',
      fontWeight: '700',
      color: '$grayTextContrast',
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
    action: {
      fontSize: '16px',
      fontWeight: '500',
      lineHeight: '1.5',
    },
    actionLink: {
      fontSize: '16px',
      fontWeight: '500',
      lineHeight: '1.5',
      textDecoration: 'underline',
      cursor: 'pointer',
    },
    navLink: {
      m: 0,
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
      pt: '0px',
      m: '0px',
      color: '$utilityTextDefault',
      fontSize: 16,
      fontFamily: 'inter',
      fontWeight: '500',
      lineHeight: 'unset',
    },
    libraryHeader: {
      pt: '0px',
      m: '0px',
      fontSize: 24,
      fontFamily: 'inter',
      lineHeight: 'unset',
      fontWeight: 'bold',
      color: '$textSubtle',
    },
    aboutFooter: {
      pt: '0px',
      m: '0px',
      fontSize: 24,
      fontFamily: 'inter',
      lineHeight: 'unset',
      fontWeight: 'bold',
      color: 'white',
    },
    displaySettingsLabel: {
      fontFamily: '$display',
      fontWeight: '500',
      fontSize: '12px',
      lineHeight: '20px',
      color: '$thTextSubtle2',
      marginBlockStart: '0',
      marginTop: '10px',
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
  lineHeight: '120%',
  color: '$grayTextContrast',
  variants: textVariants,
  defaultVariants: {
    style: 'footnote',
  },
})

export const StyledTextSpan = styled('span', StyledText)

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

export const StyledImg = styled('img', {})

export const StyledAnchor = styled('a', {
  textDecoration: 'none',
})

export const StyledMark = styled('mark', {})
