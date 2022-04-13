/* eslint-disable @next/next/no-img-element */
import { Box, HStack } from '../../components/elements/LayoutPrimitives'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import Link from 'next/link'

export default function Labels(): JSX.Element {
  return (
    <PrimaryLayout
      pageMetaDataProps={{
        title: 'Labels',
        path: '/help/labels',
      }}
      pageTestId="help-labels-tag"
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
        <h1>Organize your Omnivore library with labels</h1>
        <hr />
        <h2>Introduction</h2>
        <p>
          Labels allow you to group and search for content in Omnivore. A saved page
          can have multiple labels and search results can be filtered by label.
        </p>
        <h2>Adding labels to a page on iOS</h2>
        <p>
          On iOS you add and remove labels from a page using the Assign Labels modal.
        </p>  
        <p>
          You can open the Assign Labels modal from the home view or the reader view.
          In the home view long press on an item and choose Edit Labels from the dropdowm
          menu. In the reader view use the top right menu button.
        </p>
        <h2>Adding labels to a page on the web</h2>
        <p>
          On the web you add and remove labels from a page using the Assign Labels dropdown
          or modal depending on your screen size. For larger monitors you will see the Labels
          button on the left hand side of the reader view. For smaller monitors you will see
          the labels dropdown at the top of your screen.
        </p>
        <p>
          You can also use keyboard commands to open the assign labels modal. On the reader
          view tap the <code>l</code> key. Once open you can use the up/down arrow keys, or the
          tab key to navigate the available labels, and the Enter key to toggle a label.
        </p>
        <h2>Searching by label on iOS</h2>
        <p>
          On iOS you can use the Labels search chip to search for labels. This will open a modal
          allowing you to assign multiple labels to your search. This will become an <code>OR </code>
          search, meaning if you add multiple labels to your search, pages that have any of the
          labels will be returned.
        </p>
        <h2>Searching by label with Advanced Search</h2>
        <p>
          Omnivore's advanced search syntax supports searching for multiple labels using
          <code>AND</code> and <code>OR</code> clauses. You can also negate a label search
          to find all pages that do not have a certain label.
        </p>
        <p>Some examples:</p>
        <ul>
          <li><code>-label:Newsletter</code> finds all pages that do not have the label <code>Newsletter</code></li>
          <li><code>label:Cooking,Fitness</code> finds all your pages with either the <code>Cooking</code> or <code>Fitness</code> labels</li>
          <li><code>label:Newsletter label:Surfing</code> finds all pages with both the <code>Newsletter</code> and <code>Surfing</code> labels</li>
          <li><code>label:Coding -label:Newsletter</code> finds all pages with the <code>Coding</code> label that do not have the <code>Newsletter</code> label</li>
        </ul>
        
        <h2>Editing your list of labels</h2>
        <p>
          The <Link href="/settings/labels"><a>labels</a></Link> page allows you to
          edit all of your labels. From here you can create new labels, delete existing
          labels, or modify the color and description of a label.
        </p>
      </Box>
      <Box css={{ height: '120px' }} />
    </PrimaryLayout>
  )
}
