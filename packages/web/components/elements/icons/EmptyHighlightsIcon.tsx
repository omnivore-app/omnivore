/* eslint-disable functional/no-class */
/* eslint-disable functional/no-this-expression */
import { useCurrentTheme } from '../../../lib/hooks/useCurrentTheme'
import { IconProps } from './IconProps'

import React from 'react'

export function EmptyHighlightsIcon(): JSX.Element {
  const { currentTheme } = useCurrentTheme()
  switch (currentTheme) {
    case 'Sepia':
      return <EmptyHighlightsIconSepia />
    case 'Apollo':
    case 'Dark':
      return <EmptyHighlightsIconDark />
    case 'Light':
      return <EmptyHighlightsIconLight />
  }
  return <EmptyHighlightsIconLight />
}

class EmptyHighlightsIconDark extends React.Component<IconProps> {
  render() {
    return (
      <svg
        width="130"
        height="89"
        viewBox="0 0 130 89"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M42.1055 11.8008C39.1909 10.118 35.464 11.1167 33.7813 14.0312L29.7188 21.0677C28.036 23.9823 29.0346 27.7092 31.9492 29.3919L63.6133 47.6732C66.5278 49.3559 70.2547 48.3573 71.9375 45.4427L76 38.4062C77.6827 35.4917 76.684 31.7647 73.7695 30.082L42.1055 11.8008Z"
            fill="#6A6968"
          />
          <path
            d="M28.3159 34.3294L29.3315 32.5703L62.1683 51.5286L61.1527 53.2878C59.47 56.2023 55.743 57.2009 52.8285 55.5182L30.5464 42.6536C27.6318 40.9709 26.6332 37.2439 28.3159 34.3294Z"
            fill="#6A6968"
          />
          <path
            d="M29.1084 46.5156L50.2139 58.7009L48.4706 61.7227C47.3669 63.6342 45.324 64.7887 43.141 64.7695L42.6713 64.7473L22.9034 63.0484C21.5143 62.929 20.6829 61.4943 21.1971 60.2541L21.3182 60.009L29.1084 46.5156Z"
            fill="#898989"
          />
        </g>
        <rect x="65.0005" y="63" width="65" height="2" rx="1" fill="#898989" />
      </svg>
    )
  }
}

class EmptyHighlightsIconLight extends React.Component<IconProps> {
  render() {
    return (
      <svg
        width="130"
        height="89"
        viewBox="0 0 130 89"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M42.1055 11.8008C39.1909 10.118 35.464 11.1167 33.7813 14.0312L29.7188 21.0677C28.036 23.9823 29.0346 27.7092 31.9492 29.3919L63.6133 47.6732C66.5278 49.3559 70.2547 48.3573 71.9375 45.4427L76 38.4062C77.6827 35.4917 76.684 31.7647 73.7695 30.082L42.1055 11.8008Z"
            fill="#D9D9D9"
          />
          <path
            d="M28.3159 34.3294L29.3315 32.5703L62.1683 51.5286L61.1527 53.2878C59.47 56.2023 55.743 57.2009 52.8285 55.5182L30.5464 42.6536C27.6318 40.9709 26.6332 37.2439 28.3159 34.3294Z"
            fill="#898989"
          />
          <path
            d="M29.1084 46.5156L50.2139 58.7009L48.4706 61.7227C47.3669 63.6342 45.324 64.7887 43.141 64.7695L42.6713 64.7473L22.9034 63.0484C21.5143 62.929 20.6829 61.4943 21.1971 60.2541L21.3182 60.009L29.1084 46.5156Z"
            fill="#6A6968"
          />
        </g>
        <rect x="65.0005" y="63" width="65" height="2" rx="1" fill="#D9D9D9" />
      </svg>
    )
  }
}

class EmptyHighlightsIconSepia extends React.Component<IconProps> {
  render() {
    return (
      <svg
        width="130"
        height="89"
        viewBox="0 0 130 89"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M42.1055 11.8008C39.1909 10.118 35.464 11.1167 33.7813 14.0312L29.7188 21.0677C28.036 23.9823 29.0346 27.7092 31.9492 29.3919L63.6133 47.6732C66.5278 49.3559 70.2547 48.3573 71.9375 45.4427L76 38.4062C77.6827 35.4917 76.684 31.7647 73.7695 30.082L42.1055 11.8008Z"
            fill="#E6DFC9"
          />
          <path
            d="M28.3159 34.3294L29.3315 32.5703L62.1683 51.5286L61.1527 53.2878C59.47 56.2023 55.743 57.2009 52.8285 55.5182L30.5464 42.6536C27.6318 40.9709 26.6332 37.2439 28.3159 34.3294Z"
            fill="#D2CBB5"
          />
          <path
            d="M29.1084 46.5156L50.2139 58.7009L48.4706 61.7227C47.3669 63.6342 45.324 64.7887 43.141 64.7695L42.6713 64.7473L22.9034 63.0484C21.5143 62.929 20.6829 61.4943 21.1971 60.2541L21.3182 60.009L29.1084 46.5156Z"
            fill="#ACA590"
          />
        </g>
        <rect x="65.0005" y="63" width="65" height="2" rx="1" fill="#ACA590" />
      </svg>
    )
  }
}
