"use server"

import { sql } from "@/lib/database"

export async function exportSurveyData(
  format: "csv" | "json" = "csv",
  filters?: {
    startDate?: string
    endDate?: string
    section?: string
  },
) {
  try {
    let query = `
      SELECT 
        sr.session_id,
        sr.question_key,
        sr.question_text,
        sr.response_value,
        sr.section,
        sr.created_at,
        s.title as survey_title
      FROM survey_responses sr
      JOIN surveys s ON sr.survey_id = s.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    if (filters?.startDate) {
      query += ` AND sr.created_at >= $${paramIndex}`
      params.push(filters.startDate)
      paramIndex++
    }

    if (filters?.endDate) {
      query += ` AND sr.created_at <= $${paramIndex}`
      params.push(filters.endDate)
      paramIndex++
    }

    if (filters?.section) {
      query += ` AND sr.section = $${paramIndex}`
      params.push(filters.section)
      paramIndex++
    }

    query += ` ORDER BY sr.created_at DESC, sr.session_id, sr.question_key`

    const responses = await sql.unsafe(query, params)

    if (format === "csv") {
      // Convert to CSV format
      const headers = [
        "Session ID",
        "Question Key",
        "Question Text",
        "Response",
        "Section",
        "Submitted At",
        "Survey Title",
      ]
      const csvRows = [headers.join(",")]

      responses.forEach((row: any) => {
        const csvRow = [
          row.session_id,
          row.question_key,
          `"${row.question_text.replace(/"/g, '""')}"`,
          row.response_value,
          row.section,
          new Date(row.created_at).toISOString(),
          `"${row.survey_title.replace(/"/g, '""')}"`,
        ]
        csvRows.push(csvRow.join(","))
      })

      return {
        success: true,
        data: csvRows.join("\n"),
        filename: `survey-responses-${new Date().toISOString().split("T")[0]}.csv`,
        contentType: "text/csv",
      }
    } else {
      // Return JSON format
      return {
        success: true,
        data: JSON.stringify(responses, null, 2),
        filename: `survey-responses-${new Date().toISOString().split("T")[0]}.json`,
        contentType: "application/json",
      }
    }
  } catch (error) {
    console.error("Error exporting survey data:", error)
    return {
      success: false,
      error: "Failed to export survey data",
    }
  }
}

export async function exportAnalyticsSummary() {
  try {
    const summaryQuery = `
      WITH response_stats AS (
        SELECT 
          section,
          question_key,
          question_text,
          response_value,
          COUNT(*) as response_count,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY question_key), 2) as percentage
        FROM survey_responses
        GROUP BY section, question_key, question_text, response_value
      ),
      section_stats AS (
        SELECT 
          section,
          COUNT(DISTINCT session_id) as unique_respondents,
          COUNT(*) as total_responses,
          ROUND(AVG(CASE WHEN response_value::text ~ '^[0-9]+$' THEN response_value::integer ELSE NULL END), 2) as avg_rating
        FROM survey_responses
        GROUP BY section
      )
      SELECT 
        rs.*,
        ss.unique_respondents,
        ss.total_responses as section_total_responses,
        ss.avg_rating as section_avg_rating
      FROM response_stats rs
      JOIN section_stats ss ON rs.section = ss.section
      ORDER BY rs.section, rs.question_key, rs.response_value
    `

    const summaryData = await sql.unsafe(summaryQuery)

    const csvHeaders = [
      "Section",
      "Question Key",
      "Question Text",
      "Response Value",
      "Response Count",
      "Percentage",
      "Section Unique Respondents",
      "Section Total Responses",
      "Section Average Rating",
    ]

    const csvRows = [csvHeaders.join(",")]

    summaryData.forEach((row: any) => {
      const csvRow = [
        row.section,
        row.question_key,
        `"${row.question_text.replace(/"/g, '""')}"`,
        row.response_value,
        row.response_count,
        row.percentage,
        row.unique_respondents,
        row.section_total_responses,
        row.section_avg_rating || "N/A",
      ]
      csvRows.push(csvRow.join(","))
    })

    return {
      success: true,
      data: csvRows.join("\n"),
      filename: `survey-analytics-summary-${new Date().toISOString().split("T")[0]}.csv`,
      contentType: "text/csv",
    }
  } catch (error) {
    console.error("Error exporting analytics summary:", error)
    return {
      success: false,
      error: "Failed to export analytics summary",
    }
  }
}
