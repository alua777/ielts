import React, { useEffect, useState } from "react";

export default function Timer({ examPart }) {
  const getInitialTime = () => {
    switch (examPart.toLowerCase()) {
      case "listening":
        return 40 * 60; // 40 minutes
      case "reading":
        return 40 * 60; // 40 minutes
      case "writing":
        return 60 * 60; // 60 minutes
      default:
        return 0;
    }
  };

  const [timeLeft, setTimeLeft] = useState(getInitialTime());

  useEffect(() => {
    setTimeLeft(getInitialTime()); // Reset when examPart changes
  }, [examPart]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // Convert seconds → MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="p-4 rounded-3xl bg-violet-200 text-lg font-semibold">
      {formatTime(timeLeft)}
    </div>
  );
}
