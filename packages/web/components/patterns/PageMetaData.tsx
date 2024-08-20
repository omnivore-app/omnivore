import { DetailedHTMLProps, MetaHTMLAttributes } from 'react'
import Head from 'next/head'
import { webBaseURL } from '../../lib/appConfig'

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
  return (
    <Head>
      <link rel="icon" href="/static/icons/favicon.ico" sizes="32x32" />

      <meta property="fb:app_id" content="3584400838451823" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator:id" content="1372981426199564288" />
      <meta name="twitter:site:id" content="1372981426199564288" />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Omnivore" />

      <meta name="twitter:domain" content="omnivore.app" />

      {props.ogImage && (
        <>
          <meta property="og:image" content={props.ogImage} key="og-image" />
          <meta
            name="twitter:image"
            content={`${webBaseURL}${props.ogImage}`}
          />
        </>
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
        <>
          <meta property="og:title" content={props.title} key="og-title" />
          <meta name="twitter:title" content={props.title} />
        </>
      )}
      {props.title && <title key="title">{props.title}</title>}
      {props.description && (
        <>
          <meta
            property="og:description"
            content={props.description}
            key="og-description"
          />
          <meta name="twitter:description" content={props.description} />
        </>
      )}
      {props.path && (
        <meta
          property="og:url"
          content={`${webBaseURL}/${props.path}`}
          key="og-url"
        />
      )}
      {props.path && (
        <link rel="canonical" href={`${webBaseURL}/${props.path}`} />
      )}

      {/* Custom additional meta tags */}
      {props.metaTags?.map((metatag, i) => (
        <meta key={i} {...metatag} />
      ))}
    </Head>
  )
}
