import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { Check } from "lucide-react";
import type { DefaultCategory } from "../../types";
import BackButton from "../../components/common/BackButton";
import { emojiList } from "../../utils/emojiHelper";

export default function EditMonthlyBill() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    defaultCategories,
    updateDefaultCategories,
    formatCurrency,
    getBillStatus
  } = useSettings();

  const [bill, setBill] = useState<DefaultCategory | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [color, setColor] = useState("📦");
  const [notes, setNotes] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [autoInclude, setAutoInclude] = useState(true);

  // Status/Messages
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [expenses, setExpenses] = useState<any[]>([]);

  // Load the specific bill details
  useEffect(() => {
    const foundBill = defaultCategories.find((c) => c.id === id);
    if (foundBill) {
      setBill(foundBill);
      setName(foundBill.name);
      setAmount(foundBill.monthlyBudget);
      setDueDate(foundBill.dueDate || "");
      setColor(foundBill.color);
      setNotes(foundBill.notes || "");
      setEnabled(foundBill.enabled);
      setAutoInclude(foundBill.autoInclude);
    } else {
      setErrorMsg("Bill not found.");
    }
  }, [id, defaultCategories]);

  // Load current month's expenses for payment status calculation
  useEffect(() => {
    const freshEmail = localStorage.getItem("currentUser") || "";
    if (freshEmail) {
      const data = JSON.parse(localStorage.getItem(`expenses_${freshEmail}`) || "[]");
      setExpenses(data);
    }
  }, []);

  if (!bill && !errorMsg) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-text-secondary">Loading bill details...</div>
      </div>
    );
  }

  // Calculate current spent and derived payment status
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const spent = expenses
    .filter((expense: any) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear &&
        expense.category.toLowerCase() === (bill?.name || "").toLowerCase()
      );
    })
    .reduce((sum: number, exp: any) => sum + (Number(exp.amount) || 0), 0);

  const paymentStatus = getBillStatus(spent, Number(amount) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Name is required");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setErrorMsg("Expected Amount must be a positive number");
      return;
    }

    const updatedCategories = defaultCategories.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          name,
          color,
          monthlyBudget: amount,
          dueDate: dueDate || undefined,
          notes: notes || undefined,
          enabled,
          autoInclude,
        };
      }
      return c;
    });

    updateDefaultCategories(updatedCategories);
    setSuccessMsg("Recurring bill details saved successfully!");
    setErrorMsg("");

    setTimeout(() => {
      navigate("/Layout/ProfileSettings");
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border-light pb-4">
        <div className="flex items-center space-x-3">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold font-display text-text-primary tracking-tight">
              Edit Monthly Bill
            </h1>
            <p className="text-text-secondary text-xs">
              Modify details for {bill?.name}
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="px-4 py-2 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-semibold flex items-center space-x-2 animate-bounce">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 text-sm bg-error/10 text-error rounded-xl border border-error/20 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Modern Card Container */}
      <div className="bg-bg-surface border border-border-light rounded-2xl p-6 shadow-medium transition-all">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Bill Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                Bill name / category
              </label>
              <input
                type="text"
                className="input-field w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Broadband Subscription"
              />
            </div>

            {/* Expected Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                Expected monthly amount
              </label>
              <input
                type="number"
                className="input-field w-full"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 100"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                Due day of month (optional)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                className="input-field w-full"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="e.g. 15"
              />
            </div>

            {/* Current month status indicator */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary block">
                Current month status
              </label>
              <div className="flex items-center space-x-3 h-[42px] px-4 rounded-xl border border-border-light bg-bg-main/30">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold  tracking-wider ${paymentStatus === "Paid"
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-error/10 text-error border border-error/20"
                  }`}>
                  {paymentStatus}
                </span>
                <span className="text-xs text-text-muted">
                  Spent: {formatCurrency(spent)} / {formatCurrency(amount || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Theme / Category emoji selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary">
              Theme / Category symbol / emoji
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2.5 mt-2">
              {emojiList.map((item) => {
                const isSelected = color === item.emoji;
                return (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={() => setColor(item.emoji)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-150 cursor-pointer hover:scale-115 active:scale-95 border ${
                      isSelected 
                        ? "bg-brand/10 border-brand shadow-sm scale-110 font-bold" 
                        : "bg-bg-surface-hover/50 border-border-light hover:bg-bg-surface-hover hover:border-border-hover/80"
                    }`}
                    title={item.label}
                  >
                    {item.emoji}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 ">
            <label className="text-xs font-semibold text-text-secondary">
              Notes / description (optional)
            </label>
            <input
              className="input-field w-full h-24 pt-6"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide context, references, or instructions about this monthly bill..."
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2">
            <label className="flex items-center space-x-2 text-xs font-semibold text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                className="rounded border-border-light text-brand accent-brand w-4 h-4 cursor-pointer"
                checked={autoInclude}
                onChange={() => setAutoInclude(!autoInclude)}
              />
              <span>Automatically carry over to monthly budgets</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-semibold text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                className="rounded border-border-light text-brand accent-brand w-4 h-4 cursor-pointer"
                checked={enabled}
                onChange={() => setEnabled(!enabled)}
              />
              <span>Recurring bill active</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-5 border-t border-border-light/60">
            <button
              type="button"
              onClick={() => navigate("/Layout/ProfileSettings")}
              className="btn-secondary px-6 rounded-xl text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6 rounded-xl text-sm font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
