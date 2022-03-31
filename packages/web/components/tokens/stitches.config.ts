import type * as Stitches from '@stitches/react'
import { createStitches, createTheme } from '@stitches/react'
import {
  gray,
  grayDark,
  blackA,
  yellow,
  yellowDark,
  orange,
  orangeDark,
} from '@radix-ui/colors'

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
        cardBoxShadow: '0px 0px 9px -2px rgba(32, 31, 29, 0.09), 0px 7px 12px rgba(32, 31, 29, 0.07)'
      },
      zIndices: {},
      transitions: {},
      colors: {
        // Radix Color Scales
        ...yellow, // Brand
        ...orange, //Accent

        // Grayscale
        grayBase: '#F8F8F8',
        grayBg: '#FFFFFF',
        grayBgActive: '#e6e6e6',
        grayBorder: 'rgba(0, 0, 0, 0.06)',
        grayTextContrast: '#3A3939',
        graySolid: '#9C9B9A',

        grayBgSubtle: gray.gray2,
        grayBgHover: gray.gray4,
        grayLine: gray.gray6,
        grayBorderHover: gray.gray8,
        graySolidHover: gray.gray10,
        grayText: gray.gray11,

        // Semantic Colors
        overlay: blackA.blackA9,
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
        readerFontTransparent: 'rgba(61,61,61,0.65)',
        readerHeader: '3D3D3D',
        readerTableHeader: '#FFFFFF',

        // Avatar Fallback color
        avatarBg: '#FFFFFF',
        avatarFont: '#0A0806',

        labelButtonsBg: '#F5F5F4',
        tooltipIcons: '#FDFAEC'
      },
    },
    media: {
      xsmDown: '(max-width: 375px)',
      smDown: '(max-width: 575px)',
      mdDown: '(max-width: 768px)',
      sm: '(min-width: 576px)',
      md: '(min-width: 768px)',
      lg: '(min-width: 992px)',
      xl: '(min-width: 1200px)',
    },
  })

const darkThemeSpec = {
  colors: {
    ...yellowDark, // Brand
    ...orangeDark, //Accent

    // Grayscale (top ones have been updated from new designs)
    grayBase: '#252525',
    grayBg: '#3B3938',
    grayBgActive: '#4f4d4c',
    grayTextContrast: '#D8D7D7',
    grayBorder: 'rgba(255, 255, 255, 0.06)',
    graySolid: '#9C9B9A',

    grayBgSubtle: grayDark.gray2,
    grayBgHover: grayDark.gray4,
    grayLine: grayDark.gray6,
    grayBorderHover: grayDark.gray8,
    graySolidHover: grayDark.gray10,
    grayText: grayDark.gray11,

    // Semantic Colors
    overlay: blackA.blackA9,
    highlightBackground: '#867740',
    highlight: '#FFD234',
    highlightText: 'white',
    error: '#FA5E4A',

    // Reader Colors
    readerBg: '#303030',
    readerFont: '#b9b9b9',
    readerFontTransparent: 'rgba(185,185,185,0.65)',
    readerHeader: '#b9b9b9',
    readerTableHeader: '#FFFFFF',
    tooltipIcons: '#5F5E58',
    avatarBg: '#000000',
    avatarFont: 'rgba(255, 255, 255, 0.8)',

    labelButtonsBg: '#5F5E58',
  },
  shadows: {
    cardBoxShadow: '0px 0px 9px -2px rgba(32, 31, 29, 0.09), 0px 7px 12px rgba(32, 31, 29, 0.07)'
  }
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
