import { OmnivoreArticle } from '../../../../../types/OmnivoreArticle'
import { slugify } from 'voca'
import { XMLParser } from 'fast-xml-parser'
import { JSDOM } from 'jsdom'
import { Observable } from 'rxjs'
import { fromArrayLike } from 'rxjs/internal/observable/innerFrom'
import { mapOrNull } from '../../../../utils/reactive'

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: true,
  ignoreDeclaration: false,
  ignorePiTags: false,
})

/**
 * EXAMPLE:
 *
 * <item>
 * <title>Netflix is opening physical stores in 2025 as marketing ploy</title>
 * <link>https://arstechnica.com/?p=1975884</link>
 * <comments>https://arstechnica.com/culture/2023/10/netflixs-new-physical-stores-could-include-squid-game-obstacle-course/#comments</comments>
 * <dc:creator>
 * <![CDATA[ Scharon Harding ]]>
 * </dc:creator>
 * <pubDate>Fri, 13 Oct 2023 15:44:35 +0000</pubDate>
 * <category>
 * <![CDATA[ Culture ]]>
 * </category>
 * <category>
 * <![CDATA[ Tech ]]>
 * </category>
 * <category>
 * <![CDATA[ Netflix ]]>
 * </category>
 * <category>
 * <![CDATA[ streaming ]]>
 * </category>
 * <guid isPermaLink="false">https://arstechnica.com/?p=1975884</guid>
 * <description>
 * <![CDATA[ "Netflix and chill" may take on new meaning. ]]>
 * </description>
 * <content:encoded>
 * <![CDATA[ <div id="rss-wrap"> <figure class="intro-image intro-left"> <img src="https://cdn.arstechnica.net/wp-content/uploads/2023/10/squid-game-800x400.jpg" alt="Screenshot from Squid Game trailer"> <p class="caption" style="font-size:0.8em"><a href="https://cdn.arstechnica.net/wp-content/uploads/2023/10/squid-game-scaled.jpg" class="enlarge-link" data-height="1280" data-width="2560">Enlarge</a> (credit: <a rel="nofollow" class="caption-link" href="https://www.youtube.com/watch?v=oqxAJKy0ii4">Netflix</a>)</p> </figure> <div><a name="page-1"></a></div> <p>"Netflix and chill" usually implies a cozy night in with a companion and no one else in your living room besides those on your TV screen. In 2025, the term could start taking on an opposite meaning, as Netflix opens physical stores with merchandise and activities inspired by its content.</p> <p>Netflix House will debut in two undetermined cities in the US before expanding globally, Josh Simon, Netflix VP of consumer products, told <a href="https://www.bloomberg.com/news/articles/2023-10-12/netflix-to-open-stores-where-fans-can-play-shop-and-eat-in-2025">Bloomberg </a>yesterday. Netflix House will be the streaming company's first permanent retail location and will seek to promote fandom around its original programming.</p> <p>Netflix didn't disclose many specifics about what customers will be able to do there beyond buying <em>Stranger Things</em> T-shirts (presumably) and other merch. By far the most exciting aspect teased is the potential for a real-life <em>Squid Game</em> obstacle course.</p></div><p><a href="https://arstechnica.com/?p=1975884#p3">Read 6 remaining paragraphs</a> | <a href="https://arstechnica.com/?p=1975884&comments=1">Comments</a></p> ]]>
 * </content:encoded>
 * <wfw:commentRss>https://arstechnica.com/culture/2023/10/netflixs-new-physical-stores-could-include-squid-game-obstacle-course/feed/</wfw:commentRss>
 * <slash:comments>35</slash:comments>
 * </item>
 */

export const convertArsTechnicasArticles = (
  articleXml: string,
): Observable<OmnivoreArticle> => {
  return fromArrayLike(parser.parse(articleXml).rss.channel.item).pipe(
    mapOrNull((article: any) => ({
      authors: article['dc:creator'],
      slug: slugify(article.link),
      url: article.link,
      title: article.title,
      description: article.description,
      image: new JSDOM(
        article['content:encoded'],
      )?.window?.document?.getElementsByTagName('img')[0]?.src,
      site: new URL(article.link).host,
      publishedAt: new Date(article.pubDate),
      type: 'rss',
    })),
  )
}
