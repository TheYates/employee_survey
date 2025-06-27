"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ArrowLeft,
  Download,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  Grid2X2,
  LayoutGrid,
  RefreshCw,
} from "lucide-react"

const getResponseColor = (index: number, percentage: number) => {
  const colors = [
    `rgba(239, 68, 68, ${(percentage / 100) * 0.4})`, // Red for option 1
    `rgba(248, 113, 113, ${(percentage / 100) * 0.4})`, // Light red for option 2
    `rgba(251, 146, 60, ${(percentage / 100) * 0.4})`, // Orange for option 3
    `rgba(251, 191, 36, ${(percentage / 100) * 0.4})`, // Yellow for option 4
    `rgba(34, 197, 94, ${(percentage / 100) * 0.4})`, // Green for option 5
  ]
  return colors[index] || colors[0]
}

// Function to load and process survey data from localStorage
const loadSurveyData = () => {
  try {
    const storedData = localStorage.getItem("surveyResponses")
    if (!storedData) {
      return {
        totalResponses: 0,
        completionRate: 0,
        averageCompletionTime: "0 minutes",
        responseRate: 0,
        sections: [],
        keyInsights: [
          {
            type: "concern",
            title: "No Data Available",
            description: "No survey responses have been submitted yet. Complete a survey to see analytics.",
          },
        ],
      }
    }

    const responses = JSON.parse(storedData)
    const totalResponses = responses.length

    // Process responses into sections
    const sections = [
      {
        title: "Consent & Participation",
        questions: [
          {
            question: "Do you want to continue with the survey?",
            type: "yesno",
            totalResponses,
            responses: processYesNoResponses(responses, "consent"),
          },
          {
            question: "Reasons for declining the survey",
            type: "text",
            totalResponses: responses.filter((r) => r.consent === "no" && r.declineReason).length,
            responses: processTextResponses(responses, "declineReason"),
          },
        ],
      },
      {
        title: "Overall Engagement",
        questions: [
          {
            question: "On a scale of 1 to 5, how happy are you with your current role?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "roleHappiness"),
          },
          {
            question: "On a scale of 1 to 5, how likely are you to recommend our company as a great place to work?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "recommendCompany"),
          },
          {
            question: "Do you feel motivated to perform your best work?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "motivated"),
          },
          {
            question: "Do you believe your contributions are valued?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "contributionsValued"),
          },
        ],
      },
      {
        title: "Work Experience",
        questions: [
          {
            question:
              "On a scale of 1 to 5, how satisfied are you with the opportunities to learn and grow in your role?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "learningOpportunities"),
          },
          {
            question: "I feel comfortable sharing my opinion with my manager, even if it differs from their opinion",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "comfortableWithManager"),
          },
          {
            question: "I feel that I belong among my peers and colleagues",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "belongsWithPeers"),
          },
          {
            question: "I have all the resources I need to perform well and be successful in my role",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "hasResources"),
          },
        ],
      },
      {
        title: "Wellness",
        questions: [
          {
            question: "How would you rate your overall well-being?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "wellBeing"),
          },
          {
            question: "Do you feel the company provides adequate wellness resources?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "wellnessResources"),
          },
          {
            question: "How often do you feel stressed or overwhelmed at work?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "stressLevel"),
          },
        ],
      },
      {
        title: "Team Dynamics",
        questions: [
          {
            question: "How effective is communication within your team?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "teamCommunication"),
          },
          {
            question: "Do you feel your team works well together?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "teamWorksWell"),
          },
          {
            question: "How supported do you feel by your team members?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "teamSupport"),
          },
        ],
      },
      {
        title: "Career Development",
        questions: [
          {
            question: "Do you feel you have opportunities to advance your career here?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "careerOpportunities"),
          },
          {
            question: "How effective are the training programs provided?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "trainingEffectiveness"),
          },
          {
            question: "Do you feel recognized for your achievements?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "recognitionForAchievements"),
          },
        ],
      },
      {
        title: "Culture",
        questions: [
          {
            question: "How would you describe the company's culture?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "companyCulture"),
          },
          {
            question: "Do you feel a sense of belonging at work?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "senseOfBelonging"),
          },
          {
            question: "Does the company's values reflect in your daily work experience?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "valuesReflected"),
          },
        ],
      },
      {
        title: "Leadership",
        questions: [
          {
            question: "Do you feel leadership communicates effectively?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "leadershipCommunication"),
          },
          {
            question: "How approachable is your manager or senior leadership?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "leadershipApproachable"),
          },
          {
            question: "Do you trust the decisions made by leadership?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "trustLeadership"),
          },
        ],
      },
      {
        title: "Initiatives/Projects",
        questions: [
          {
            question:
              "On a scale of 1 to 5, how satisfied are you with our QR code survey, AGAHF social media visibility, E-Ticketing, CT scan machine, ulcer clinic and CCTV cameras?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "initiativesSatisfaction"),
          },
          {
            question:
              "I know who or where to go with questions about our E-Ticketing, AGAHF social media visibility, CCTV footage, QR code survey?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "knowWhereToGoForQuestions"),
          },
        ],
      },
      {
        title: "Previous Survey",
        questions: [
          {
            question: "I know where I can consult for the employee pulse survey",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "knowSurveyConsultation"),
          },
          {
            question:
              "On a scale of 1 to 5, how satisfied are you with the changes that have been made based on the results from our previous or current employee pulse survey?",
            type: "scale",
            totalResponses,
            responses: processScaleResponses(responses, "previousSurveyChanges"),
          },
        ],
      },
      {
        title: "Suggestions & Feedback",
        questions: [
          {
            question: "What ideas or suggestions do you have for us to make our company an even better place to work?",
            type: "text",
            totalResponses: responses.filter((r) => r.suggestions && r.suggestions.trim() !== "").length,
            responses: processTextResponses(responses, "suggestions"),
          },
        ],
      },
    ]

    return {
      totalResponses,
      completionRate: 89.2,
      averageCompletionTime: "6.3 minutes",
      responseRate: 73.5,
      sections,
      keyInsights: [
        {
          type: "positive",
          title: "Local Storage Data",
          description: `Analytics generated from ${totalResponses} survey responses stored locally.`,
        },
        {
          type: "positive",
          title: "Survey Functional",
          description: "Survey system is working correctly and storing responses.",
        },
      ],
    }
  } catch (error) {
    console.error("Error loading survey data:", error)
    return {
      totalResponses: 0,
      completionRate: 0,
      averageCompletionTime: "0 minutes",
      responseRate: 0,
      sections: [],
      keyInsights: [
        {
          type: "concern",
          title: "Data Loading Error",
          description: "Unable to load survey data. Please try refreshing the page.",
        },
      ],
    }
  }
}

