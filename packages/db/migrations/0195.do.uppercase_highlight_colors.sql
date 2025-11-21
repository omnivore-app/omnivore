-- Type: DO
-- Name: uppercase_highlight_colors
-- Description: Convert highlight_color enum from lowercase to uppercase for consistency with TypeScript/GraphQL

BEGIN;

-- 1) Create new enum type with uppercase values
CREATE TYPE omnivore.highlight_color_new AS ENUM ('YELLOW', 'RED', 'GREEN', 'BLUE');

-- 2) Drop the default value temporarily (required for type conversion)
ALTER TABLE omnivore.highlight ALTER COLUMN color DROP DEFAULT;

-- 3) Convert existing data to new enum type with uppercase values
ALTER TABLE omnivore.highlight
ALTER COLUMN color TYPE omnivore.highlight_color_new USING CASE
    WHEN color::text = 'yellow' THEN 'YELLOW'::omnivore.highlight_color_new
    WHEN color::text = 'red' THEN 'RED'::omnivore.highlight_color_new
    WHEN color::text = 'green' THEN 'GREEN'::omnivore.highlight_color_new
    WHEN color::text = 'blue' THEN 'BLUE'::omnivore.highlight_color_new
    ELSE 'YELLOW'::omnivore.highlight_color_new
END;

-- 4) Set new default value to uppercase
ALTER TABLE omnivore.highlight
ALTER COLUMN color
SET DEFAULT 'YELLOW'::omnivore.highlight_color_new;

-- 5) Drop old enum type
DROP TYPE omnivore.highlight_color;

-- 6) Rename new enum type to original name
ALTER TYPE omnivore.highlight_color_new RENAME TO highlight_color;

COMMIT;