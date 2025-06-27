"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Moon,
  Sun,
} from "lucide-react";
import { submitSurvey } from "@/actions/survey-actions";

interface SurveyData {
  consent: string;
  // Overall engagement
  roleHappiness: string;
  recommendCompany: string;
  motivated: string;
  contributionsValued: string;
  // Work experience
  learningOpportunities: string;
  comfortableWithManager: string;
  belongsWithPeers: string;
  hasResources: string;
  // Wellness
  wellBeing: string;
  wellnessResources: string;
  stressLevel: string;
  // Team dynamics
  teamCommunication: string;
  teamWorksWell: string;
  teamSupport: string;
  // Career development
  careerOpportunities: string;
  trainingEffectiveness: string;
  recognitionForAchievements: string;
  // Culture
  companyCulture: string;
  senseOfBelonging: string;
  valuesReflected: string;
  // Leadership
  leadershipCommunication: string;
  leadershipApproachable: string;
  trustLeadership: string;
  // Initiatives
  initiativesSatisfaction: string;
  knowWhereToGoForQuestions: string;
  // Previous survey
  knowSurveyConsultation: string;
  previousSurveyChanges: string;
  // Suggestions
  suggestions: string;
  // Decline reason
  declineReason: string;
}

interface LinearScaleProps {
  value: string;
  onChange: (value: string) => void;
  id: string;
}

