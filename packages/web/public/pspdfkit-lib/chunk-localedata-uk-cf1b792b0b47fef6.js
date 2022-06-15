/*!
 * PSPDFKit for Web 2022.2.3 (https://pspdfkit.com/web)
 *
 * Copyright (c) 2016-2022 PSPDFKit GmbH. All rights reserved.
 *
 * THIS SOURCE CODE AND ANY ACCOMPANYING DOCUMENTATION ARE PROTECTED BY INTERNATIONAL COPYRIGHT LAW
 * AND MAY NOT BE RESOLD OR REDISTRIBUTED. USAGE IS BOUND TO THE PSPDFKIT LICENSE AGREEMENT.
 * UNAUTHORIZED REPRODUCTION OR DISTRIBUTION IS SUBJECT TO CIVIL AND CRIMINAL PENALTIES.
 * This notice may not be removed from this file.
 *
 * PSPDFKit uses several open source third-party components: https://pspdfkit.com/acknowledgements/web/
 */
(self.webpackChunkPSPDFKit=self.webpackChunkPSPDFKit||[]).push([[1843],{61448:function(){Intl.PluralRules&&"function"==typeof Intl.PluralRules.__addLocaleData&&Intl.PluralRules.__addLocaleData({data:{uk:{categories:{cardinal:["one","few","many","other"],ordinal:["few","other"]},fn:function(e,a){var l=String(e).split("."),n=l[0],t=!l[1],u=Number(l[0])==e,i=u&&l[0].slice(-1),o=u&&l[0].slice(-2),r=n.slice(-1),c=n.slice(-2);return a?3==i&&13!=o?"few":"other":t&&1==r&&11!=c?"one":t&&r>=2&&r<=4&&(c<12||c>14)?"few":t&&0==r||t&&r>=5&&r<=9||t&&c>=11&&c<=14?"many":"other"}}},availableLocales:["uk"]})}}]);