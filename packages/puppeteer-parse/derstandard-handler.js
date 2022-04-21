/* eslint-disable no-undef */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

exports.derstandardHandler = {
  shouldPrehandle: (url, env) => {
    const u = new URL(url);
    return u.hostname === 'www.derstandard.at';
  },

  prehandle: async (url, env) => {
    const response = await axios.get(url, {
      // set cookie to give consent to get the article
      headers: {
        'cookie': `_sp_v1_uid=1:334:c7f49ff8-9705-4d54-a688-129a9a70517a; _sp_v1_ss=1:H4sIAAAAAAAAAItWqo5RKimOUbLKK83J0YlRSkVil4AlqmtrlXSGk7JoYtTHkmIQiJEHYhjg1ofbwFgAuNVQ-YUBAAA%3D; _sp_v1_csv=null; _sp_v1_lt=1:; tcfs=1; DSGVO_ZUSAGE_V1=true; consentUUID=2bacb9c1-1e80-4be0-9f7b-ee987cf4e7b0_6; _sp_v1_opt=1:login|true:last_id|11:; MGUID=GUID=f30dae9f-18d9-499c-a920-151a91be804e&Timestamp=2022-04-21T07:20:13&DetectedVersion=&Version=&BIV=2&Hash=1D372ED3D60656FC256E93DD0CFAE9AD; BIG=1804afe2ed0cd2b2210ff0db2ee; _gid=GA1.2.14587007.1650525614; MGUIDBAK=GUID=f30dae9f-18d9-499c-a920-151a91be804e&Timestamp=2022-04-21T07:20:13&DetectedVersion=&Version=&BIV=2&Hash=1D372ED3D60656FC256E93DD0CFAE9AD; BIGBAK=1804afe2ed0cd2b2210ff0db2ee; __pnahc=0; _sp_v1_consent=1!1:1:1:0:0:0; cX_P=l28oc2ye75c6pi4n; __pat=7200000; cX_S=l28oc393h54i6gpm; axd=4291987354807643906; cX_G=cx%3A2c9niv6wd23on27t9awkhyv6uz%3A2of6lmiznhdge; tis=EP277%3A3147; _autuserid2=7052955922085181593; __gads=ID=9819730ca6361c17:T=1650525625:S=ALNI_MaO2Zj7O-w6JsUQbtxpgLPnd_7bZg; __gpi=UID=000004f4550da5d5:T=1650525625:RT=1650525625:S=ALNI_MaUoIXaD1Z3BNlnPws7t0kd1oa4OA; ioam2018=000157a117fb1fb40626105ad:1678087214284:1650525614284:.derstandard.at:4:at_w_atderstand:Diverses/Diverses/Diverses:noevent:1650525951505:l80ahl; __pvi=%7B%22id%22%3A%22v-l28ojb188oe0ghnf%22%2C%22domain%22%3A%22.derstandard.at%22%2C%22time%22%3A1650525951644%7D; _ga=GA1.2.1544124715.1650525614; __tbc=%7Bkpex%7D9vMbwpKnXdfPvt3hIo3N0kR_-7pl06YroFU-v-UloaukzLrJ-miJdeiCinsTbZEB; xbc=%7Bkpex%7DbxFEfgbSvwbfv8YnCimEtTuJpmGYVf8UW12UeOAO63GJryD-ME0nDx-r9i_qgMqv7NHJ3hVKzwYRhEmNYvxnRRf5WojHOkcJwNTr23mjxl0aQulw0EYTN6Mi7SXABw3FzOpOMIvVljoD7kNrtYlcjx7bkHMBSCiyE5qHjkZDD55brW7_aRgCNWWwphwIoD16g6599ZPp5te8tJYdup_biPFb5k3COaNtPP9tsdBe6YknbeAE4Vyjarz1zVoX8N7_rc70n7kTcMDm3xjKEz2MvpDTvP3Mr-U9oqEdDLFqlAGr_DSqtbLKr1Vvu-so_A1aWHYnThDfVYvLt3qGG8-rFW1tTf9wiEGg8GEqHWrtMwM; cto_bundle=xK_MS19OZ1ZtdzZNZ0k1SEp6aDJvaDVRamtzJTJCc01UNzF5ckEybjdzbEV6V2VVQzF2UzJRdTNnZVlLQiUyRnRGRjBUazZIMWd5TGp2QTklMkI2T1klMkJ4QUpsVlhyV1JIRU4lMkZjc2d0RVJEYWtpMUhiVklRYW1Tbk1NJTJGRCUyQkc3THl3ajJ1ZnpoR3NYYkFZQXF0JTJGdVlRYU5tZ1klMkJtTHlBRmhGaE1uQVB5JTJGM09qVWh1dTlmcUU0M2NHTDc4NGR4JTJCJTJGdVRHUDRmZ3plMUVndnRIR3Y4dGRGZWs1VWg5MEJVSnVnJTNEJTNE; _ga_TQ3BNDRZZ9=GS1.1.1650525614.1.1.1650525955.51; privacyWallReferrer=null; _sp_v1_data=2:396765:1650525575:0:6:0:6:0:0:_:-1`,
      },
    });
    const content = response.data;

    const dom = new JSDOM(content)
    const titleElement = dom.window.document.querySelector('.article-title')
    titleElement?.remove()

    return { content: dom.window.document.body.outerHTML, title: titleElement?.textContent };
  }
}