function LinearScale({ value, onChange, id }: LinearScaleProps) {
  const options = [
    {
      value: "1",
      label: "1",
      color: "bg-red-500 border-red-500",
      hoverColor: "hover:border-red-300 hover:bg-red-50",
    },
    {
      value: "2",
      label: "2",
      color: "bg-red-400 border-red-400",
      hoverColor: "hover:border-red-300 hover:bg-red-50",
    },
    {
      value: "3",
      label: "3",
      color: "bg-orange-400 border-orange-400",
      hoverColor: "hover:border-orange-300 hover:bg-orange-50",
    },
    {
      value: "4",
      label: "4",
      color: "bg-yellow-400 border-yellow-400",
      hoverColor: "hover:border-yellow-300 hover:bg-yellow-50",
    },
    {
      value: "5",
      label: "5",
      color: "bg-green-500 border-green-500",
      hoverColor: "hover:border-green-300 hover:bg-green-50",
    },
  ];

  return (
    <div className="flex gap-2 mt-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 min-w-[48px] ${
            value === option.value
              ? `${option.color} text-white shadow-md`
              : `bg-background text-foreground border-border hover:bg-accent ${option.hoverColor}`
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface YesNoButtonsProps {
  value: string;
  onChange: (value: string) => void;
  id: string;
}

function YesNoButtons({ value, onChange, id }: YesNoButtonsProps) {
  return (
    <div className="flex gap-2 mt-3">
      <button
        type="button"
        onClick={() => onChange("yes")}
        className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 min-w-[64px] ${
          value === "yes"
            ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-600"
            : "bg-background text-foreground border-border hover:bg-accent hover:border-green-300"
        }`}
      >
        <ThumbsUp
          className={`w-4 h-4 ${
            value === "yes" ? "text-green-600" : "text-gray-400"
          }`}
        />
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange("no")}
        className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 min-w-[64px] ${
          value === "no"
            ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-600"
            : "bg-background text-foreground border-border hover:bg-accent hover:border-red-300"
        }`}
      >
        <ThumbsDown
          className={`w-4 h-4 ${
            value === "no" ? "text-red-600" : "text-gray-400"
          }`}
        />
        No
      </button>
    </div>
  );
}

interface EmployeeSurveyProps {
  onLogoRightClick?: (e: React.MouseEvent) => void;
}

export default function EmployeeSurvey({
  onLogoRightClick,
}: EmployeeSurveyProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    consent: "",
    roleHappiness: "",
    recommendCompany: "",
    motivated: "",
    contributionsValued: "",
    learningOpportunities: "",
    comfortableWithManager: "",
    belongsWithPeers: "",
    hasResources: "",
    wellBeing: "",
    wellnessResources: "",
    stressLevel: "",
    teamCommunication: "",
    teamWorksWell: "",
    teamSupport: "",
    careerOpportunities: "",
    trainingEffectiveness: "",
    recognitionForAchievements: "",
    companyCulture: "",
    senseOfBelonging: "",
    valuesReflected: "",
    leadershipCommunication: "",
    leadershipApproachable: "",
    trustLeadership: "",
    initiativesSatisfaction: "",
    knowWhereToGoForQuestions: "",
    knowSurveyConsultation: "",
    previousSurveyChanges: "",
    suggestions: "",
    declineReason: "",
  });

  const [wentBack, setWentBack] = useState(false);

  const updateSurveyData = (field: keyof SurveyData, value: string) => {
    setSurveyData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Initialize dark mode from system preference
  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(prefersDark);
  }, []);

  // Auto-advance functionality
  useEffect(() => {
    if (canProceed() && currentStep >= 0 && currentStep < 10 && !wentBack) {
      const timer = setTimeout(() => {
        handleNext();
      }, 1500); // 1.5 second delay

      return () => clearTimeout(timer);
    }
  }, [surveyData, currentStep, wentBack]);

  const steps = [
    { title: "Consent", key: "consent" },
    { title: "Overall Engagement", key: "engagement" },
    { title: "Work Experience", key: "workExperience" },
    { title: "Wellness", key: "wellness" },
    { title: "Team Dynamics", key: "teamDynamics" },
    { title: "Career Development", key: "careerDevelopment" },
    { title: "Culture", key: "culture" },
    { title: "Leadership", key: "leadership" },
    { title: "Initiatives/Projects", key: "initiatives" },
    { title: "Previous Survey", key: "previousSurvey" },
    { title: "Suggestions", key: "suggestions" },
    { title: "Complete", key: "complete" },
  ];

  const totalSteps = surveyData.consent === "no" ? 2 : steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        if (surveyData.consent === "no") {
          return surveyData.declineReason !== "";
        }
        return surveyData.consent !== "";
      case 1:
        if (surveyData.consent === "no") return surveyData.declineReason !== "";
        return (
          surveyData.roleHappiness !== "" &&
          surveyData.recommendCompany !== "" &&
          surveyData.motivated !== "" &&
          surveyData.contributionsValued !== ""
        );
      case 2:
        return (
          surveyData.learningOpportunities !== "" &&
          surveyData.comfortableWithManager !== "" &&
          surveyData.belongsWithPeers !== "" &&
          surveyData.hasResources !== ""
        );
      case 3:
        return (
          surveyData.wellBeing !== "" &&
          surveyData.wellnessResources !== "" &&
          surveyData.stressLevel !== ""
        );
      case 4:
        return (
          surveyData.teamCommunication !== "" &&
          surveyData.teamWorksWell !== "" &&
          surveyData.teamSupport !== ""
        );
      case 5:
        return (
          surveyData.careerOpportunities !== "" &&
          surveyData.trainingEffectiveness !== "" &&
          surveyData.recognitionForAchievements !== ""
        );
      case 6:
        return (
          surveyData.companyCulture !== "" &&
          surveyData.senseOfBelonging !== "" &&
          surveyData.valuesReflected !== ""
        );
      case 7:
        return (
          surveyData.leadershipCommunication !== "" &&
          surveyData.leadershipApproachable !== "" &&
          surveyData.trustLeadership !== ""
        );
      case 8:
        return (
          surveyData.initiativesSatisfaction !== "" &&
          surveyData.knowWhereToGoForQuestions !== ""
        );
      case 9:
        return (
          surveyData.knowSurveyConsultation !== "" &&
          surveyData.previousSurveyChanges !== ""
        );
      case 10:
        return true; // Suggestions are optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    setWentBack(false);
    if (currentStep === 0 && surveyData.consent === "no") {
      setCurrentStep(1); // Go to decline reason
    } else if (currentStep === 1 && surveyData.consent === "no") {
      setCurrentStep(11); // Go to complete
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setWentBack(true);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await submitSurvey(surveyData);

      if (result.success) {
        console.log("Survey submitted:", surveyData);
        // Move to completion page
        setCurrentStep(11);
      } else {
        console.error("Survey submission failed:", result.message);
        // You could add a toast notification here instead of alert
        // For now, just log the error and still show completion page
        setCurrentStep(11);
      }
    } catch (error) {
      console.error("Error submitting survey:", error);
      // You could add a toast notification here instead of alert
      // For now, just log the error and still show completion page
      setCurrentStep(11);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {/* <h2 className="text-2xl font-bold">EMPLOYEE PULSE SURVEY</h2> */}
              <p className="text-muted-foreground leading-relaxed">
                This is a survey of employees of AGAHF. The aim is to understand
                the working conditions, professional expectations, and overall
                job satisfaction of all our team members. Your feedback is
                anonymous. Filling in the survey takes a maximum of 5-10
                minutes. Your responses will help us identify areas that need
                improvement and improve the working experience for everyone.
              </p>
              <p className="font-medium">Do you want to continue?</p>
            </div>
            <YesNoButtons
              value={surveyData.consent}
              onChange={(value) => updateSurveyData("consent", value)}
              id="consent"
            />

            {surveyData.consent === "no" && (
              <div className="space-y-4 mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <h3 className="text-lg font-semibold text-destructive">
                  Reasons you can't complete the survey
                </h3>
                <Textarea
                  value={surveyData.declineReason}
                  onChange={(e) =>
                    updateSurveyData("declineReason", e.target.value)
                  }
                  placeholder="Please let us know why you can't complete the survey..."
                  className="min-h-[100px]"
                />
              </div>
            )}
          </div>
        );

      case 1:
        if (surveyData.consent === "no") {
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Reason for Declining</h2>
              <div className="space-y-2">
                <Label htmlFor="decline-reason">
                  Please let us know why you can't complete the survey:
                </Label>
                <Textarea
                  id="decline-reason"
                  value={surveyData.declineReason}
                  onChange={(e) =>
                    updateSurveyData("declineReason", e.target.value)
                  }
                  placeholder="Your reason here..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">
              Overall Engagement and Satisfaction
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  On a scale of 1 to 5, how happy are you with your current
                  role?
                </Label>
                <LinearScale
                  value={surveyData.roleHappiness}
                  onChange={(value) => updateSurveyData("roleHappiness", value)}
                  id="role-happiness"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  On a scale of 1 to 5, how likely are you to recommend our
                  company as a great place to work?
                </Label>
                <LinearScale
                  value={surveyData.recommendCompany}
                  onChange={(value) =>
                    updateSurveyData("recommendCompany", value)
                  }
                  id="recommend-company"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  Do you feel motivated to perform your best work?
                </Label>
                <LinearScale
                  value={surveyData.motivated}
                  onChange={(value) => updateSurveyData("motivated", value)}
                  id="motivated"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  Do you believe your contributions are valued?
                </Label>
                <LinearScale
                  value={surveyData.contributionsValued}
                  onChange={(value) =>
                    updateSurveyData("contributionsValued", value)
                  }
                  id="contributions"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Work Experience</h2>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  On a scale of 1 to 5, how satisfied are you with the
                  opportunities to learn and grow in your role?
                </Label>
                <LinearScale
                  value={surveyData.learningOpportunities}
                  onChange={(value) =>
                    updateSurveyData("learningOpportunities", value)
                  }
                  id="learning-opportunities"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  I feel comfortable sharing my opinion with my manager, even if
                  it differs from their opinion.
                </Label>
                <LinearScale
                  value={surveyData.comfortableWithManager}
                  onChange={(value) =>
                    updateSurveyData("comfortableWithManager", value)
                  }
                  id="manager"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  I feel that I belong among my peers and colleagues.
                </Label>
                <LinearScale
                  value={surveyData.belongsWithPeers}
                  onChange={(value) =>
                    updateSurveyData("belongsWithPeers", value)
                  }
                  id="peers"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  I have all the resources I need to perform well and be
                  successful in my role.
                </Label>
                <LinearScale
                  value={surveyData.hasResources}
                  onChange={(value) => updateSurveyData("hasResources", value)}
                  id="resources"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Wellness</h2>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  How would you rate your overall well-being?
                </Label>
                <LinearScale
                  value={surveyData.wellBeing}
                  onChange={(value) => updateSurveyData("wellBeing", value)}
                  id="well-being"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  Do you feel the company provides adequate wellness resources?
                </Label>
                <LinearScale
                  value={surveyData.wellnessResources}
                  onChange={(value) =>
                    updateSurveyData("wellnessResources", value)
                  }
                  id="wellness-resources"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  How often do you feel stressed or overwhelmed at work?
                </Label>
                <LinearScale
                  value={surveyData.stressLevel}
                  onChange={(value) => updateSurveyData("stressLevel", value)}
                  id="stress-level"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Team Dynamics</h2>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  How effective is communication within your team?
                </Label>
                <LinearScale
                  value={surveyData.teamCommunication}
                  onChange={(value) =>
                    updateSurveyData("teamCommunication", value)
                  }
                  id="team-communication"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  Do you feel your team works well together?
                </Label>
                <LinearScale
                  value={surveyData.teamWorksWell}
                  onChange={(value) => updateSurveyData("teamWorksWell", value)}
                  id="team-works"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  How supported do you feel by your team members?
                </Label>
                <LinearScale
                  value={surveyData.teamSupport}
                  onChange={(value) => updateSurveyData("teamSupport", value)}
                  id="team-support"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Career Development</h2>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  Do you feel you have opportunities to advance your career
                  here?
                </Label>
                <LinearScale
                  value={surveyData.careerOpportunities}
                  onChange={(value) =>
                    updateSurveyData("careerOpportunities", value)
                  }
                  id="career"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  How effective are the training programs provided?
                </Label>
                <LinearScale
                  value={surveyData.trainingEffectiveness}
                  onChange={(value) =>
                    updateSurveyData("trainingEffectiveness", value)
                  }
                  id="training-effectiveness"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  Do you feel recognized for your achievements?
                </Label>
                <LinearScale
                  value={surveyData.recognitionForAchievements}
                  onChange={(value) =>
                    updateSurveyData("recognitionForAchievements", value)
                  }
                  id="recognition"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Culture</h2>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  How would you describe the company's culture?
                </Label>
                <LinearScale
                  value={surveyData.companyCulture}
                  onChange={(value) =>
                    updateSurveyData("companyCulture", value)
                  }
                  id="company-culture"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  Do you feel a sense of belonging at work?
                </Label>
                <LinearScale
                  value={surveyData.senseOfBelonging}
                  onChange={(value) =>
                    updateSurveyData("senseOfBelonging", value)
                  }
                  id="belonging"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  Does the company's values reflect in your daily work
                  experience?
                </Label>
                <LinearScale
                  value={surveyData.valuesReflected}
                  onChange={(value) =>
                    updateSurveyData("valuesReflected", value)
                  }
                  id="values"
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Leadership</h2>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  Do you feel leadership communicates effectively?
                </Label>
                <LinearScale
                  value={surveyData.leadershipCommunication}
                  onChange={(value) =>
                    updateSurveyData("leadershipCommunication", value)
                  }
                  id="leadership-comm"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  How approachable is your manager or senior leadership?
                </Label>
                <LinearScale
                  value={surveyData.leadershipApproachable}
                  onChange={(value) =>
                    updateSurveyData("leadershipApproachable", value)
                  }
                  id="leadership-approachable"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  Do you trust the decisions made by leadership?
                </Label>
                <LinearScale
                  value={surveyData.trustLeadership}
                  onChange={(value) =>
                    updateSurveyData("trustLeadership", value)
                  }
                  id="trust"
                />
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Initiatives/Projects</h2>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  On a scale of 1 to 5, how satisfied are you with our QR code
                  survey, AGAHF social media visibility, E-Ticketing, CT Scan
                  Machine, Ulcer Clinic and CCTV cameras?
                </Label>
                <LinearScale
                  value={surveyData.initiativesSatisfaction}
                  onChange={(value) =>
                    updateSurveyData("initiativesSatisfaction", value)
                  }
                  id="initiatives-satisfaction"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  I know who or where to go with questions about our
                  E-Ticketing, AGAHF Social Media visibility, CCTV footage, QR
                  Code survey?
                </Label>
                <LinearScale
                  value={surveyData.knowWhereToGoForQuestions}
                  onChange={(value) =>
                    updateSurveyData("knowWhereToGoForQuestions", value)
                  }
                  id="know-where"
                />
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Previous/Current Survey</h2>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  I know where I can consult for the employee pulse survey
                </Label>
                <LinearScale
                  value={surveyData.knowSurveyConsultation}
                  onChange={(value) =>
                    updateSurveyData("knowSurveyConsultation", value)
                  }
                  id="survey-consult"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  On a scale of 1 to 5, how satisfied are you with the changes
                  that have been made based on the results from our previous or
                  current employee pulse survey?
                </Label>
                <LinearScale
                  value={surveyData.previousSurveyChanges}
                  onChange={(value) =>
                    updateSurveyData("previousSurveyChanges", value)
                  }
                  id="previous-survey-changes"
                />
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Digital Suggestion Box</h2>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  What ideas or suggestions do you have for us to make our
                  company an even better place to work?
                </Label>
                <Textarea
                  value={surveyData.suggestions}
                  onChange={(e) =>
                    updateSurveyData("suggestions", e.target.value)
                  }
                  placeholder="Share your ideas and suggestions here..."
                  className="min-h-[120px] mt-2"
                />
              </div>
            </div>
          </div>
        );

      case 11:
        return (
          <div className="space-y-6 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold">Survey Complete!</h2>
            <p className="text-muted-foreground">
              Thank you for taking the time to complete our employee pulse
              survey. Your feedback is valuable and will help us improve the
              workplace experience for everyone.
            </p>
            {surveyData.consent === "no" && (
              <p className="text-sm text-muted-foreground">
                We appreciate you letting us know why you couldn't complete the
                full survey.
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-background  ${isDarkMode ? "dark" : ""}`}>
      <div className="mx-auto max-w-3xl px-4">
        {/* Dark Mode Toggle
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div> */}

        {/* Logo and Heading Outside Card */}
        <div className="text-center mb-2">
          <div className="flex justify-center ">
            <img
              src="/agahflogo white.svg"
              alt="AGAHF Logo"
              className="h-40 w-auto cursor-pointer"
              onContextMenu={onLogoRightClick}
              title="Right-click for options"
            />
          </div>
          <h1 className="text-4xl font-bold text-foreground text-green-500 mb-3">
            AGA Health Foundation
          </h1>
          <p className="text-xl text-muted-foreground">Employee Pulse Survey</p>
        </div>

        <Card className="w-full">
          <CardHeader className="pb-4">
            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {totalSteps}:{" "}
                  {steps[currentStep]?.title}
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.round(progress)}% Complete
                </div>
              </div>
              <Progress value={progress} />
            </div>
          </CardHeader>

          <CardContent className="pb-6">{renderStep()}</CardContent>

          {currentStep < 11 && (
            <div
              className={`flex border-t p-6 ${
                currentStep === 0 ? "justify-end" : "justify-between"
              }`}
            >
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}

              {(wentBack ||
                currentStep === 10 ||
                (currentStep === 0 && surveyData.consent === "no")) && (
                <Button
                  onClick={
                    currentStep === 10 ||
                    (currentStep === 0 &&
                      surveyData.consent === "no" &&
                      surveyData.declineReason !== "")
                      ? handleSubmit
                      : handleNext
                  }
                  disabled={!canProceed()}
                >
                  {currentStep === 10 ||
                  (currentStep === 0 && surveyData.consent === "no")
                    ? "Submit Survey"
                    : "Next"}
                  {currentStep !== 10 &&
                    !(currentStep === 0 && surveyData.consent === "no") && (
                      <ChevronRight className="ml-2 h-4 w-4" />
                    )}
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
