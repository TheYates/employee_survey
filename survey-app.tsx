"use client";

import { useState, useEffect } from "react";
import EmployeeSurvey from "./employee-survey";
import AnalyticsPage from "./analytics-page";

export default function SurveyApp() {
  const [currentView, setCurrentView] = useState<"survey" | "analytics">(
    "survey"
  );
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleClick = () => {
      setShowContextMenu(false);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const handleLogoRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleViewAnalytics = () => {
    setCurrentView("analytics");
    setShowContextMenu(false);
  };

  const handleBackToSurvey = () => {
    setCurrentView("survey");
  };

  return (
    <div className="relative">
      {currentView === "survey" ? (
        <EmployeeSurvey onLogoRightClick={handleLogoRightClick} />
      ) : (
        <AnalyticsPage onBack={handleBackToSurvey} />
      )}

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[160px]"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
        >
          <button
            onClick={handleViewAnalytics}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            📊 View Analytics
          </button>
          <button
            onClick={handleBackToSurvey}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            📝 Back to Survey
          </button>
          <hr className="my-1" />
          <button
            onClick={() => setShowContextMenu(false)}
            className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
