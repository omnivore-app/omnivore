import type * as Stitches from '@stitches/react'
import { createStitches, createTheme } from '@stitches/react'

export enum ThemeId {
  Lighter = 'White',
  Light = 'LightGray',
  Dark = 'Gray',
  Darker = 'Dark',
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
        panelShadow: '0px 4px 18px rgba(120, 123, 134, 0.12)',
        cardBoxShadow: '0px 16px 25px 16px rgba(32, 31, 29, 0.1)',
      },
      zIndices: {},
      transitions: {},
      colors: {
        // Grayscale
        grayBase: '#F8F8F8',
        grayBg: '#FFFFFF',
        grayBgActive: '#e6e6e6',
        grayBorder: '#F0F0F0',
        grayTextContrast: '#3A3939',
        graySolid: '#9C9B9A',

        grayBgSubtle: 'hsl(0 0% 97.3%)',
        grayBgHover: 'hsl(0 0% 93.0%)',
        grayLine: 'hsl(0 0% 88.7%)',
        grayBorderHover: 'hsl(0 0% 78.0%)',
        grayText: 'hsl(0 0% 43.5%)',

        // Semantic Colors
        highlightBackground: 'rgba(255, 210, 52, 0.65)',
        highlight: '#FFD234',
        highlightText: '#3D3D3D',
        error: '#FA5E4A',

        // Brand Colors
        omnivoreRed: '#FA5E4A;',
        omnivoreGray: '#3D3D3D',
        omnivoreOrange: '#FF9B3E',
        omnivorePeach: 'rgb(255, 212, 146)',
        omnivoreYellow: 'rgb(255, 234, 159)',
        omnivoreLightGray: 'rgb(125, 125, 125)',
        omnivoreCtaYellow: 'rgb(255, 210, 52)',

        // Reader Colors
        readerBg: '#E5E5E5',
        readerFont: '#3D3D3D',
        readerFontHighContrast: 'black',
        readerFontTransparent: 'rgba(61,61,61,0.65)',
        readerHeader: '3D3D3D',
        readerTableHeader: '#FFFFFF',

        // Avatar Fallback color
        avatarBg: '#FFFFFF',
        avatarFont: '#0A0806',

        labelButtonsBg: '#F5F5F4',
        tooltipIcons: '#FDFAEC',

        //utility
        textDefault: 'rgba(10, 8, 6, 0.8)',
        textSubtle: 'rgba(10, 8, 6, 0.65)',
        textNonEssential: 'rgba(10, 8, 6, 0.4)',
        overlay: 'rgba(63, 62, 60, 0.2)',
      },
    },
    media: {
      xsmDown: '(max-width: 375px)',
      smDown: '(max-width: 575px)',
      mdDown: '(max-width: 768px)',
      lgDown: '(max-width: 992px)',
      sm: '(min-width: 576px)',
      md: '(min-width: 768px)',
      lg: '(min-width: 992px)',
      xl: '(min-width: 1200px)',
    },
  })

const darkThemeSpec = {
  colors: {
    grayBase: '#252525',
    grayBg: '#3B3938',
    grayBgActive: '#4f4d4c',
    grayTextContrast: '#D8D7D7',
    grayBorder: '#323232',
    graySolid: '#9C9B9A',

    grayBgSubtle: 'hsl(0 0% 9.8%)',
    grayBgHover: 'hsl(0 0% 13.8%)',
    grayLine: 'hsl(0 0% 19.9%)',
    grayBorderHover: 'hsl(0 0% 31.2%)',
    grayText: 'hsl(0 0% 62.8%)',

    // Semantic Colors
    highlightBackground: '#867740',
    highlight: '#FFD234',
    highlightText: 'white',
    error: '#FA5E4A',

    // Reader Colors
    readerBg: '#303030',
    readerFont: '#b9b9b9',
    readerFontHighContrast: 'white',
    readerFontTransparent: 'rgba(185,185,185,0.65)',
    readerHeader: '#b9b9b9',
    readerTableHeader: '#FFFFFF',
    tooltipIcons: '#5F5E58',
    avatarBg: '#000000',
    avatarFont: 'rgba(255, 255, 255, 0.8)',

    //utility
    textDefault: 'rgba(255, 255, 255, 0.8)',
    textSubtle: 'rgba(255, 255, 255, 0.65)',
    textNonEssential: 'rgba(10, 8, 6, 0.4)',
    overlay: 'rgba(10, 8, 6, 0.65)',

    labelButtonsBg: '#5F5E58',
  },
  shadows: {
    cardBoxShadow:
      '0px 0px 9px -2px rgba(5, 5, 5, 0.16), 0px 7px 12px rgba(0, 0, 0, 0.13)',
  },
}

// Avatar Fallback color

// Dark and Darker theme now match each other.
// Use the darkThemeSpec object to make updates.
export const darkTheme = createTheme(ThemeId.Dark, darkThemeSpec)
export const darkerTheme = createTheme(ThemeId.Darker, darkThemeSpec)

// Lighter theme now matches the default theme.
// This only exists for users that might still have a lighter theme set
export const lighterTheme = createTheme(ThemeId.Lighter, {})

// Apply global styles in here
export const globalStyles = globalCss({
  'body': {
    backgroundColor: '$grayBase'
  },
  '*': {
    '&:focus': {
      outline: 'none',
    },
    '&:focus-visible': {
      outline: 'none',
    },
  },
  // browser prefers this loaded here vs in the article styling css
  '.article-inner-css': {
    '::selection': {
      background: '$highlightBackground',
    },
  },
})
