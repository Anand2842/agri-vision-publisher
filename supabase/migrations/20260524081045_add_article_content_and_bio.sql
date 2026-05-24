ALTER TABLE articles
ADD COLUMN IF NOT EXISTS content text,
ADD COLUMN IF NOT EXISTS author_bio text;
