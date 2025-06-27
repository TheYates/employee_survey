"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Download,
  Users,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  Grid2X2,
  LayoutGrid,
  RefreshCw,
  Moon,
  Sun,
} from "lucide-react";
// Remove database imports since we'll use API route instead

// Define interfaces for survey data

interface ResponseCount {
  option: string;
  count: number;
  percentage: number;
  text?: string;
  timestamp?: string;
}

interface SurveyQuestion {
  question: string;
  type: string;
  totalResponses: number;
  responses: ResponseCount[];
}

interface SurveySection {
  title: string;
  questions: SurveyQuestion[];
}

interface KeyInsight {
  type: string;
  title: string;
  description: string;
}

interface SurveyData {
  totalResponses: number;
  completionRate: number;
  averageCompletionTime: string;
  sections: SurveySection[];
  keyInsights: KeyInsight[];
}

const getResponseColor = (index: number, percentage: number) => {
  const colors = [
    `rgba(239, 68, 68, ${(percentage / 100) * 0.4})`, // Red for option 1
    `rgba(248, 113, 113, ${(percentage / 100) * 0.4})`, // Light red for option 2
    `rgba(251, 146, 60, ${(percentage / 100) * 0.4})`, // Orange for option 3
    `rgba(251, 191, 36, ${(percentage / 100) * 0.4})`, // Yellow for option 4
    `rgba(34, 197, 94, ${(percentage / 100) * 0.4})`, // Green for option 5
  ];
  return colors[index] || colors[0];
};

// Function to load and process survey data from API
const loadSurveyData = async () => {
  try {
    const response = await fetch("/api/analytics");

    if (!response.ok) {
      throw new Error("Failed to fetch analytics data");
    }

    const analyticsData = await response.json();
    return analyticsData;
  } catch (error) {
    console.error("Error loading survey data:", error);
    return {
      totalResponses: 0,
      completionRate: 0,
      averageCompletionTime: "0 minutes",
      sections: [],
      keyInsights: [
        {
          type: "concern",
          title: "Data Loading Error",
          description:
            "Unable to load survey data. Please try refreshing the page.",
        },
      ],
    };
  }
};

interface AnalyticsPageProps {
  onBack: () => void;
}

