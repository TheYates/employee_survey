-- Check current schema first
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'survey_responses'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add question_key column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'survey_responses' AND column_name = 'question_key') THEN
        ALTER TABLE survey_responses ADD COLUMN question_key VARCHAR(100) NOT NULL DEFAULT '';
    END IF;
    
    -- Add question_text column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'survey_responses' AND column_name = 'question_text') THEN
        ALTER TABLE survey_responses ADD COLUMN question_text TEXT NOT NULL DEFAULT '';
    END IF;
    
    -- Add response_value column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'survey_responses' AND column_name = 'response_value') THEN
        ALTER TABLE survey_responses ADD COLUMN response_value TEXT NOT NULL DEFAULT '';
    END IF;
    
    -- Add section column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'survey_responses' AND column_name = 'section') THEN
        ALTER TABLE survey_responses ADD COLUMN section VARCHAR(100) NOT NULL DEFAULT '';
    END IF;
    
    -- Add session_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'survey_responses' AND column_name = 'session_id') THEN
        ALTER TABLE survey_responses ADD COLUMN session_id VARCHAR(255) NOT NULL DEFAULT '';
    END IF;
    
    -- Add survey_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'survey_responses' AND column_name = 'survey_id') THEN
        ALTER TABLE survey_responses ADD COLUMN survey_id INTEGER;
        -- Add foreign key constraint
        ALTER TABLE survey_responses ADD CONSTRAINT fk_survey_id 
        FOREIGN KEY (survey_id) REFERENCES surveys(id);
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_session_id ON survey_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_question_key ON survey_responses(question_key);
CREATE INDEX IF NOT EXISTS idx_survey_responses_section ON survey_responses(section);

-- Verify the final schema
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'survey_responses'
ORDER BY ordinal_position;
