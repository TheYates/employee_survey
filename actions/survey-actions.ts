"use server";

import {
  getDefaultSurvey,
  saveSurveyResponse,
  type SurveyResponse,
} from "@/lib/database";
import { randomUUID } from "crypto";

export interface SurveyData {
  consent: string;
  roleHappiness: string;
  recommendCompany: string;
  motivated: string;
  contributionsValued: string;
  learningOpportunities: string;
  comfortableWithManager: string;
  belongsWithPeers: string;
  hasResources: string;
  wellBeing: string;
  wellnessResources: string;
  stressLevel: string;
  teamCommunication: string;
  teamWorksWell: string;
  teamSupport: string;
  careerOpportunities: string;
  trainingEffectiveness: string;
  recognitionForAchievements: string;
  companyCulture: string;
  senseOfBelonging: string;
  valuesReflected: string;
  leadershipCommunication: string;
  leadershipApproachable: string;
  trustLeadership: string;
  initiativesSatisfaction: string;
  knowWhereToGoForQuestions: string;
  knowSurveyConsultation: string;
  previousSurveyChanges: string;
  suggestions: string;
  declineReason: string;
}

const questionMappings = {
  // Consent
  consent: {
    text: "Do you want to continue with the survey?",
    section: "consent",
  },
  declineReason: {
    text: "Reasons you can't complete the survey",
    section: "consent",
  },

  // Overall Engagement
  roleHappiness: {
    text: "On a scale of 1 to 5, how happy are you with your current role?",
    section: "overall_engagement",
  },
  recommendCompany: {
    text: "On a scale of 1 to 5, how likely are you to recommend our company as a great place to work?",
    section: "overall_engagement",
  },
  motivated: {
    text: "Do you feel motivated to perform your best work?",
    section: "overall_engagement",
  },
  contributionsValued: {
    text: "Do you believe your contributions are valued?",
    section: "overall_engagement",
  },

  // Work Experience
  learningOpportunities: {
    text: "On a scale of 1 to 5, how satisfied are you with the opportunities to learn and grow in your role?",
    section: "work_experience",
  },
  comfortableWithManager: {
    text: "I feel comfortable sharing my opinion with my manager, even if it differs from their opinion",
    section: "work_experience",
  },
  belongsWithPeers: {
    text: "I feel that I belong among my peers and colleagues",
    section: "work_experience",
  },
  hasResources: {
    text: "I have all the resources I need to perform well and be successful in my role",
    section: "work_experience",
  },

  // Wellness
  wellBeing: {
    text: "How would you rate your overall well-being?",
    section: "wellness",
  },
  wellnessResources: {
    text: "Do you feel the company provides adequate wellness resources?",
    section: "wellness",
  },
  stressLevel: {
    text: "How often do you feel stressed or overwhelmed at work?",
    section: "wellness",
  },

  // Team Dynamics
  teamCommunication: {
    text: "How effective is communication within your team?",
    section: "team_dynamics",
  },
  teamWorksWell: {
    text: "Do you feel your team works well together?",
    section: "team_dynamics",
  },
  teamSupport: {
    text: "How supported do you feel by your team members?",
    section: "team_dynamics",
  },

  // Career Development
  careerOpportunities: {
    text: "Do you feel you have opportunities to advance your career here?",
    section: "career_development",
  },
  trainingEffectiveness: {
    text: "How effective are the training programs provided?",
    section: "career_development",
  },
  recognitionForAchievements: {
    text: "Do you feel recognized for your achievements?",
    section: "career_development",
  },

  // Culture
  companyCulture: {
    text: "How would you describe the company's culture?",
    section: "culture",
  },
  senseOfBelonging: {
    text: "Do you feel a sense of belonging at work?",
    section: "culture",
  },
  valuesReflected: {
    text: "Does the company's values reflect in your daily work experience?",
    section: "culture",
  },

  // Leadership
  leadershipCommunication: {
    text: "Do you feel leadership communicates effectively?",
    section: "leadership",
  },
  leadershipApproachable: {
    text: "How approachable is your manager or senior leadership?",
    section: "leadership",
  },
  trustLeadership: {
    text: "Do you trust the decisions made by leadership?",
    section: "leadership",
  },

  // Initiatives
  initiativesSatisfaction: {
    text: "On a scale of 1 to 5, how satisfied are you with our QR code survey, AGAHF social media visibility, E-Ticketing, CT scan machine, ulcer clinic and CCTV cameras?",
    section: "initiatives",
  },
  knowWhereToGoForQuestions: {
    text: "I know who or where to go with questions about our E-Ticketing, AGAHF social media visibility, CCTV footage, QR code survey?",
    section: "initiatives",
  },

  // Previous Survey
  knowSurveyConsultation: {
    text: "I know where I can consult for the employee pulse survey",
    section: "previous_survey",
  },
  previousSurveyChanges: {
    text: "On a scale of 1 to 5, how satisfied are you with the changes that have been made based on the results from our previous or current employee pulse survey?",
    section: "previous_survey",
  },

  // Suggestions
  suggestions: {
    text: "What ideas or suggestions do you have for us to make our company an even better place to work?",
    section: "suggestions",
  },
};

