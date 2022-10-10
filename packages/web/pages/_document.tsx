/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable functional/no-class */
import { useEffect } from 'react'
import NextDocument, { Html, Head, Main, NextScript } from 'next/document'
import { getCssText, globalStyles } from '../components/tokens/stitches.config'

export default class Document extends NextDocument {
  render() {
    const setUserPreferences = `
      function getCookie(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
      }

      function storeCookieInLocalStorage(key) {
        let value = getCookie(key);
        if (value != "") {
          window.localStorage.setItem(key, value)
        }
      }

      storeCookieInLocalStorage("authToken")
      storeCookieInLocalStorage("theme")

      var themeId = window.localStorage.getItem('theme')

      if (themeId) {
        document.body.classList.remove('theme-default', 'White', 'Gray', 'LightGray', 'Dark')
        document.body.classList.add(themeId)
      }
    `

    globalStyles()

    return (
      <Html lang="en">
        <Head>
          <style
            id="stitches"
            dangerouslySetInnerHTML={{ __html: getCssText() }}
          />
          <link rel="manifest" href="/manifest.webmanifest" />
          <script async src="/static/scripts/intercom.js" />
          <script async src="/static/scripts/inject-sw.js" />

          {/* prefetch (not preload) fonts that will be used by the reader */}
          <link rel="prefetch" href="/static/fonts/Lora/Lora-Regular.ttf" />
          <link rel="prefetch" href="/static/fonts/Lora/Lora-Bold.ttf" />
          <link rel="prefetch" href="/static/fonts/Lora/Lora-Italic.ttf" />
          <link
            rel="prefetch"
            href="/static/fonts/Merriweather/Merriweather-Regular.ttf"
          />
          <link
            rel="prefetch"
            href="/static/fonts/Merriweather/Merriweather-Bold.ttf"
          />
          <link
            rel="prefetch"
            href="/static/fonts/Merriweather/Merriweather-Italic.ttf"
          />
          <link
            rel="prefetch"
            href="/static/fonts/Open_Sans/OpenSans-Regular.ttf"
          />
          <link
            rel="prefetch"
            href="/static/fonts/Open_Sans/OpenSans-Bold.ttf"
          />
          <link
            rel="prefetch"
            href="/static/fonts/Open_Sans/OpenSans-Italic.ttf"
          />
          <link rel="prefetch" href="/static/fonts/Roboto/Roboto-Regular.ttf" />
          <link rel="prefetch" href="/static/fonts/Roboto/Roboto-Bold.ttf" />
          <link rel="prefetch" href="/static/fonts/Roboto/Roboto-Italic.ttf" />
          <link
            rel="prefetch"
            href="/static/fonts/Crimson_Text/CrimsonText-Regular.ttf"
          />
          <link
            rel="prefetch"
            href="/static/fonts/Crimson_Text/CrimsonText-Bold.ttf"
          />
          <link
            rel="prefetch"
            href="/static/fonts/Crimson_Text/CrimsonText-Italic.ttf"
          />
          <link
            rel="prefetch"
            href="/static/fonts/Source_Serif_Pro/SourceSerifPro-Regular.ttf"
          />
          <link
            rel="prefetch"
            href="/static/fonts/Source_Serif_Pro/SourceSerifPro-Bold.ttf"
          />
          <link
            rel="prefetch"
            href="/static/fonts/Source_Serif_Pro/SourceSerifPro-Italic.ttf"
          />
          <link rel="prefetch" href="/static/fonts/SFMono/SFMonoRegular.otf" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <script dangerouslySetInnerHTML={{ __html: setUserPreferences }} />
        </body>
      </Html>
    )
  }
}