export default function AnalyticsPage({ onBack }: AnalyticsPageProps) {
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const chartRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
  const [columns, setColumns] = useState(2);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("questions");

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const data = await loadSurveyData();
      setSurveyData(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  useEffect(() => {
    // Load Chart.js dynamically
    const loadChartJS = async () => {
      if (
        !surveyData ||
        surveyData.sections.length === 0 ||
        activeTab !== "charts"
      )
        return;

      try {
        const { Chart, registerables } = await import("chart.js");
        Chart.register(...registerables);

        // Clear existing charts
        Object.values(chartRefs.current).forEach((canvas) => {
          if (canvas) {
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
              existingChart.destroy();
            }
          }
        });

        // Create charts for each question
        surveyData.sections.forEach(
          (section: SurveySection, sectionIndex: number) => {
            section.questions.forEach(
              (question: SurveyQuestion, questionIndex: number) => {
                const canvas =
                  chartRefs.current[`chart-${sectionIndex}-${questionIndex}`];
                if (
                  canvas &&
                  question.responses &&
                  question.responses.length > 0
                ) {
                  const ctx = canvas.getContext("2d");
                  if (ctx) {
                    new Chart(ctx, {
                      type: "bar",
                      data: {
                        labels: question.responses.map(
                          (r: ResponseCount) => r.option
                        ),
                        datasets: [
                          {
                            data: question.responses.map(
                              (r: ResponseCount) => r.count
                            ),
                            backgroundColor: [
                              "#ef4444",
                              "#f87171",
                              "#fb923c",
                              "#fbbf24",
                              "#22c55e",
                            ],
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
                    });
                  }
                }
              }
            );
          }
        );
      } catch (error) {
        console.error("Error loading Chart.js:", error);
      }
    };

    loadChartJS();
  }, [surveyData, activeTab]);

  const exportData = async (format: "json" | "csv" | "pdf" | "excel") => {
    if (!surveyData) return;

    try {
      const timestamp = new Date().toISOString().split("T")[0];

      if (format === "json") {
        const dataStr = JSON.stringify(surveyData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `survey-analytics-${timestamp}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === "csv") {
        let csvContent =
          "Section,Question,Response Type,Option,Count,Percentage,Text Response,Timestamp\n";

        surveyData.sections.forEach((section: SurveySection) => {
          section.questions.forEach((question: SurveyQuestion) => {
            if (question.type === "text") {
              question.responses.forEach((response: ResponseCount) => {
                csvContent += `"${section.title}","${question.question}","${
                  question.type
                }","${response.option}",${response.count},${
                  response.percentage
                },"${response.text || ""}","${response.timestamp || ""}"\n`;
              });
            } else {
              question.responses.forEach((response: ResponseCount) => {
                csvContent += `"${section.title}","${question.question}","${question.type}","${response.option}",${response.count},${response.percentage},"",""\n`;
              });
            }
          });
        });

        const dataBlob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `survey-analytics-${timestamp}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === "excel") {
        let csvContent =
          "Section\tQuestion\tResponse Type\tOption\tCount\tPercentage\tText Response\tTimestamp\n";

        surveyData.sections.forEach((section: SurveySection) => {
          section.questions.forEach((question: SurveyQuestion) => {
            if (question.type === "text") {
              question.responses.forEach((response: ResponseCount) => {
                csvContent += `${section.title}\t${question.question}\t${
                  question.type
                }\t${response.option}\t${response.count}\t${
                  response.percentage
                }\t${response.text || ""}\t${response.timestamp || ""}\n`;
              });
            } else {
              question.responses.forEach((response: ResponseCount) => {
                csvContent += `${section.title}\t${question.question}\t${question.type}\t${response.option}\t${response.count}\t${response.percentage}\t\t\n`;
              });
            }
          });
        });

        const dataBlob = new Blob([csvContent], {
          type: "application/vnd.ms-excel",
        });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `survey-analytics-${timestamp}.xlsx`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("AGAHF Employee Pulse Survey Analytics", 20, 20);

        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
        doc.text(`Total Responses: ${surveyData.totalResponses}`, 20, 45);
        doc.text(`Completion Rate: ${surveyData.completionRate}%`, 20, 55);

        let yPosition = 70;

        surveyData.sections.forEach((section: SurveySection) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(14);
          doc.text(section.title, 20, yPosition);
          yPosition += 10;

          section.questions.forEach((question: SurveyQuestion) => {
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 20;
            }

            doc.setFontSize(10);
            const questionText = doc.splitTextToSize(question.question, 170);
            doc.text(questionText, 25, yPosition);
            yPosition += questionText.length * 5 + 5;

            if (question.type === "text") {
              question.responses.forEach((response: ResponseCount) => {
                if (yPosition > 250) {
                  doc.addPage();
                  yPosition = 20;
                }
                const responseText = doc.splitTextToSize(
                  `• ${response.text || ""}`,
                  160
                );
                doc.text(responseText, 30, yPosition);
                yPosition += responseText.length * 4 + 3;
              });
            } else {
              question.responses.forEach((response: ResponseCount) => {
                if (yPosition > 250) {
                  doc.addPage();
                  yPosition = 20;
                }
                doc.text(
                  `${response.option}: ${response.count} (${response.percentage}%)`,
                  30,
                  yPosition
                );
                yPosition += 5;
              });
            }
            yPosition += 5;
          });
          yPosition += 5;
        });

        doc.save(`survey-analytics-${timestamp}.pdf`);
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Please try again.");
    }
  };

  const toggleSection = (sectionTitle: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  const setChartRef =
    (sectionIndex: number, questionIndex: number) =>
    (el: HTMLCanvasElement | null) => {
      chartRefs.current[`chart-${sectionIndex}-${questionIndex}`] = el;
    };

  const expandAll = () => {
    const allOpen: { [key: string]: boolean } = {};
    if (surveyData?.sections) {
      surveyData.sections.forEach((section: SurveySection) => {
        allOpen[section.title] = true;
      });
    }
    setOpenSections(allOpen);
  };

  const collapseAll = () => {
    const allClosed: { [key: string]: boolean } = {};
    if (surveyData?.sections) {
      surveyData.sections.forEach((section: SurveySection) => {
        allClosed[section.title] = false;
      });
    }
    setOpenSections(allClosed);
  };

  const getGridClass = () => {
    switch (columns) {
      case 2:
        return "grid-cols-1 lg:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default:
        return "grid-cols-1 lg:grid-cols-2";
    }
  };

  useEffect(() => {
    if (surveyData?.sections) {
      const initialState: { [key: string]: boolean } = {};
      surveyData.sections.forEach((section: SurveySection) => {
        initialState[section.title] = true;
      });
      setOpenSections(initialState);
    }
  }, [surveyData]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-white py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-600">Loading analytics data...</p>
        </div>
      </div>
    );
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
    );
  }

  return (
    <div
      className={`min-h-screen bg-background py-8 ${isDarkMode ? "dark" : ""}`}
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Survey
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Survey Analytics & Reports
                </h1>
                <p className="text-muted-foreground">
                  AGAHF Employee Pulse Survey Dashboard
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={toggleDarkMode}>
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button onClick={loadAnalyticsData} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <div className="relative">
                <Button
                  onClick={() =>
                    document
                      .getElementById("export-menu")
                      ?.classList.toggle("hidden")
                  }
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
        {surveyData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Users className="h-8 w-8 text-teal-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {surveyData.totalResponses}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Responses
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {surveyData.completionRate}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Completion Rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {surveyData.averageCompletionTime}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg. Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Analytics */}
        {surveyData && (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="questions">Question Analysis</TabsTrigger>
              <TabsTrigger value="charts">Visual Charts</TabsTrigger>
              {/* <TabsTrigger value="insights">Key Insights</TabsTrigger> */}
            </TabsList>

            <TabsContent value="questions" className="space-y-6">
              {/* Controls */}
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    Layout:
                  </span>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={expandAll}
                    className="h-8"
                  >
                    Expand All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={collapseAll}
                    className="h-8"
                  >
                    Collapse All
                  </Button>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-6">
                {surveyData.sections.map(
                  (section: SurveySection, sectionIndex: number) => (
                    <Card key={sectionIndex}>
                      <Collapsible
                        open={openSections[section.title]}
                        onOpenChange={() => toggleSection(section.title)}
                      >
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg text-teal-800">
                                  {section.title}
                                </CardTitle>
                                <CardDescription>
                                  {section.questions.length} question
                                  {section.questions.length !== 1 ? "s" : ""}
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
                              {section.questions.map(
                                (
                                  question: SurveyQuestion,
                                  questionIndex: number
                                ) => (
                                  <Card key={questionIndex} className="h-fit">
                                    <CardHeader className="pb-4">
                                      <CardTitle className="text-sm leading-tight">
                                        {question.question}
                                      </CardTitle>
                                      <CardDescription className="text-xs">
                                        {question.totalResponses} responses
                                      </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                      {question.type === "text" ? (
                                        <div className="space-y-3">
                                          {question.responses.map(
                                            (
                                              response: ResponseCount,
                                              responseIndex: number
                                            ) => (
                                              <div
                                                key={responseIndex}
                                                className="p-3 bg-gray-50 rounded-lg border"
                                              >
                                                <div className="flex items-center justify-between mb-2">
                                                  <span className="text-xs font-medium text-gray-600">
                                                    {response.option}
                                                  </span>
                                                  <span className="text-xs text-gray-500">
                                                    {response.timestamp
                                                      ? new Date(
                                                          response.timestamp
                                                        ).toLocaleDateString()
                                                      : ""}
                                                  </span>
                                                </div>
                                                <p className="text-sm text-gray-800">
                                                  {response.text}
                                                </p>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          {question.responses.map(
                                            (
                                              response: ResponseCount,
                                              responseIndex: number
                                            ) => (
                                              <div
                                                key={responseIndex}
                                                className="flex items-center gap-2"
                                              >
                                                <div
                                                  className="flex items-center justify-between rounded-lg px-3 py-2 flex-1 border-2 border-gray-200 relative overflow-hidden"
                                                  style={{
                                                    background: `linear-gradient(to right, ${getResponseColor(
                                                      responseIndex,
                                                      response.percentage
                                                    )} ${
                                                      response.percentage
                                                    }%, transparent ${
                                                      response.percentage
                                                    }%)`,
                                                  }}
                                                >
                                                  <div className="flex items-center gap-2 relative z-10">
                                                    <div className="w-4 h-4 bg-teal-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                                      {question.type === "yesno"
                                                        ? response.option ===
                                                          "Yes"
                                                          ? "✓"
                                                          : "✗"
                                                        : responseIndex + 1}
                                                    </div>
                                                    <span className="font-medium text-gray-800 text-xs">
                                                      {response.option}
                                                    </span>
                                                  </div>
                                                  <span className="font-bold text-gray-800 text-xs relative z-10">
                                                    {response.percentage}%
                                                  </span>
                                                </div>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                  {response.count}
                                                </span>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                )
                              )}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  )
                )}
              </div>
            </TabsContent>

            <TabsContent value="charts" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {surveyData.sections.map(
                  (section: SurveySection, sectionIndex: number) =>
                    section.questions.map(
                      (question: SurveyQuestion, questionIndex: number) => (
                        <Card key={`${sectionIndex}-${questionIndex}`}>
                          <CardHeader>
                            <CardTitle className="text-base">
                              {question.question}
                            </CardTitle>
                            <CardDescription>
                              {question.totalResponses} responses
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-64">
                              <canvas
                                ref={setChartRef(sectionIndex, questionIndex)}
                                width="400"
                                height="200"
                              ></canvas>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )
                )}
              </div>
            </TabsContent>

            {/* <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {surveyData.keyInsights.map(
                  (insight: KeyInsight, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {insight.type === "positive" ? (
                            <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                          ) : (
                            <AlertCircle className="h-6 w-6 text-orange-600 mt-1" />
                          )}
                          <div>
                            <h4 className="font-semibold mb-2">
                              {insight.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </TabsContent> */}
          </Tabs>
        )}
      </div>
    </div>
  );
}