export async function submitSurvey(
  surveyData: SurveyData
): Promise<{ success: boolean; message: string }> {
  try {
    const survey = await getDefaultSurvey();
    const sessionId = randomUUID();

    // Convert survey data to horizontal database format
    const response: Omit<SurveyResponse, "id" | "created_at"> = {
      survey_id: survey.id,
      session_id: sessionId,

      // Consent
      consent: surveyData.consent || undefined,
      decline_reason: surveyData.declineReason || undefined,

      // Overall Engagement
      role_happiness: surveyData.roleHappiness
        ? parseInt(surveyData.roleHappiness)
        : undefined,
      recommend_company: surveyData.recommendCompany
        ? parseInt(surveyData.recommendCompany)
        : undefined,
      motivated: surveyData.motivated
        ? parseInt(surveyData.motivated)
        : undefined,
      contributions_valued: surveyData.contributionsValued
        ? parseInt(surveyData.contributionsValued)
        : undefined,

      // Work Experience
      learning_opportunities: surveyData.learningOpportunities
        ? parseInt(surveyData.learningOpportunities)
        : undefined,
      comfortable_with_manager: surveyData.comfortableWithManager
        ? parseInt(surveyData.comfortableWithManager)
        : undefined,
      belongs_with_peers: surveyData.belongsWithPeers
        ? parseInt(surveyData.belongsWithPeers)
        : undefined,
      has_resources: surveyData.hasResources
        ? parseInt(surveyData.hasResources)
        : undefined,

      // Wellness
      well_being: surveyData.wellBeing
        ? parseInt(surveyData.wellBeing)
        : undefined,
      wellness_resources: surveyData.wellnessResources
        ? parseInt(surveyData.wellnessResources)
        : undefined,
      stress_level: surveyData.stressLevel
        ? parseInt(surveyData.stressLevel)
        : undefined,

      // Team Dynamics
      team_communication: surveyData.teamCommunication
        ? parseInt(surveyData.teamCommunication)
        : undefined,
      team_works_well: surveyData.teamWorksWell
        ? parseInt(surveyData.teamWorksWell)
        : undefined,
      team_support: surveyData.teamSupport
        ? parseInt(surveyData.teamSupport)
        : undefined,

      // Career Development
      career_opportunities: surveyData.careerOpportunities
        ? parseInt(surveyData.careerOpportunities)
        : undefined,
      training_effectiveness: surveyData.trainingEffectiveness
        ? parseInt(surveyData.trainingEffectiveness)
        : undefined,
      recognition_for_achievements: surveyData.recognitionForAchievements
        ? parseInt(surveyData.recognitionForAchievements)
        : undefined,

      // Culture
      company_culture: surveyData.companyCulture
        ? parseInt(surveyData.companyCulture)
        : undefined,
      sense_of_belonging: surveyData.senseOfBelonging
        ? parseInt(surveyData.senseOfBelonging)
        : undefined,
      values_reflected: surveyData.valuesReflected
        ? parseInt(surveyData.valuesReflected)
        : undefined,

      // Leadership
      leadership_communication: surveyData.leadershipCommunication
        ? parseInt(surveyData.leadershipCommunication)
        : undefined,
      leadership_approachable: surveyData.leadershipApproachable
        ? parseInt(surveyData.leadershipApproachable)
        : undefined,
      trust_leadership: surveyData.trustLeadership
        ? parseInt(surveyData.trustLeadership)
        : undefined,

      // Initiatives
      initiatives_satisfaction: surveyData.initiativesSatisfaction
        ? parseInt(surveyData.initiativesSatisfaction)
        : undefined,
      know_where_to_go_for_questions: surveyData.knowWhereToGoForQuestions
        ? parseInt(surveyData.knowWhereToGoForQuestions)
        : undefined,

      // Previous Survey
      know_survey_consultation: surveyData.knowSurveyConsultation
        ? parseInt(surveyData.knowSurveyConsultation)
        : undefined,
      previous_survey_changes: surveyData.previousSurveyChanges
        ? parseInt(surveyData.previousSurveyChanges)
        : undefined,

      // Suggestions
      suggestions: surveyData.suggestions || undefined,

      // Mark as complete
      is_complete: true,
    };

    await saveSurveyResponse(response);

    return {
      success: true,
      message: "Survey submitted successfully!",
    };
  } catch (error) {
    console.error("Error submitting survey:", error);
    return {
      success: false,
      message: "Failed to submit survey. Please try again.",
    };
  }
}
