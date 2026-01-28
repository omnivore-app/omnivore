-- Check which items with labels from archive are missing in current mappings
.mode column
.headers on

ATTACH DATABASE 'url-id-mapping.sqlite' AS mapping;
ATTACH DATABASE '../self-hosting/archive-db/store.sqlite' AS archive;

-- Items with labels that couldn't be found
WITH labeled_items AS (
  SELECT DISTINCT
    li.ZPAGEURLSTRING as url,
    li.ZTITLE as title,
    GROUP_CONCAT(label.ZNAME, ', ') as labels
  FROM archive.ZLINKEDITEM li
  JOIN archive.Z_2LABELS l ON li.Z_PK = l.Z_2LINKEDITEMS
  JOIN archive.ZLINKEDITEMLABEL label ON l.Z_3LABELS1 = label.Z_PK
  WHERE li.ZPAGEURLSTRING IN (
    'https://github.com/danswer-ai/danswer',
    'https://segment.com/blog/rebuilding-our-infrastructure/',
    'https://svgl.vercel.app',
    'https://www.hyperledger.org'
  )
  GROUP BY li.ZPAGEURLSTRING, li.ZTITLE
)
SELECT
  li.url as original_url,
  li.title,
  li.labels,
  m.url as mapped_url,
  m.id as mapped_id
FROM labeled_items li
LEFT JOIN mapping.item_mapping m ON li.url = m.url
ORDER BY li.url;