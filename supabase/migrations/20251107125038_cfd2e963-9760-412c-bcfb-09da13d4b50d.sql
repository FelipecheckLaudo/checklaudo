-- Add modalidade column to vistorias table
ALTER TABLE vistorias 
ADD COLUMN modalidade text NOT NULL DEFAULT 'INTERNO';