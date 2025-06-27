import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const sql = neon(process.env.DATABASE_URL);

export interface SurveyResponse {
  id?: number;
  survey_id: number;
  session_id: string;

  // Consent
  consent?: string;
  decline_reason?: string;

  // Overall Engagement
  role_happiness?: number;
  recommend_company?: number;
  motivated?: number;
  contributions_valued?: number;

  // Work Experience
  learning_opportunities?: number;
  comfortable_with_manager?: number;
  belongs_with_peers?: number;
  has_resources?: number;

  // Wellness
  well_being?: number;
  wellness_resources?: number;
  stress_level?: number;

  // Team Dynamics
  team_communication?: number;
  team_works_well?: number;
  team_support?: number;

  // Career Development
  career_opportunities?: number;
  training_effectiveness?: number;
  recognition_for_achievements?: number;

  // Culture
  company_culture?: number;
  sense_of_belonging?: number;
  values_reflected?: number;

  // Leadership
  leadership_communication?: number;
  leadership_approachable?: number;
  trust_leadership?: number;

  // Initiatives
  initiatives_satisfaction?: number;
  know_where_to_go_for_questions?: number;

  // Previous Survey
  know_survey_consultation?: number;
  previous_survey_changes?: number;

  // Suggestions
  suggestions?: string;

  // Metadata
  created_at?: Date;
  completed_at?: Date;
  is_complete?: boolean;
}

