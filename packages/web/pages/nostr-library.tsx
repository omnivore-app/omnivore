// packages/web/pages/nostr-library.tsx
import React from 'react';
import { NavigationLayout } from '../components/templates/NavigationLayout'; // Or PrimaryLayout, SettingsLayout depending on desired chrome
import { Box, VStack, HStack } from '../components/elements/LayoutPrimitives';
import { StyledText } from '../components/elements/StyledText';
import { Button } from '../components/elements/Button';
import { useGetNostrArticles, NostrArticle } from '../lib/networking/queries/useGetNostrArticles';
import { theme } from '../components/tokens/stitches.config';

const NostrArticleCard: React.FC<{ article: NostrArticle }> = ({ article }) => {
  return (
    <Box css={{
      border: `1px solid $grayText`,
      borderRadius: '8px',
      padding: '16px',
      mb: '16px',
      width: '100%',
      maxWidth: '700px',
    }}>
      <StyledText style="title" css={{ mb: '8px' }}>{article.title}</StyledText>
      <StyledText style="footnote" css={{ mb: '4px' }}>Nostr ID: {article.id}</StyledText>
      {article.omnivoreId && <StyledText style="footnote" css={{ mb: '4px' }}>Omnivore ID: {article.omnivoreId}</StyledText>}
      <StyledText style="footnote" css={{ mb: '4px' }}>URL: <a href={article.url} target="_blank" rel="noopener noreferrer">{article.url}</a></StyledText>
      <StyledText style="footnote" css={{ mb: '4px' }}>Published to Nostr: {new Date(article.publishedToNostrAt * 1000).toLocaleString()}</StyledText>
      <StyledText style="footnote" css={{ mb: '4px' }}>Privacy: {article.isPrivate ? 'Private' : 'Public'}</StyledText>
      {article.tags && article.tags.length > 0 && (
        <StyledText style="footnote" css={{ mb: '4px' }}>Tags: {article.tags.join(', ')}</StyledText>
      )}
      {/* Basic action buttons */}
      <HStack css={{mt: '10px', gap: '10px'}}>
        <Button size="xs" style="secondary" onClick={() => alert(`Full content for ${article.title} not displayed here yet.`)}>View Content (TBD)</Button>
        <Button size="xs" style="secondary" onClick={() => console.log('Article Data:', article)}>Log Data</Button>
      </HStack>
    </Box>
  );
};

export default function NostrLibraryPage(): JSX.Element {
  // For now, fetch with default filters (user's own kind 30000)
  const { data, isLoading, error, refetch } = useGetNostrArticles(
    { filterJson: {} }, // Empty filterJson will use defaults on backend (user's pubkey, kind 30000)
    { refetchOnWindowFocus: false }
  );

  let content;

  if (isLoading) {
    content = <StyledText>Loading your Nostr articles...</StyledText>;
  } else if (error) {
    content = <StyledText css={{color: '$error'}}>Error fetching Nostr articles: {(error as any).message}</StyledText>;
  } else if (data?.getNostrArticles.__typename === 'GetNostrArticlesError') {
    content = <StyledText css={{color: '$error'}}>Error: {data.getNostrArticles.message} (Codes: {data.getNostrArticles.errorCodes?.join(', ')})</StyledText>;
  } else if (data?.getNostrArticles.__typename === 'GetNostrArticlesSuccess') {
    const articles = data.getNostrArticles.edges?.map(edge => edge.node) || [];
    if (articles.length === 0) {
      content = <StyledText>No articles found in your Nostr library. Try publishing some first!</StyledText>;
    } else {
      content = (
        <VStack css={{width: '100%'}} alignment="center">
          {articles.map(article => <NostrArticleCard key={article.id} article={article} />)}
        </VStack>
      );
    }
  } else {
    content = <StyledText>No data.</StyledText>;
  }

  return (
    <NavigationLayout showNavMenu={true}>
      <VStack
        css={{ width: '100%', height: '100%', padding: '24px', gap: '25px' }}
        distribution="start"
        alignment="center"
      >
        <HStack css={{width: '100%', maxWidth: '700px', justifyContent: 'space-between', alignItems: 'center'}}>
          <StyledText style="fixedHeadline">Nostr Library</StyledText>
          <Button onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </HStack>
        {content}
      </VStack>
    </NavigationLayout>
  );
}
