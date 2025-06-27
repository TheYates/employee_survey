-- First, let's check what tables exist
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('surveys', 'survey_responses')
ORDER BY table_name, ordinal_position;

-- Drop existing tables if they have wrong schema (BE CAREFUL - this deletes data!)
-- Uncomment these lines only if you want to start fresh:
-- DROP TABLE IF EXISTS survey_responses CASCADE;
-- DROP TABLE IF EXISTS surveys CASCADE;

-- Create the correct schema
CREATE TABLE IF NOT EXISTS surveys (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS survey_responses (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES surveys(id),
    session_id VARCHAR(255) NOT NULL,
    question_key VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    response_value TEXT NOT NULL,
    section VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_session_id ON survey_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_question_key ON survey_responses(question_key);
CREATE INDEX IF NOT EXISTS idx_survey_responses_section ON survey_responses(section);

-- Insert default survey
INSERT INTO surveys (title, description) 
VALUES ('AGAHF Employee Pulse Survey', 'Employee satisfaction and engagement survey for AGAHF')
ON CONFLICT (title) DO NOTHING;

-- Verify the schema was created correctly
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name IN ('surveys', 'survey_responses')
ORDER BY table_name, ordinal_position;