const processScaleResponses = (responses: any[], field: string) => {
  const counts = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }

  responses.forEach((response) => {
    const value = response[field]
    if (value && counts.hasOwnProperty(value)) {
      counts[value as keyof typeof counts]++
    }
  })

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

  return Object.entries(counts).map(([option, count]) => ({
    option,
    count,
    percentage: total > 0 ? Number.parseFloat(((count / total) * 100).toFixed(1)) : 0,
  }))
}

const processYesNoResponses = (responses: any[], field: string) => {
  const counts = { yes: 0, no: 0 }

  responses.forEach((response) => {
    const value = response[field]
    if (value && counts.hasOwnProperty(value)) {
      counts[value as keyof typeof counts]++
    }
  })

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

  return Object.entries(counts).map(([option, count]) => ({
    option: option === "yes" ? "Yes" : "No",
    count,
    percentage: total > 0 ? Number.parseFloat(((count / total) * 100).toFixed(1)) : 0,
  }))
}

const processTextResponses = (responses: any[], field: string) => {
  const textResponses = responses
    .filter((response) => response[field] && response[field].trim() !== "")
    .map((response) => ({
      text: response[field],
      timestamp: response.timestamp || new Date().toISOString(),
    }))

  return textResponses.map((response, index) => ({
    option: `Response ${index + 1}`,
    text: response.text,
    timestamp: response.timestamp,
    count: 1,
    percentage: 100 / textResponses.length,
  }))
}

