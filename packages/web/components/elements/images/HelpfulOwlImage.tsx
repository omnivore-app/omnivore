import Image from 'next/image'

type HelpfulOwlImageProps = {
  width: number
  height: number
}

export const HelpfulOwlImage = (props: HelpfulOwlImageProps) => {
  return (
    <Image
      src="/static/images/helpful-owl@2x.png"
      width={200}
      height={200}
      alt="Picture of an owl reading"
    />
  )
}
