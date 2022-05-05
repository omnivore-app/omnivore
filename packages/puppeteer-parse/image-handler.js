/* eslint-disable no-undef */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();


exports.imageHandler = {
  shouldPrehandle: (url, env) => {
    const IMAGE_URL_PATTERN =
      /(https?:\/\/.*\.(?:jpg|jpeg|png|webp))/i
    return IMAGE_URL_PATTERN.test(url.toString())
  },

  prehandle: async (url, env) => {
    const title = url.toString().split('/').pop();
    const content = `
      <html>
        <head>
          <title>${title}</title>
          <meta property="og:image" content="${url}" />
          <meta property="og:title" content="${title}" />
        </head>
        <body>
          <div>
            <!-- To avoid image being removed by readability-->
            Image:
            <br>
            <img src="${url}" alt="${title}">
          </div>
        </body>
      </html>`

    return { title, content };
  }
}
