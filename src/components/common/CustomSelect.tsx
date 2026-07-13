import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      const idx = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isOpen) {
        handleToggle();
      } else if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        handleSelect(options[highlightedIndex].value);
      }
    } else if (e.key === "Escape" || e.key === "Tab") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        handleToggle();
      } else {
        setHighlightedIndex((prev) => (prev + 1) % options.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        handleToggle();
      } else {
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between input-field cursor-pointer px-4 bg-bg-surface border border-border-light rounded-xl hover:border-border-hover text-sm h-10 outline-none text-text-primary transition-all duration-150 focus:border-brand focus:ring-2 focus:ring-brand-light/10"
      >
        <span className="truncate pr-4">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-250 shrink-0 ${
            isOpen ? "transform rotate-180 text-text-primary" : ""
          }`}
        />
      </button>

      <div
        className={`absolute left-0 right-0 mt-1.5 bg-bg-surface border border-border-light rounded-xl shadow-medium overflow-hidden z-50 transition-all duration-200 origin-top transform ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 animate-in fade-in zoom-in-95 duration-250"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <ul className="max-h-60 overflow-y-auto py-1.5">
          {options.length === 0 ? (
            <li className="px-4 py-2 text-xs text-text-muted text-center">No options available</li>
          ) : (
            options.map((opt, index) => {
              const isSelected = opt.value === value;
              const isHighlighted = index === highlightedIndex;
              return (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors duration-150 flex items-center justify-between ${
                    isSelected
                      ? "bg-brand/10 text-brand font-semibold"
                      : isHighlighted
                      ? "bg-bg-surface-hover text-text-primary"
                      : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
                  }`}
                >
                  <span className="truncate pr-4">{opt.label}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 shrink-0 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