export interface Survey {
  id: number;
  title: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

// Get or create default survey
export async function getDefaultSurvey(): Promise<Survey> {
  const surveys = await sql`
    SELECT * FROM surveys 
    WHERE title = 'AGAHF Employee Pulse Survey' 
    LIMIT 1
  `;

  if (surveys.length === 0) {
    const newSurvey = await sql`
      INSERT INTO surveys (title, description)
      VALUES ('AGAHF Employee Pulse Survey', 'Employee satisfaction and engagement survey for AGAHF')
      RETURNING *
    `;
    return newSurvey[0] as Survey;
  }

  return surveys[0] as Survey;
}

// Save survey response (horizontal structure - one row per complete survey)
export async function saveSurveyResponse(
  response: Omit<SurveyResponse, "id" | "created_at">
): Promise<void> {
  const {
    survey_id,
    session_id,
    consent,
    decline_reason,
    role_happiness,
    recommend_company,
    motivated,
    contributions_valued,
    learning_opportunities,
    comfortable_with_manager,
    belongs_with_peers,
    has_resources,
    well_being,
    wellness_resources,
    stress_level,
    team_communication,
    team_works_well,
    team_support,
    career_opportunities,
    training_effectiveness,
    recognition_for_achievements,
    company_culture,
    sense_of_belonging,
    values_reflected,
    leadership_communication,
    leadership_approachable,
    trust_leadership,
    initiatives_satisfaction,
    know_where_to_go_for_questions,
    know_survey_consultation,
    previous_survey_changes,
    suggestions,
    is_complete = true,
  } = response;

  await sql`
    INSERT INTO survey_responses (
      survey_id, session_id, consent, decline_reason,
      role_happiness, recommend_company, motivated, contributions_valued,
      learning_opportunities, comfortable_with_manager, belongs_with_peers, has_resources,
      well_being, wellness_resources, stress_level,
      team_communication, team_works_well, team_support,
      career_opportunities, training_effectiveness, recognition_for_achievements,
      company_culture, sense_of_belonging, values_reflected,
      leadership_communication, leadership_approachable, trust_leadership,
      initiatives_satisfaction, know_where_to_go_for_questions,
      know_survey_consultation, previous_survey_changes,
      suggestions, is_complete, completed_at
    ) VALUES (
      ${survey_id}, ${session_id}, ${consent}, ${decline_reason},
      ${role_happiness}, ${recommend_company}, ${motivated}, ${contributions_valued},
      ${learning_opportunities}, ${comfortable_with_manager}, ${belongs_with_peers}, ${has_resources},
      ${well_being}, ${wellness_resources}, ${stress_level},
      ${team_communication}, ${team_works_well}, ${team_support},
      ${career_opportunities}, ${training_effectiveness}, ${recognition_for_achievements},
      ${company_culture}, ${sense_of_belonging}, ${values_reflected},
      ${leadership_communication}, ${leadership_approachable}, ${trust_leadership},
      ${initiatives_satisfaction}, ${know_where_to_go_for_questions},
      ${know_survey_consultation}, ${previous_survey_changes},
      ${suggestions}, ${is_complete}, CURRENT_TIMESTAMP
    )
  `;
}

// Get analytics data for horizontal structure
export async function getAnalyticsData(surveyId: number) {
  // Get total responses count
  const totalResponsesResult = await sql`
    SELECT COUNT(*) as total
    FROM survey_responses
    WHERE survey_id = ${surveyId}
  `;

  const totalResponses = Number.parseInt(totalResponsesResult[0]?.total || "0");

  // Get all responses for analysis
  const responses = await sql`
    SELECT * FROM survey_responses
    WHERE survey_id = ${surveyId}
  `;

  // Define question mappings for analytics
  const questionMappings = {
    // Overall Engagement
    role_happiness: {
      text: "How happy are you with your current role?",
      section: "overall_engagement",
    },
    recommend_company: {
      text: "How likely are you to recommend our company?",
      section: "overall_engagement",
    },
    motivated: {
      text: "Do you feel motivated to perform your best work?",
      section: "overall_engagement",
    },
    contributions_valued: {
      text: "Do you believe your contributions are valued?",
      section: "overall_engagement",
    },

    // Work Experience
    learning_opportunities: {
      text: "Satisfaction with learning opportunities",
      section: "work_experience",
    },
    comfortable_with_manager: {
      text: "Comfortable sharing opinions with manager",
      section: "work_experience",
    },
    belongs_with_peers: {
      text: "Feel belonging among peers",
      section: "work_experience",
    },
    has_resources: {
      text: "Have resources needed for success",
      section: "work_experience",
    },

    // Wellness
    well_being: { text: "Overall well-being rating", section: "wellness" },
    wellness_resources: {
      text: "Company provides adequate wellness resources",
      section: "wellness",
    },
    stress_level: {
      text: "Frequency of stress/overwhelm at work",
      section: "wellness",
    },

    // Team Dynamics
    team_communication: {
      text: "Effectiveness of team communication",
      section: "team_dynamics",
    },
    team_works_well: {
      text: "Team works well together",
      section: "team_dynamics",
    },
    team_support: {
      text: "Support from team members",
      section: "team_dynamics",
    },

    // Career Development
    career_opportunities: {
      text: "Opportunities to advance career",
      section: "career_development",
    },
    training_effectiveness: {
      text: "Effectiveness of training programs",
      section: "career_development",
    },
    recognition_for_achievements: {
      text: "Recognition for achievements",
      section: "career_development",
    },

    // Culture
    company_culture: { text: "Company culture rating", section: "culture" },
    sense_of_belonging: {
      text: "Sense of belonging at work",
      section: "culture",
    },
    values_reflected: {
      text: "Company values reflected in daily work",
      section: "culture",
    },

    // Leadership
    leadership_communication: {
      text: "Leadership communicates effectively",
      section: "leadership",
    },
    leadership_approachable: {
      text: "Leadership approachability",
      section: "leadership",
    },
    trust_leadership: {
      text: "Trust in leadership decisions",
      section: "leadership",
    },

    // Initiatives
    initiatives_satisfaction: {
      text: "Satisfaction with company initiatives",
      section: "initiatives",
    },
    know_where_to_go_for_questions: {
      text: "Know where to go for questions",
      section: "initiatives",
    },

    // Previous Survey
    know_survey_consultation: {
      text: "Know where to consult for survey",
      section: "previous_survey",
    },
    previous_survey_changes: {
      text: "Satisfaction with previous survey changes",
      section: "previous_survey",
    },
  };

  // Group responses by section and question
  const sections: { [key: string]: any } = {};

  Object.entries(questionMappings).forEach(([questionKey, mapping]) => {
    if (!sections[mapping.section]) {
      sections[mapping.section] = {};
    }

    // Count responses for this question
    const questionResponses: { [key: string]: number } = {};
    let totalQuestionResponses = 0;

    responses.forEach((row: any) => {
      const value = row[questionKey];
      if (value !== null && value !== undefined && value !== "") {
        const stringValue = String(value);
        questionResponses[stringValue] =
          (questionResponses[stringValue] || 0) + 1;
        totalQuestionResponses++;
      }
    });

    if (totalQuestionResponses > 0) {
      sections[mapping.section][questionKey] = {
        question: mapping.text,
        type: "scale",
        totalResponses: totalQuestionResponses,
        responses: Object.entries(questionResponses)
          .map(([option, count]) => ({
            option,
            count,
            percentage: Number.parseFloat(
              ((count / totalQuestionResponses) * 100).toFixed(1)
            ),
          }))
          .sort((a, b) => Number(a.option) - Number(b.option)),
      };
    }
  });

  return {
    totalResponses,
    sections,
  };
}

// Get completion rate for horizontal structure
export async function getCompletionRate(surveyId: number): Promise<number> {
  const result = await sql`
    SELECT
      COUNT(*) as total_responses,
      COUNT(CASE WHEN is_complete = true THEN 1 END) as completed_responses
    FROM survey_responses
    WHERE survey_id = ${surveyId}
  `;

  const totalResponses = Number.parseInt(result[0]?.total_responses || "0");
  const completedResponses = Number.parseInt(
    result[0]?.completed_responses || "0"
  );

  if (totalResponses === 0) {
    return 0;
  }

  return Math.round((completedResponses / totalResponses) * 100 * 10) / 10; // Round to 1 decimal place
}

// Get average completion time for completed surveys
export async function getAverageCompletionTime(
  surveyId: number
): Promise<string> {
  const result = await sql`
    SELECT
      AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_seconds
    FROM survey_responses
    WHERE survey_id = ${surveyId}
      AND is_complete = true
      AND completed_at IS NOT NULL
      AND created_at IS NOT NULL
  `;

  const avgSeconds = Number.parseFloat(result[0]?.avg_seconds || "0");

  if (avgSeconds === 0) {
    return "0 minutes";
  }

  const minutes = Math.round((avgSeconds / 60) * 10) / 10; // Round to 1 decimal place
  return `${minutes} minutes`;
}
