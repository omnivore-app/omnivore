import { DetailedHTMLProps, MetaHTMLAttributes } from 'react'
import Head from 'next/head'
import { useDarkModeListener } from '../../lib/hooks/useDarkModeListener'

type MetaTag = DetailedHTMLProps<
  MetaHTMLAttributes<HTMLMetaElement>,
  HTMLMetaElement
>

export type PageMetaDataProps = {
  path: string
  title: string
  description?: string
  ogImage?: string
  ogImageType?: string
  metaTags?: MetaTag[]
}

function openGraphType(ogImage: string | null): string {
  if (!ogImage) return ''
  if (typeof ogImage !== 'string') return ''
  if (ogImage.endsWith('.png')) return 'image/png'
  if (ogImage.endsWith('.jpg')) return 'image/jpeg'
  if (ogImage.endsWith('.jpeg')) return 'image/jpeg'
  return ''
}

export function PageMetaData(props: PageMetaDataProps): JSX.Element {
  const isDarkMode = useDarkModeListener()

  return (
    <Head>
      <link
        rel="shortcut icon"
        href={`/static/icons/favicon-${isDarkMode ? 'dark' : 'light'}.ico`}
      />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Omnivore" />

      {props.ogImage && (
        <meta property="og:image" content={props.ogImage} key="og-image" />
      )}
      {props.ogImage && (
        <meta property="og:image:width" content="" key="og-image-width" />
      )}
      {props.ogImage && (
        <meta property="og:image:height" content="" key="og-image-height" />
      )}
      {props.ogImage && (
        <meta
          property="og:image:type"
          content={props.ogImageType || openGraphType(props.ogImage)}
          key="og-image-type"
        />
      )}
      {props.title && (
        <meta property="og:title" content={props.title} key="og-title" />
      )}
      {props.title && <title key="title">{props.title}</title>}
      {props.description && (
        <meta
          property="og:description"
          content={props.description}
          key="og-description"
        />
      )}
      {props.path && (
        <meta
          property="og:url"
          content={`https://omnivore.app${props.path}`}
          key="og-url"
        />
      )}
      {props.path && (
        <link rel="canonical" href={`https://omnivore.app${props.path}`} />
      )}

      {/* Custom additional meta tags */}
      {props.metaTags?.map((metatag, i) => (
        <meta key={i} {...metatag} />
      ))}

      <meta property="fb:app_id" content="3584400838451823" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator:id" content="1372981426199564288" />
      <meta name="twitter:site:id" content="1372981426199564288" />
    </Head>
  )
}
