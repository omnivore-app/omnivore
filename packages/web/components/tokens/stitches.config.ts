import type * as Stitches from '@stitches/react'
import { createStitches, createTheme } from '@stitches/react'

export enum ThemeId {
  Light = 'Light',
  Dark = 'Dark',
  Sepia = 'Sepia',
  Apollo = 'Apollo',
  Black = 'Black',
  System = 'System',
}

export const { styled, css, theme, getCssText, globalCss, keyframes, config } =
  createStitches({
    utils: {
      bg: (value: Stitches.PropertyValue<'backgroundColor'>) => ({
        backgroundColor: value,
      }),
      p: (value: Stitches.PropertyValue<'padding'>) => ({
        padding: value,
      }),
      pt: (value: Stitches.PropertyValue<'paddingTop'>) => ({
        paddingTop: value,
      }),
      pb: (value: Stitches.PropertyValue<'paddingBottom'>) => ({
        paddingBottom: value,
      }),
      pl: (value: Stitches.PropertyValue<'paddingLeft'>) => ({
        paddingLeft: value,
      }),
      pr: (value: Stitches.PropertyValue<'paddingRight'>) => ({
        paddingRight: value,
      }),
      px: (value: Stitches.PropertyValue<'padding'>) => ({
        paddingLeft: value,
        paddingRight: value,
      }),
      py: (value: Stitches.PropertyValue<'padding'>) => ({
        paddingTop: value,
        paddingBottom: value,
      }),
      m: (value: Stitches.PropertyValue<'margin'>) => ({
        margin: value,
      }),
      mt: (value: Stitches.PropertyValue<'marginTop'>) => ({
        marginTop: value,
      }),
      mb: (value: Stitches.PropertyValue<'marginBottom'>) => ({
        marginBottom: value,
      }),
      ml: (value: Stitches.PropertyValue<'marginLeft'>) => ({
        marginLeft: value,
      }),
      mr: (value: Stitches.PropertyValue<'marginRight'>) => ({
        marginRight: value,
      }),
      mx: (value: Stitches.PropertyValue<'margin'>) => ({
        marginLeft: value,
        marginRight: value,
      }),
      my: (value: Stitches.PropertyValue<'margin'>) => ({
        marginTop: value,
        marginBottom: value,
      }),
    },
    theme: {
      fonts: {
        inter: 'Inter, sans-serif',
        display: '-apple-system, BlinkMacSystemFont, sans-serif',
      },
      fontSizes: {
        1: '0.75em',
        2: '0.875em',
        3: '1em',
        4: '1.25em',
        5: '1.5em',
        6: '2em',
      },
      space: {
        1: '0.25em',
        2: '0.5em',
        3: '1em',
        4: '2em',
        5: '4em',
        6: '8em',
      },
      sizes: {
        1: '0.25em',
        2: '0.5em',
        3: '1em',
        4: '2em',
        5: '4em',
        6: '8em',
      },
      radii: {
        1: '0.125em',
        2: '0.25em',
        3: '0.5em',
        round: '9999px',
      },
      fontWeights: {},
      lineHeights: {},
      letterSpacings: {},
      borderWidths: {},
      borderStyles: {},
      shadows: {
        // cardBoxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05);',
        cardBoxShadow: '0px 4px 4px rgba(0, 0, 0, 0.20);',
      },
      zIndices: {},
      transitions: {},

      colorScheme: {
        colorScheme: 'light',
      },

      colors: {
        grayBase: '#F8F8F8',
        grayBg: '#FFFFFF',
        grayBgActive: '#e6e6e6',
        grayBorder: '#F0F0F0',
        grayTextContrast: '#3A3939',
        graySolid: '#9C9B9A',
        utilityTextDefault: '#3B3938',
        utilityTextSubtle: 'rgba(255, 255, 255, 0.65)',
        textNonessential: 'rgba(10, 8, 6, 0.4)',

        grayBgSubtle: 'hsl(0 0% 97.3%)',
        grayBgHover: 'hsl(0 0% 93.0%)',
        grayLine: 'hsl(0 0% 88.7%)',
        grayBorderHover: 'hsl(0 0% 78.0%)',
        grayText: '#6A6968',

        ctaBlue: '#007AFF',
        modalBackground: '#FFFFFF',

        highlightBackground: '255, 210, 52',
        recommendedHighlightBackground: '#E5FFE5',
        highlight: '#FFD234',
        highlightText: '#3D3D3D',
        error: '#FA5E4A',

        discover: '#7274d5',

        // Brand Colors
        omnivoreRed: '#FA5E4A;',
        omnivoreGray: '#3D3D3D',
        omnivoreYellow: 'rgb(255, 234, 159)',
        omnivoreLightGray: 'rgb(125, 125, 125)',
        omnivoreCtaYellow: 'rgb(255, 210, 52)',
        searchActiveOutline: 'rgb(255, 210, 52)',

        // Reader Colors
        readerBg: 'white',
        readerFont: '#3D3D3D',
        readerFontHighContrast: 'black',
        readerTableHeader: '#FFFFFF',
        readerMargin: 'white',

        // Avatar Fallback color
        avatarBg: '#FFEA9F',
        avatarFont: '#9C7C0A',

        labelButtonsBg: '#F5F5F4',

        textSubtle: '#605F5D',
        border: '#F0F0F0',

        //utility
        overlay: 'rgba(63, 62, 60, 0.2)',

        // New theme, special naming to keep things straight
        // once all switch over, we will rename
        thBackground: '#FFFFFF',
        thBackground2: '#F3F3F3',
        thBackground3: '#FCFCFC',
        thBackground4: '#EBEBEB',
        thBackground5: '#F5F5F5',
        thBackgroundActive: '#FFEA9F',
        thBackgroundContrast: '#FFFFFF',
        thLeftMenuBackground: '#FCFCFC',
        thLibraryBackground: '#FFFFFF',
        thLibrarySearchbox: '#FCFCFC',
        thLibraryMenuPrimary: '#3D3D3D',
        thLibraryMenuSecondary: '#3D3D3D',
        thLibraryMenuUnselected: '#3D3D3D',
        thLibrarySelectionColor: '#FFEA9F',
        thLibraryNavigationMenuFooter: '#EFEADE',
        thLibraryMenuFooterHover: '#FFFFFF',
        thLibraryMultiselectHover: '#D9D9D9',
        thLibraryMultiselectCheckbox: '#3D3D3D',
        thLibraryMultiselectCheckboxHover: '#3D3D3D',

        thTLDRText: '#434343',

        thFormInput: '#EBEBEB',
        thHomeIcon: '#2A2A2A',

        thLabelChipForeground: '#2A2A2A',
        thLabelChipBackground: '#F5F5F5',
        thLabelChipSelectedBorder: 'black',
        thLabelChipUnselectedBorder: '#F5F5F5',
        thLabelOutlineChipBorder: '#D9D9D9',

        thHeaderIconRing: '#D9D9D9',
        thHeaderIconInner: '#898989',

        thNotebookSubtle: '#6A6968',
        thNotebookBorder: '#D9D9D9',
        thNotebookBackground: '#FCFCFC',
        thNotebookTextBackground: '#EBEBEB',

        thTextContrast: '#1E1E1E',
        thTextContrast2: '#3D3D3D',

        thTextSubtle: '#1E1E1E',
        thTextSubtle2: '#6A6968',
        thTextSubtle3: '#ADADAD',

        thBorderColor: '#E1E1E1',
        thBorderSubtle: '#EEEEEE',
        tabTextUnselected: '#898989',

        thProgressFg: '#FFD234',

        thHighContrast: '#3D3D3D',
        thHighlightBar: '#D9D9D9',

        thLibraryAISummaryBorder: '#6A6968',
        thLibraryAISummaryBackground: '#343434',

        thFallbackImageForeground: '#2A2A2A',
        thFallbackImageBackground: '#EDEDED',

        highlight_background_green: '85, 198, 137',
        highlight_background_blue: '106, 177, 255',
        highlight_background_orange: '254, 181, 109',
        highlight_background_yellow: '255, 210, 52',
        highlight_background_red: '251, 154, 154',

        highlight_background_alpha: '0.2',
        highlight_underline_alpha: '1.0',
      },
    },
    media: {
      xsmDown: '(max-width: 375px)',
      smDown: '(max-width: 575px)',
      mdDown: '(max-width: 768px)',
      lgDown: '(max-width: 992px)',
      xlgDown: '(max-width: 1200px)',
      sm: '(min-width: 576px)',
      md: '(min-width: 768px)',
      lg: '(min-width: 992px)',
      xl: '(min-width: 1200px)',
      xxl: '(min-width: 1500px)',
    },
  })