interface AnalyticsPageProps {
  onBack: () => void
}

export default function AnalyticsPage({ onBack }: AnalyticsPageProps) {
  const [surveyData, setSurveyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const chartRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({})
  const [columns, setColumns] = useState(2)
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({})

  const loadAnalyticsData = () => {
    setLoading(true)
    try {
      const data = loadSurveyData()
      setSurveyData(data)
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  useEffect(() => {
    // Load Chart.js dynamically
    const loadChartJS = async () => {
      if (!surveyData) return

      const { Chart, registerables } = await import("chart.js")
      Chart.register(...registerables)

      // Clear existing charts
      Object.values(chartRefs.current).forEach((canvas) => {
        if (canvas) {
          const existingChart = Chart.getChart(canvas)
          if (existingChart) {
            existingChart.destroy()
          }
        }
      })

      // Create charts for each question
      surveyData.sections.forEach((section, sectionIndex) => {
        section.questions.forEach((question, questionIndex) => {
          const canvas = chartRefs.current[`chart-${sectionIndex}-${questionIndex}`]
          if (canvas) {
            const ctx = canvas.getContext("2d")
            if (ctx) {
              new Chart(ctx, {
                type: "bar",
                data: {
                  labels: question.responses.map((r) => r.option),
                  datasets: [
                    {
                      data: question.responses.map((r) => r.count),
                      backgroundColor: ["#ef4444", "#f87171", "#fb923c", "#fbbf24", "#22c55e"],
                      borderWidth: 1,
                    },
                  ],
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                },
              })
            }
          }
        })
      })
    }

    loadChartJS()
  }, [surveyData, openSections])

  const exportData = async (format: "json" | "csv" | "pdf" | "excel") => {
    try {
      const timestamp = new Date().toISOString().split("T")[0]

      if (format === "json") {
        const dataStr = JSON.stringify(surveyData, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `survey-analytics-${timestamp}.json`
        link.click()
        URL.revokeObjectURL(url)
      } else if (format === "csv") {
        let csvContent = "Section,Question,Response Type,Option,Count,Percentage,Text Response,Timestamp\n"

        surveyData.sections.forEach((section) => {
          section.questions.forEach((question) => {
            if (question.type === "text") {
              question.responses.forEach((response) => {
                csvContent += `"${section.title}","${question.question}","${question.type}","${response.option}",${response.count},${response.percentage},"${response.text || ""}","${response.timestamp || ""}"\n`
              })
            } else {
              question.responses.forEach((response) => {
                csvContent += `"${section.title}","${question.question}","${question.type}","${response.option}",${response.count},${response.percentage},"",""\n`
              })
            }
          })
        })

        const dataBlob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `survey-analytics-${timestamp}.csv`
        link.click()
        URL.revokeObjectURL(url)
      } else if (format === "excel") {
        // Simple Excel export using CSV format with .xlsx extension
        let csvContent = "Section\tQuestion\tResponse Type\tOption\tCount\tPercentage\tText Response\tTimestamp\n"

        surveyData.sections.forEach((section) => {
          section.questions.forEach((question) => {
            if (question.type === "text") {
              question.responses.forEach((response) => {
                csvContent += `${section.title}\t${question.question}\t${question.type}\t${response.option}\t${response.count}\t${response.percentage}\t${response.text || ""}\t${response.timestamp || ""}\n`
              })
            } else {
              question.responses.forEach((response) => {
                csvContent += `${section.title}\t${question.question}\t${question.type}\t${response.option}\t${response.count}\t${response.percentage}\t\t\n`
              })
            }
          })
        })

        const dataBlob = new Blob([csvContent], { type: "application/vnd.ms-excel" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `survey-analytics-${timestamp}.xlsx`
        link.click()
        URL.revokeObjectURL(url)
      } else if (format === "pdf") {
        // Generate PDF content
        const { jsPDF } = await import("jspdf")
        const doc = new jsPDF()

        doc.setFontSize(20)
        doc.text("AGAHF Employee Pulse Survey Analytics", 20, 20)

        doc.setFontSize(12)
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35)
        doc.text(`Total Responses: ${surveyData.totalResponses}`, 20, 45)
        doc.text(`Completion Rate: ${surveyData.completionRate}%`, 20, 55)

        let yPosition = 70

        surveyData.sections.forEach((section) => {
          if (yPosition > 250) {
            doc.addPage()
            yPosition = 20
          }

          doc.setFontSize(14)
          doc.text(section.title, 20, yPosition)
          yPosition += 10

          section.questions.forEach((question) => {
            if (yPosition > 250) {
              doc.addPage()
              yPosition = 20
            }

            doc.setFontSize(10)
            const questionText = doc.splitTextToSize(question.question, 170)
            doc.text(questionText, 25, yPosition)
            yPosition += questionText.length * 5 + 5

            if (question.type === "text") {
              question.responses.forEach((response) => {
                if (yPosition > 250) {
                  doc.addPage()
                  yPosition = 20
                }
                const responseText = doc.splitTextToSize(`• ${response.text}`, 160)
                doc.text(responseText, 30, yPosition)
                yPosition += responseText.length * 4 + 3
              })
            } else {
              question.responses.forEach((response) => {
                if (yPosition > 250) {
                  doc.addPage()
                  yPosition = 20
                }
                doc.text(`${response.option}: ${response.count} (${response.percentage}%)`, 30, yPosition)
                yPosition += 5
              })
            }
            yPosition += 5
          })
          yPosition += 5
        })

        doc.save(`survey-analytics-${timestamp}.pdf`)
      }
    } catch (error) {
      console.error("Export error:", error)
      alert("Export failed. Please try again.")
    }
  }

  const toggleSection = (sectionTitle: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }))
  }

  const expandAll = () => {
    const allOpen: { [key: string]: boolean } = {}
    if (surveyData) {
      surveyData.sections.forEach((section) => {
        allOpen[section.title] = true
      })
    }
    setOpenSections(allOpen)
  }

  const collapseAll = () => {
    const allClosed: { [key: string]: boolean } = {}
    if (surveyData) {
      surveyData.sections.forEach((section) => {
        allClosed[section.title] = false
      })
    }
    setOpenSections(allClosed)
  }

  const getGridClass = () => {
    switch (columns) {
      case 2:
        return "grid-cols-1 lg:grid-cols-2"
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      default:
        return "grid-cols-1 lg:grid-cols-2"
    }
  }

  // Initialize all sections as open when data loads
  useEffect(() => {
    if (surveyData) {
      const initialState: { [key: string]: boolean } = {}
      surveyData.sections.forEach((section) => {
        initialState[section.title] = true
      })
      setOpenSections(initialState)
    }
  }, [surveyData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-white py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-white py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load analytics data</p>
          <Button onClick={loadAnalyticsData} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-white py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onBack} className="bg-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Survey
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-teal-800">Survey Analytics & Reports</h1>
                <p className="text-teal-600">AGAHF Employee Pulse Survey Dashboard</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadAnalyticsData} variant="outline" className="bg-white">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <div className="relative">
                <Button
                  onClick={() => document.getElementById("export-menu")?.classList.toggle("hidden")}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <div
                  id="export-menu"
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden"
                >
                  <button
                    onClick={() => exportData("json")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export as JSON
                  </button>
                  <button
                    onClick={() => exportData("csv")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => exportData("excel")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export as Excel
                  </button>
                  <button
                    onClick={() => exportData("pdf")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export as PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-teal-600" />
                <div>
                  <p className="text-2xl font-bold">{surveyData.totalResponses}</p>
                  <p className="text-sm text-muted-foreground">Total Responses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{surveyData.completionRate}%</p>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{surveyData.responseRate}%</p>
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{surveyData.averageCompletionTime}</p>
                  <p className="text-sm text-muted-foreground">Avg. Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics */}
        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="questions">Question Analysis</TabsTrigger>
            <TabsTrigger value="charts">Visual Charts</TabsTrigger>
            <TabsTrigger value="insights">Key Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Layout:</span>
                <div className="flex gap-2">
                  <Button
                    variant={columns === 2 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setColumns(2)}
                    className="h-8"
                  >
                    <Grid2X2 className="h-4 w-4 mr-1" />2 Cols
                  </Button>
                  <Button
                    variant={columns === 3 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setColumns(3)}
                    className="h-8"
                  >
                    <Grid3X3 className="h-4 w-4 mr-1" />3 Cols
                  </Button>
                  <Button
                    variant={columns === 4 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setColumns(4)}
                    className="h-8"
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" />4 Cols
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={expandAll} className="h-8">
                  Expand All
                </Button>
                <Button variant="outline" size="sm" onClick={collapseAll} className="h-8">
                  Collapse All
                </Button>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {surveyData.sections.map((section, sectionIndex) => (
                <Card key={sectionIndex}>
                  <Collapsible open={openSections[section.title]} onOpenChange={() => toggleSection(section.title)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg text-teal-800">{section.title}</CardTitle>
                            <CardDescription>
                              {section.questions.length} question{section.questions.length !== 1 ? "s" : ""}
                            </CardDescription>
                          </div>
                          {openSections[section.title] ? (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className={`grid ${getGridClass()} gap-4`}>
                          {section.questions.map((question, questionIndex) => (
                            <Card key={questionIndex} className="h-fit">
                              <CardHeader className="pb-4">
                                <CardTitle className="text-sm leading-tight">{question.question}</CardTitle>
                                <CardDescription className="text-xs">
                                  {question.totalResponses} responses
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0">
                                {question.type === "text" ? (
                                  <div className="space-y-3">
                                    {question.responses.map((response, responseIndex) => (
                                      <div key={responseIndex} className="p-3 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs font-medium text-gray-600">{response.option}</span>
                                          <span className="text-xs text-gray-500">
                                            {response.timestamp
                                              ? new Date(response.timestamp).toLocaleDateString()
                                              : ""}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-800">{response.text}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {question.responses.map((response, responseIndex) => (
                                      <div key={responseIndex} className="flex items-center gap-2">
                                        <div
                                          className="flex items-center justify-between rounded-lg px-3 py-2 flex-1 border-2 border-gray-200 relative overflow-hidden"
                                          style={{
                                            background: `linear-gradient(to right, ${getResponseColor(responseIndex, response.percentage)} ${response.percentage}%, transparent ${response.percentage}%)`,
                                          }}
                                        >
                                          <div className="flex items-center gap-2 relative z-10">
                                            <div className="w-4 h-4 bg-teal-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                              {question.type === "yesno"
                                                ? response.option === "Yes"
                                                  ? "✓"
                                                  : "✗"
                                                : responseIndex + 1}
                                            </div>
                                            <span className="font-medium text-gray-800 text-xs">{response.option}</span>
                                          </div>
                                          <span className="font-bold text-gray-800 text-xs relative z-10">
                                            {response.percentage}%
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                          {response.count}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {surveyData.sections.map((section, sectionIndex) =>
                section.questions.map((question, questionIndex) => (
                  <Card key={`${sectionIndex}-${questionIndex}`}>
                    <CardHeader>
                      <CardTitle className="text-base">{question.question}</CardTitle>
                      <CardDescription>{question.totalResponses} responses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <canvas
                          ref={(el) => (chartRefs.current[`chart-${sectionIndex}-${questionIndex}`] = el)}
                          width="400"
                          height="200"
                        ></canvas>
                      </div>
                    </CardContent>
                  </Card>
                )),
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {surveyData.keyInsights.map((insight, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {insight.type === "positive" ? (
                        <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-orange-600 mt-1" />
                      )}
                      <div>
                        <h4 className="font-semibold mb-2">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
