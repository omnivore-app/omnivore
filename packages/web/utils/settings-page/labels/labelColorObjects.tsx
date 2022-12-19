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
  const randomColorHex = colorHexes[Math.floor(Math.random() * colorHexes.length)]
  return randomColorHex
}