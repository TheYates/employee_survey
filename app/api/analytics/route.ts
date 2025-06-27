import { NextResponse } from "next/server";
import {
  getAnalyticsData,
  getDefaultSurvey,
  getCompletionRate,
  getAverageCompletionTime,
} from "@/lib/database";

export async function GET() {
  try {
    const survey = await getDefaultSurvey();
    const analyticsData = await getAnalyticsData(survey.id);

    // Calculate real metrics from database
    const completionRate = await getCompletionRate(survey.id);
    const averageCompletionTime = await getAverageCompletionTime(survey.id);

    // Add missing properties to match SurveyData interface
    const response = {
      totalResponses: analyticsData.totalResponses,
      completionRate: Math.round(completionRate * 10) / 10, // Round to 1 decimal place
      averageCompletionTime: averageCompletionTime,
      // Response rate is hard to calculate without knowing total invited users, so we'll remove it
      sections: Object.entries(analyticsData.sections).map(
        ([sectionKey, questions]) => {
          const sectionTitles: { [key: string]: string } = {
            overall_engagement: "Overall Engagement",
            work_experience: "Work Experience",
            wellness: "Wellness",
            team_dynamics: "Team Dynamics",
            career_development: "Career Development",
            culture: "Culture",
            leadership: "Leadership",
            initiatives: "Initiatives/Projects",
            previous_survey: "Previous Survey",
            suggestions: "Suggestions",
            consent: "Consent",
          };

          return {
            title: sectionTitles[sectionKey] || sectionKey,
            questions: Object.values(questions as any),
          };
        }
      ),
      keyInsights: [
        {
          type: "positive",
          title: "Real-time Database Data",
          description: `Analytics generated from ${analyticsData.totalResponses} survey responses from the database.`,
        },
        {
          type: "positive",
          title: "Database Connected",
          description: "Successfully connected to Neon PostgreSQL database.",
        },
      ],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      {
        totalResponses: 0,
        completionRate: 0,
        averageCompletionTime: "0 minutes",
        sections: [],
        keyInsights: [
          {
            type: "concern",
            title: "Database Connection Issue",
            description:
              "Unable to fetch real data. Please check database connection.",
          },
        ],
      },
      { status: 500 }
    );
  }
}