const darkThemeSpec = {
  colorScheme: {
    colorScheme: 'dark',
  },
  shadows: {
    cardBoxShadow: '0px 4px 8px rgba(0, 0, 0, 0.50);',
  },
  colors: {
    grayBase: '#252525',
    grayBg: '#3B3938',
    grayBgActive: '#4f4d4c',
    grayTextContrast: '#D8D7D7',
    grayBorder: '#323232',
    graySolid: '#9C9B9A',
    utilityTextDefault: '#CDCDCD',
    textNonessential: 'rgba(97, 97, 97, 1)',

    grayBgSubtle: 'hsl(0 0% 9.8%)',
    grayBgHover: 'hsl(0 0% 13.8%)',
    grayLine: 'hsl(0 0% 19.9%)',
    grayBorderHover: 'hsl(0 0% 31.2%)',
    grayText: '#CDCDCD',

    modalBackground: '#2A2A2A',

    // Semantic Colors
    highlightBackground: '134, 109, 21',
    recommendedHighlightBackground: '#1F4315',
    highlight: '#FFD234',
    highlightText: 'white',
    error: '#FA5E4A',

    // Reader Colors
    readerBg: '#303030',
    readerFont: '#b9b9b9',
    readerFontHighContrast: 'white',
    readerTableHeader: '#FFFFFF',
    readerMargin: '#2A2A2A',

    avatarBg: '#7B5C3E',
    avatarFont: '#D9D9D9',

    textSubtle: '#AAAAAA',
    border: '#323232',

    //utility
    utilityTextSubtle: 'rgba(255, 255, 255, 0.65)',
    overlay: 'rgba(10, 8, 6, 0.65)',

    labelButtonsBg: '#5F5E58',

    // New theme, special naming to keep things straight
    // once all switch over, we will rename
    // DARK
    colorScheme: 'dark',
    thBackground: '#2A2A2A',
    thBackground2: '#3D3D3D',
    thBackground3: '#242424',
    thBackground4: '#3D3D3D',
    thBackground5: '#3D3D3D',
    thBackgroundActive: '#3D3D3D',
    thBackgroundContrast: '#000000',
    thLeftMenuBackground: '#343434',
    thLibraryBackground: '#2A2A2A',
    thLibrarySearchbox: '#3D3D3D',
    thLibraryMenuPrimary: '#EBEBEB',
    thLibraryMenuSecondary: '#EBEBEB',
    thLibraryMenuUnselected: 'white',
    thLibrarySelectionColor: '#6A6968',
    thLibraryNavigationMenuFooter: '#3D3D3D',
    thLibraryMenuFooterHover: '#6A6968',
    thLibraryMultiselectHover: '#6A6968',
    thLibraryMultiselectCheckbox: 'white',
    thLibraryMultiselectCheckboxHover: 'white',

    thTLDRText: '#D9D9D9',

    searchActiveOutline: '#866D15',
    thFormInput: '#3D3D3D',
    thHomeIcon: '#FFFFFF',

    thLabelChipForeground: '#EBEBEB',
    thLabelChipBackground: '#2A2A2A',
    thLabelChipSelectedBorder: '#FFEA9F',
    thLabelChipUnselectedBorder: '#2A2A2A',
    thLabelOutlineChipBorder: '#6A696850',

    thHeaderIconRing: '#3D3D3D',
    thHeaderIconInner: '#D9D9D9',

    thNotebookSubtle: '#898989',
    thNotebookBorder: '#3D3D3D',
    thNotebookBackground: '#2F2F2F',
    thNotebookTextBackground: '#3D3D3D',
    thNotebookHighContrast: '#2A2A2A',

    thTextContrast: '#FFFFFF',
    thTextContrast2: '#EBEBEB',

    thTextSubtle: '#D9D9D9',
    thTextSubtle2: '#D9D9D9',
    thTextSubtle3: '#ADADAD',

    thBorderColor: '#4F4F4F',
    thBorderSubtle: '#6A6968',
    tabTextUnselected: '#6A6968',

    thProgressFg: '#FFD234',

    thHighContrast: '#D9D9D9',

    thHighlightBar: '#6A6968',

    thLibraryAISummaryBorder: '#6A6968',
    thLibraryAISummaryBackground: '#343434',

    thFallbackImageForeground: '#FEFFFF',
    thFallbackImageBackground: '#3C3C3C',

    highlight_underline_alpha: '0.5',
    highlight_background_alpha: '0.35',
  },
}

