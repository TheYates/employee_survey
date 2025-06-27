-- Drop existing tables to start fresh with horizontal design
DROP TABLE IF EXISTS survey_responses CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;

-- Create surveys table (unchanged)
CREATE TABLE surveys (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create horizontal survey_responses table with each question as its own column
CREATE TABLE survey_responses (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES surveys(id),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    
    -- Consent
    consent VARCHAR(10),
    decline_reason TEXT,
    
    -- Overall Engagement
    role_happiness INTEGER,
    recommend_company INTEGER,
    motivated INTEGER,
    contributions_valued INTEGER,
    
    -- Work Experience
    learning_opportunities INTEGER,
    comfortable_with_manager INTEGER,
    belongs_with_peers INTEGER,
    has_resources INTEGER,
    
    -- Wellness
    well_being INTEGER,
    wellness_resources INTEGER,
    stress_level INTEGER,
    
    -- Team Dynamics
    team_communication INTEGER,
    team_works_well INTEGER,
    team_support INTEGER,
    
    -- Career Development
    career_opportunities INTEGER,
    training_effectiveness INTEGER,
    recognition_for_achievements INTEGER,
    
    -- Culture
    company_culture INTEGER,
    sense_of_belonging INTEGER,
    values_reflected INTEGER,
    
    -- Leadership
    leadership_communication INTEGER,
    leadership_approachable INTEGER,
    trust_leadership INTEGER,
    
    -- Initiatives
    initiatives_satisfaction INTEGER,
    know_where_to_go_for_questions INTEGER,
    
    -- Previous Survey
    know_survey_consultation INTEGER,
    previous_survey_changes INTEGER,
    
    -- Suggestions
    suggestions TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    is_complete BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX idx_survey_responses_session_id ON survey_responses(session_id);
CREATE INDEX idx_survey_responses_created_at ON survey_responses(created_at);
CREATE INDEX idx_survey_responses_is_complete ON survey_responses(is_complete);

-- Insert default survey
INSERT INTO surveys (title, description) 
VALUES ('AGAHF Employee Pulse Survey', 'Employee satisfaction and engagement survey for AGAHF');

-- Verify the schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'survey_responses'
ORDER BY ordinal_position;
