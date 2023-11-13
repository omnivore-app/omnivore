import { Box, HStack, VStack } from "../../../elements/LayoutPrimitives"
import { DEFAULT_HEADER_HEIGHT, useGetHeaderHeight } from "../../homeFeed/HeaderSpacer"
import React from "react"

type HeaderTextProps = {
  title: string,
  subTitle: string
}

export function HeaderText(props: HeaderTextProps): JSX.Element {
  return (
      <VStack css={{flexGrow: 1}}>
    <VStack  alignment={"start"}  css={{width: "100%", flexGrow: 1,}} >
      <HStack css={{
          font: '$inter',
          fontSize: 'min(4.25vw, 75px)',
          fontWeight: '750',
          whiteSpace: 'nowrap',
          lineHeight: '75px',
          color: '$thLibraryMenuPrimary',
        }}>
        {props.title}
      </HStack>
    </VStack>
      <VStack  alignment={"end"}  distribution={"end"} css={{width: "100%"}} >
        <HStack css={{
          font: '$inter',
          fontSize: 'min(2vw, 45px)',
          fontWeight: '100',
          whiteSpace: 'nowrap',
          lineHeight: 'min(3vw, 35px)',
          color: '$thLibraryMenuPrimary',
        }}>
          {props.subTitle}
        </HStack>
      </VStack>

        <VStack  alignment={"end"}  distribution={"end"} css={{width: "100%"}} >
          <HStack css={{width: '100%', height: '1px', backgroundColor:'$thBorderColor' }}>
          </HStack>
        </VStack>
      </VStack>

  )
}