// This is used by iOS
const blackThemeSpec = {
  colors: {
    readerBg: 'black',
  },
}

const sepiaThemeSpec = {
  colorScheme: {
    colorScheme: 'light',
  },
  colors: {
    readerBg: '#FBF0D9',
    readerFont: '#5F4B32',
    readerMargin: '#F3F3F3',
    readerFontHighContrast: '#0A0806',
    readerTableHeader: '#FFFFFF',
  },
}

const apolloThemeSpec = {
  colors: {
    readerBg: '#6A6968',
    readerFont: '#F3F3F3',
    readerMargin: '#474747',
    readerFontHighContrast: 'white',
    readerTableHeader: '#FFFFFF',
  },
}

export const darkTheme = createTheme(ThemeId.Dark, darkThemeSpec)
export const sepiaTheme = createTheme(ThemeId.Sepia, {
  ...darkThemeSpec,
  ...sepiaThemeSpec,
})
export const apolloTheme = createTheme(ThemeId.Apollo, {
  ...darkThemeSpec,
  colors: {
    ...darkThemeSpec.colors,
    ...apolloThemeSpec.colors,
  },
})
export const blackTheme = createTheme(ThemeId.Black, {
  ...darkThemeSpec,
  colors: {
    ...darkThemeSpec.colors,
    ...blackThemeSpec.colors,
  },
})

// Apply global styles in here
export const globalStyles = globalCss({
  body: {
    colorScheme: 'var(--colorScheme-colorScheme)',
    backgroundColor: '$thBackground',
  },
  // browser prefers this loaded here vs in the article styling css
  '.article-inner-css': {
    '::selection': {
      background: 'rgb($highlightBackground)',
    },
  },
})
