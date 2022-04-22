/* eslint-disable @next/next/no-img-element */
import { Box, HStack, SpanBox } from '../../components/elements/LayoutPrimitives'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Button } from '../../components/elements/Button'
import Link from 'next/link'
import { Copy, Plus } from 'phosphor-react'
import { theme } from '../../components/tokens/stitches.config'

export default function Search(): JSX.Element {
  return (
    <PrimaryLayout
      pageMetaDataProps={{
        title: 'Search',
        path: '/help/search',
      }}
      pageTestId="help-search-tag"
    >
      <Box
        css={{
          m: '42px',
          maxWidth: '640px',
          color: '$grayText',
          img: {
            maxWidth: '85%',
          },
          '@smDown': {
            m: '16px',
            maxWidth: '85%',
            alignSelf: 'center',
          },
        }}
      >
        <h1>Search</h1>
        <hr />
        <p>
          Omnivore uses search to filter items in your library. You can use simple 
          keyword search to find items or our advances search syntax.
        </p>
        <ul>
          <li><a href="#text">Searching for text</a></li>
          <li><a href="#label">Filtering by label</a></li>
          <li><a href="#in">Filtering by archive status</a></li>
          <li><a href="#is">Filtering by read state</a></li>
          <li><a href="#type">Filtering by type</a></li>
          <li><a href="#has">Finding highlights</a></li>
          <li><a href="#dates">Filtering by save/publish dates</a></li>
          <li><a href="#sort">Sorting</a></li>
        </ul>

        <h2 id="text">Searching for text</h2>
        <p>
          Omnivore will perform full text search across an article&apos;s content, title, description,
          and site by default. You can search for specific terms by quoting your terms. By default
          all results that match your search will be returned in the order they were saved. To change
          your search to relevance use the <code>sort:score</code> parameter.
        </p>
  
        <h2 id="label">Filtering by label</h2>
        <p>
          You can filter your search based on labels using AND and OR clauses.
          You can also negate a label search to find pages that do not have a certain label.
        </p>

        <p>Some examples:</p>

        <ul>
          <li>label:Newsletter finds all pages that have the label Newsletter</li>
          <li>label:Cooking,Fitness finds all your pages with either the Cooking or Fitness labels</li>
          <li>label:Newsletter label:Surfing finds all pages with both the Newsletter and Surfing labels</li>
          <li>label:Coding -label:News finds all pages with the Coding label that do not have the News label</li>
        </ul>

        <h2 id="in">Filtering by archive status</h2>
        <p>
          The <code>in:</code> filter is used to filter search by archive status.
          The options are:
        </p>

        <ul>
          <li><code>in:inbox</code> (the default): show unarchived items</li>
          <li><code>in:archive</code>: show archived items</li>
          <li><code>in:all</code>: Show all items regardless of archive state</li>
        </ul>

        <h2 id="is">Filtering by read state</h2>
        <p>
          The <code>is:</code> filter is used to filter search by read state. Note
          that in Omnivore &apos;read&apos; means fully read, not just opened.
        </p>
        <p>The <code>is:</code> filter options are:          </p>
        <ul>
          <li><code>is:read</code>: Show only items that are fully read</li>
          <li><code>is:unread</code> (the default): show unread items</li>
        </ul>

        <h2 id="type">Filtering by type</h2>
        <p>
          The <code>type:</code> filter is used to filter search by type.
        </p>
        <ul>
          <li><code>type:article</code>: Show only articles</li>
          <li><code>type:file</code> or <code>type:pdf</code>: Show only PDFs</li>
          <li><code>type:highlights</code>: Show your highlights</li>
        </ul>

        <h2 id="has">Finding highlights</h2>
        <p>
          You can find your highlights by using the <code>type:highlights</code> filter 
          or find saved items with highlights using the <code>has:highlights</code> filter.
        </p>

        <h2 id="dates">Filtering by save/publish dates</h2>
        <p>
          You can filter your searches based on the time they were saved or published using the
          <code>saved:</code> and <code>published:</code> filters. These filters take two dates
          to create a date range. The <code>*</code> wildcard will accept any date.
        </p>
        <p>For Example:</p>
        <ul>
          <li><code>saved:2022-04-21..*</code> All items saved since 2022-04-21</li>
          <li><code>published:2020-01-01..2022-02-02</code> All items published between 2020-01-01 and 2022-02-02</li>
          <li><code>published:*..2020-01-01</code> All items published before 2020-01-01</li>
        </ul>

        <h2 id="sort">Sorting</h2>
        <p>
          By default all search results in Omnivore are sorted by saved date. This puts the 
          most recently saved items at the top of your library. You can use sort options
          to change the library order:
        </p>
        <ul>
          <li><code>sort:saved</code>: Sort by saved date</li>
          <li><code>sort:updated</code>: Sort by time the item was updated, for example having a label or highlight added.</li>
          <li><code>sort:score</code>: Sort by query term relevance.</li>
        </ul>
      </Box>
      <Box css={{ height: '120px' }} />
    </PrimaryLayout>
  )
}
