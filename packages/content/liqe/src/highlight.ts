import {
  escapeRegexString,
} from './escapeRegexString';
import {
  internalFilter,
} from './internalFilter';
import type {
  LiqeQuery,
  Highlight,
  InternalHighlight,
} from './types';

type AggregatedHighlight = {
  keywords: string[],
  path: string,
};

export const highlight = <T extends Object>(
  ast: LiqeQuery,
  data: T,
): Highlight[] => {
  const highlights: InternalHighlight[] = [];

  internalFilter(
    ast,
    [data],
    false,
    [],
    highlights,
  );

  const aggregatedHighlights: AggregatedHighlight[] = [];

  for (const highlightNode of highlights) {
    let aggregatedHighlight = aggregatedHighlights.find((maybeTarget) => {
      return maybeTarget.path === highlightNode.path;
    });

    if (!aggregatedHighlight) {
      aggregatedHighlight = {
        keywords: [],
        path: highlightNode.path,
      };

      aggregatedHighlights.push(aggregatedHighlight);
    }

    if (highlightNode.keyword) {
      aggregatedHighlight.keywords.push(highlightNode.keyword);
    }
  }

  return aggregatedHighlights.map((aggregatedHighlight) => {
    if (aggregatedHighlight.keywords.length > 0) {
      return {
        path: aggregatedHighlight.path,
        query: new RegExp('(' + aggregatedHighlight.keywords.map((keyword) => {
          return escapeRegexString(keyword.trim());
        }).join('|') + ')'),
      };
    }

    return {
      path: aggregatedHighlight.path,
    };
  });
};
