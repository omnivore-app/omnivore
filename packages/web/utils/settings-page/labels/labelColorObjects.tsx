import { LabelColorObjects } from './types'

export const labelColorObjects: LabelColorObjects = {
  '#FF5D99': {
    colorName: 'red',
    text: '#B20042',
    border: '#FF5D9966',
    background: '#FF5D990D',
  },
  '#7CFF7B': {
    colorName: 'green',
    text: '#01A800',
    border: '#7CFF7B66',
    background: '#7CFF7B0D',
  },
  '#FFD234': {
    colorName: 'yellow',
    text: '#947300',
    border: '#FFD23466',
    background: '#FFD2340D',
  },
  '#7BE4FF': {
    colorName: 'blue',
    text: '#007E9E',
    border: '#7BE4FF66',
    background: '#7BE4FF0D',
  },
  '#CE88EF': {
    colorName: 'purple',
    text: '#B759E3',
    border: '#CE88EF66',
    background: '#CE88EF0D',
  },
  '#EF8C43': {
    colorName: 'orange',
    text: '#F37417',
    border: '#EF8C4366',
    background: '#EF8C430D',
  },
  'custom color': {
    colorName: 'custom color',
    text: '#A5A4A1',
    border: '#D8D7D566',
    background: '#D8D7D50D',
  },
}

export const randomLabelColorHex = () => {
  const colorHexes = Object.keys(labelColorObjects).slice(0, -1)
  const randomColorHex =
    colorHexes[Math.floor(Math.random() * colorHexes.length)]
  return randomColorHex
}

export const hextoRGB = (hex: string) => {
  // strip the leading # if it's there
  hex = hex.replace(/^\s*#|\s*$/g, '')
  // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
  if (hex.length == 3) {
    hex = hex.replace(/(.)/g, '$1$1')
  }
  const aRgbHex = hex.match(/.{1,2}/g)
  if (aRgbHex) {
    const aRgb = [
      parseInt(aRgbHex[0], 16),
      parseInt(aRgbHex[1], 16),
      parseInt(aRgbHex[2], 16),
    ]
    return aRgb
  }
}

// returns a hexadecimal value with increased brightness
export const increaseBrightness = (rgb: Array<number>, brightness: number) => {
  const r = Math.round(Math.min(Math.max(0, rgb[0] + rgb[0] * brightness), 255))
  const g = Math.round(Math.min(Math.max(0, rgb[1] + rgb[1] * brightness), 255))
  const b = Math.round(Math.min(Math.max(0, rgb[2] + rgb[2] * brightness), 255))

  let red = r.toString(16)
  let green = g.toString(16)
  let blue = b.toString(16)

  if (red.length == 1) red = '0' + red
  if (green.length == 1) green = '0' + green
  if (blue.length == 1) blue = '0' + blue

  return `#${red}${green}${blue}`
}

export const getLuminanceFromRGB = (rgb: Array<number>) => {
  const r = rgb[0] / 255
  const g = rgb[1] / 255
  const b = rgb[2] / 255
  const red = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
  const green = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
  const blue = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)
  // For the sRGB colorspace, the relative luminance of a color is defined as:
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue
  return luminance
}
