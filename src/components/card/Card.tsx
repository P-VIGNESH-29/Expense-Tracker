import React from "react";

interface CardProps {
  heading: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
}

export default function Card({ heading, value, color, icon }: CardProps) {
  return (
    <div className="bg-bg-surface border border-border-light rounded-lg p-5 shadow-subtle flex flex-col justify-between hover:border-border-hover hover:shadow-medium transition-all duration-200">
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold  tracking-wider text-text-secondary">{heading}</span>
        {icon && <div className="text-text-secondary">{icon}</div>}
      </div>
      <div className={`text-2xl font-bold font-display mt-3 ${color || "text-text-primary"}`}>
        {value}
      </div>
    </div>
  );
}