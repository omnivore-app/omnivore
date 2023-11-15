import Image from 'next/image'

export const HelpfulOwlImage = () => {
  return (
    <Image
      src="/static/images/helpful-owl@2x.png"
      width={200}
      height={200}
      alt="Picture of an owl reading"
    />
  )
}
