import { config } from '../../tokens/stitches.config'

export type ListSelectorIconProps = {
  color?: string
}

export function ListSelectorIcon(props: ListSelectorIconProps): JSX.Element {
  const fillColor = props.color || config.theme.colors.graySolid

  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1646_7375)">
        <path
          d="M19.1582 0.795105H1.6582C0.967847 0.795105 0.408203 1.35475 0.408203 2.0451V4.12844C0.408203 4.81879 0.967847 5.37844 1.6582 5.37844H19.1582C19.8486 5.37844 20.4082 4.81879 20.4082 4.12844V2.0451C20.4082 1.35475 19.8486 0.795105 19.1582 0.795105Z"
          fill="#6A6968"
        />
        <path
          d="M19.1582 7.87845H1.6582C0.967847 7.87845 0.408203 8.43809 0.408203 9.12845V11.2118C0.408203 11.9021 0.967847 12.4618 1.6582 12.4618H19.1582C19.8486 12.4618 20.4082 11.9021 20.4082 11.2118V9.12845C20.4082 8.43809 19.8486 7.87845 19.1582 7.87845Z"
          fill="#6A6968"
        />
        <path
          d="M19.1582 14.9618H1.6582C0.967847 14.9618 0.408203 15.5214 0.408203 16.2118V18.2951C0.408203 18.9855 0.967847 19.5451 1.6582 19.5451H19.1582C19.8486 19.5451 20.4082 18.9855 20.4082 18.2951V16.2118C20.4082 15.5214 19.8486 14.9618 19.1582 14.9618Z"
          fill="#6A6968"
        />
      </g>
      <defs>
        <clipPath id="clip0_1646_7375">
          <rect
            width="20"
            height="20"
            fill="white"
            transform="translate(0.408203 0.172607)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}
