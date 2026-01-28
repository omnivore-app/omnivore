-- Search for partial matches to find redirected URLs
.mode column
.headers on

ATTACH DATABASE 'url-id-mapping.sqlite' AS mapping;

-- Search for potential matches
SELECT
  url,
  title,
  id
FROM mapping.item_mapping
WHERE
  url LIKE '%danswer%'
  OR url LIKE '%segment.com%'
  OR url LIKE '%svgl%'
  OR url LIKE '%hyperledger%'
  OR title LIKE '%danswer%'
  OR title LIKE '%Segment%'
  OR title LIKE '%Svgl%'
  OR title LIKE '%SVG%'
  OR title LIKE '%Hyperledger%'
ORDER BY url
LIMIT 20;