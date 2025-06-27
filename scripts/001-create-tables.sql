-- Create surveys table to track different survey instances
CREATE TABLE IF NOT EXISTS surveys (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create survey_responses table to store individual responses
CREATE TABLE IF NOT EXISTS survey_responses (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES surveys(id),
    session_id VARCHAR(255) NOT NULL, -- To group responses from same user
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
ON CONFLICT DO NOTHING;
