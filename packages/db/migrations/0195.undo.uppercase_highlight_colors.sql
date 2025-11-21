-- Type: UNDO
-- Name: uppercase_highlight_colors
-- Description: Revert highlight_color enum from uppercase back to lowercase

BEGIN;

-- 1) Create enum type with lowercase values (original format)
CREATE TYPE omnivore.highlight_color_old AS ENUM ('yellow', 'red', 'green', 'blue');

-- 2) Drop the default value temporarily (required for type conversion)
ALTER TABLE omnivore.highlight ALTER COLUMN color DROP DEFAULT;

-- 3) Convert existing data back to lowercase enum values
ALTER TABLE omnivore.highlight
ALTER COLUMN color TYPE omnivore.highlight_color_old USING CASE
    WHEN color::text = 'YELLOW' THEN 'yellow'::omnivore.highlight_color_old
    WHEN color::text = 'RED' THEN 'red'::omnivore.highlight_color_old
    WHEN color::text = 'GREEN' THEN 'green'::omnivore.highlight_color_old
    WHEN color::text = 'BLUE' THEN 'blue'::omnivore.highlight_color_old
    ELSE 'yellow'::omnivore.highlight_color_old
END;

-- 4) Set default value back to lowercase
ALTER TABLE omnivore.highlight
ALTER COLUMN color
SET DEFAULT 'yellow'::omnivore.highlight_color_old;

-- 5) Drop uppercase enum type
DROP TYPE omnivore.highlight_color;

-- 6) Rename old enum type back to original name
ALTER TYPE omnivore.highlight_color_old RENAME TO highlight_color;

COMMIT;