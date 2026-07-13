import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";

interface CustomDatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  clearable?: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = "Select date...",
  className = "",
  clearable = false
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Current view of the calendar (Month/Year)
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  // Keep view in sync when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewDate(d);
      }
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonthDays = month === 0 ? getDaysInMonth(year - 1, 11) : getDaysInMonth(year, month - 1);

  // Generate calendar grid items
  const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Padding from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const mStr = month === 0 ? "12" : String(month).padStart(2, "0");
    const yStr = month === 0 ? String(year - 1) : String(year);
    cells.push({
      dateStr: `${yStr}-${mStr}-${String(d).padStart(2, "0")}`,
      dayNum: d,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const mStr = String(month + 1).padStart(2, "0");
    cells.push({
      dateStr: `${year}-${mStr}-${String(d).padStart(2, "0")}`,
      dayNum: d,
      isCurrentMonth: true
    });
  }

  // Padding for next month to complete the grid (usually 42 cells)
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const mStr = month === 11 ? "01" : String(month + 2).padStart(2, "0");
    const yStr = month === 11 ? String(year + 1) : String(year);
    cells.push({
      dateStr: `${yStr}-${mStr}-${String(d).padStart(2, "0")}`,
      dayNum: d,
      isCurrentMonth: false
    });
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return placeholder;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return placeholder;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between input-field cursor-pointer px-4 bg-bg-surface border border-border-light rounded-xl hover:border-border-hover text-sm h-10 outline-none text-text-primary transition-all duration-150 focus:border-brand focus:ring-2 focus:ring-brand-light/10"
        >
          <span className="flex items-center gap-2.5 truncate">
            <CalendarIcon className="w-4 h-4 text-text-muted shrink-0" />
            <span className="truncate text-left">{formatDateDisplay(value)}</span>
          </span>
        </button>
        {clearable && value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div
        className={`absolute left-0 mt-1.5 p-4 bg-bg-surface border border-border-light rounded-2xl shadow-medium z-50 w-72 transition-all duration-250 origin-top transform ${isOpen
            ? "opacity-100 scale-100 translate-y-0 animate-in fade-in zoom-in-95 duration-250"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
      >
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-border-light hover:border-border-hover hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition-all duration-150 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold font-display text-text-primary">
            {MONTHS[month]} {year}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-border-light hover:border-border-hover hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition-all duration-150 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {WEEKDAYS.map((day) => (
            <span key={day} className="text-[10px] font-bold text-text-muted ">
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {cells.map((cell, index) => {
            const isSelected = cell.dateStr === value;
            const isToday = cell.dateStr === todayStr;
            return (
              <button
                key={cell.dateStr + "_" + index}
                type="button"
                onClick={() => handleSelectDay(cell.dateStr)}
                className={`h-8 w-8 text-xs font-semibold rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer relative ${isSelected
                    ? "bg-brand text-white shadow-subtle scale-105"
                    : isToday
                      ? "border border-brand text-brand font-bold"
                      : cell.isCurrentMonth
                        ? "text-text-primary hover:bg-bg-surface-hover hover:scale-105"
                        : "text-text-muted/40 hover:bg-bg-surface-hover"
                  }`}
              >
                {cell.dayNum}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
