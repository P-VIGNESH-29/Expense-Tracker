import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import type { LanguageType, CurrencyType } from "../../context/SettingsContext";
import type { DefaultCategory } from "../../types";
import CustomSelect from "../../components/common/CustomSelect";
import BackButton from "../../components/common/BackButton";
import { getCategoryEmoji } from "../../utils/emojiHelper";
import {
  User as UserIcon,
  Globe,
  Edit3,
  Check,
  Calendar,
  Layers
} from "lucide-react";
import AlertModal from "../../components/common/AlertModal";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const {
    language,
    currency,
    monthlyBudget,
    name,
    email,
    updateSettings,
    formatCurrency,
    refreshSettings,
    defaultCategories,
    updateDefaultCategories,
    getBillStatus
  } = useSettings();

  useEffect(() => {
    refreshSettings();
  }, []);

  // Main profile settings fields
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editCurrency, setEditCurrency] = useState<CurrencyType>(currency);
  const [editMonthlyBudget, setEditMonthlyBudget] = useState(monthlyBudget);
  const [editLanguage, setEditLanguage] = useState<LanguageType>(language);

  // Default Categories Section State
  const [cats, setCats] = useState<DefaultCategory[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    setCats(defaultCategories);
  }, [defaultCategories]);

  useEffect(() => {
    const freshEmail = localStorage.getItem("currentUser") || "";
    if (freshEmail) {
      const data = JSON.parse(localStorage.getItem(`expenses_${freshEmail}`) || "[]");
      setExpenses(data);
    }
  }, [email]);

  // Group current month's expenses by category
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const categorySpentMap = expenses
    .filter((expense: any) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    })
    .reduce((acc: Record<string, number>, exp: any) => {
      const cat = exp.category;
      acc[cat] = (acc[cat] || 0) + (Number(exp.amount) || 0);
      return acc;
    }, {});

  // Track active setting tab
  const [activeTab, setActiveTab] = useState<"personal" | "preferences" | "categories">("personal");

  // Error/Success state
  const [successMsg, setSuccessMsg] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Confirmation Modals State
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync edits when context values load
  useEffect(() => {
    setEditName(name);
    setEditEmail(email);
    setEditCurrency(currency);
    setEditMonthlyBudget(monthlyBudget);
    setEditLanguage(language);
  }, [name, email, currency, monthlyBudget, language]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setNameError("Name is required");
      return;
    }
    if (!editEmail.trim()) {
      setEmailError("Email is required");
      return;
    }

    const success = updateSettings({
      name: editName,
      email: editEmail,
      currency: editCurrency,
      monthlyBudget: editMonthlyBudget,
      language: editLanguage
    });

    if (success) {
      setSuccessMsg("Settings saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleOpenEditCategory = (cat: DefaultCategory) => {
    navigate(`/Layout/EditMonthlyBill/${cat.id}`);
  };

  const handleToggleCategory = (id: string) => {
    const updatedCats = cats.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c);
    updateDefaultCategories(updatedCats);
  };

  const handleSignOut = () => {
    localStorage.removeItem("currentUser");
    localStorage.setItem("isAuthenticated", "false");
    navigate("/");
  };

  const handleDeleteAccount = () => {
    const currentUserEmail = localStorage.getItem("currentUser") || "";
    const usersList = JSON.parse(localStorage.getItem("users") || "[]");

    const filteredUsers = usersList.filter(
      (u: any) => u.email.toLowerCase() !== currentUserEmail.toLowerCase()
    );
    localStorage.setItem("users", JSON.stringify(filteredUsers));

    localStorage.removeItem(`expenses_${currentUserEmail}`);
    localStorage.removeItem(`default_categories_${currentUserEmail}`);
    localStorage.removeItem(`monthly_budgets_${currentUserEmail}`);
    localStorage.removeItem("currentUser");
    localStorage.setItem("isAuthenticated", "false");

    navigate("/");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Bar with BackButton */}
      <div className="flex items-center justify-between border-b border-border-light pb-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold font-display text-text-primary tracking-tight">
              Profile Settings
            </h1>
            <p className="text-text-secondary text-xs mt-1">
              Configure personal info, built-in bills, and defaults
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

      {/* Header-Style Navigation Tabs (Rounded segmented container, expanded width) */}
      <div className="flex p-1 bg-bg-surface-hover/80 border border-border-light rounded-xl shadow-subtle w-full">
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${activeTab === "personal"
              ? "bg-brand text-white shadow-sm font-semibold"
              : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
            }`}
        >
          <UserIcon className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Personal Information</span>
          <span className="inline sm:hidden">Personal</span>
        </button>

        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${activeTab === "preferences"
              ? "bg-brand text-white shadow-sm font-semibold"
              : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
            }`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Preferences & Budget</span>
          <span className="inline sm:hidden">Prefs & Budget</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${activeTab === "categories"
              ? "bg-brand text-white shadow-sm font-semibold"
              : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
            }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Recurring Monthly Bills</span>
          <span className="inline sm:hidden">Recurring Bills</span>
        </button>
      </div>

      {/* Content Panel */}
      <div className="bg-bg-surface border border-border-light rounded-2xl p-6 shadow-medium min-h-[380px] transition-all duration-300">
        {/* Tab 1: Personal Information */}
        {activeTab === "personal" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold font-display text-text-primary">Personal Details</h3>
              <p className="text-xs text-text-muted">Manage your primary account info</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 w-full">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-text-secondary">
                  Full name
                </label>
                <input
                  type="text"
                  className={`input-field w-full ${nameError ? "border-error/50 focus:border-error" : ""}`}
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                />
                {nameError && <span className="text-error text-xs">{nameError}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-text-secondary">
                  Email address
                </label>
                <input
                  type="email"
                  className={`input-field w-full ${emailError ? "border-error/50 focus:border-error" : ""}`}
                  value={editEmail}
                  onChange={(e) => {
                    setEditEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                />
                {emailError && <span className="text-error text-xs">{emailError}</span>}
              </div>

              <div className="pt-4 border-t border-border-light/60">
                <button type="submit" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
                  Save Personal Information
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Preferences & Budgets */}
        {activeTab === "preferences" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold font-display text-text-primary">Preferences & Budget</h3>
              <p className="text-xs text-text-muted">Set default currency, language, and total budget limits</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider text-text-secondary">
                    Default currency
                  </label>
                  <CustomSelect
                    value={editCurrency}
                    onChange={(val) => setEditCurrency(val as CurrencyType)}
                    options={[
                      { value: "USD", label: "USD ($)" },
                      { value: "INR", label: "INR (₹)" },
                      { value: "EUR", label: "EUR (€)" },
                      { value: "GBP", label: "GBP (£)" },
                      { value: "JPY", label: "JPY (¥)" },
                    ]}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider text-text-secondary">
                    Language
                  </label>
                  <CustomSelect
                    value={editLanguage}
                    onChange={(val) => setEditLanguage(val as LanguageType)}
                    options={[
                      { value: "en", label: "English" },
                      { value: "hi", label: "हिन्दी (Hindi)" },
                      { value: "es", label: "Español (Spanish)" },
                      { value: "fr", label: "Français (French)" },
                      { value: "de", label: "Deutsch (German)" },
                    ]}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-text-secondary">
                  Total monthly budget cap ({editCurrency})
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-semibold">
                    {editCurrency === "USD" && "$"}
                    {editCurrency === "INR" && "₹"}
                    {editCurrency === "EUR" && "€"}
                    {editCurrency === "GBP" && "£"}
                    {editCurrency === "JPY" && "¥"}
                  </span>
                  <input
                    type="number"
                    className="input-field w-full pl-12"
                   
                    onChange={(e) => setEditMonthlyBudget(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-text-muted mt-1">This sets the maximum allowed spending limit per month.</p>
              </div>

              <div className="pt-4 border-t border-border-light/60">
                <button type="submit" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Recurring Monthly Bills */}
        {activeTab === "categories" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold font-display text-text-primary">Recurring Monthly Bills</h3>
              <p className="text-xs text-text-muted">Manage built-in bill amounts and check current month payment statuses</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cats.filter(cat => ["House Rent", "Electricity Bill", "Internet Bill", "Gas Bill"].includes(cat.name)).map((cat) => {
                const spent = categorySpentMap[cat.name] || 0;
                const budget = Number(cat.monthlyBudget) || 0;
                const status = getBillStatus(spent, budget);

                return (
                  <div
                    key={cat.id}
                    className={`relative border rounded-xl p-4 shadow-subtle flex flex-col justify-between transition-all duration-300 hover:shadow-medium ${cat.enabled ? "bg-bg-surface border-border-light" : "bg-bg-main/40 border-border-light/40 opacity-70"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="text-base shrink-0">
                          {getCategoryEmoji(cat.name, cat.color)}
                        </span>
                        <h4 className="font-bold text-sm text-text-primary truncate">{cat.name}</h4>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          className="p-1.5 rounded-lg hover:bg-bg-surface-hover text-text-secondary hover:text-brand transition-all cursor-pointer"
                          title="Edit Bill Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-border-light/40 pt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Expected Amount:</span>
                        <span className="font-bold text-text-primary">{formatCurrency(cat.monthlyBudget)}</span>
                      </div>
                      {cat.dueDate && (
                        <div className="flex justify-between text-xs">
                          <span className="text-text-secondary">Due Day of Month:</span>
                          <span className="font-semibold text-text-primary flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-text-muted" /> Day {cat.dueDate}
                          </span>
                        </div>
                      )}
                      {cat.notes && (
                        <div className="text-[11px] text-text-muted italic border-l-2 border-border-light pl-2 py-0.5 line-clamp-2">
                          {cat.notes}
                        </div>
                      )}
                    </div>

                    {/* Toggles & Status */}
                    <div className="mt-4 pt-3 border-t border-border-light/40 flex items-center justify-between text-xs">
                      <label className="flex items-center space-x-2 cursor-pointer select-none text-text-secondary">
                        <input
                          type="checkbox"
                          className="rounded border-border-light text-brand focus:ring-brand accent-brand w-3.5 h-3.5"
                          checked={cat.autoInclude}
                          onChange={() => {
                            const updated = cats.map(c => c.id === cat.id ? { ...c, autoInclude: !c.autoInclude } : c);
                            updateDefaultCategories(updated);
                          }}
                        />
                        <span>Auto-include</span>
                      </label>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold  tracking-wider ${status === "Paid"
                            ? "bg-success/10 text-success border border-success/20"
                            : "bg-error/10 text-error border border-error/20"
                          }`}>
                          {status}
                        </span>

                        <button
                          onClick={() => handleToggleCategory(cat.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold  transition-all cursor-pointer ${cat.enabled
                              ? "bg-brand/10 text-brand border border-brand/20 hover:bg-brand hover:text-white"
                              : "bg-text-muted/10 text-text-muted border border-border-light hover:bg-bg-surface-hover"
                            }`}
                        >
                          {cat.enabled ? "Active" : "Disabled"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODALS */}
      <AlertModal
        isOpen={showSignOutConfirm}
        title="Sign Out Confirmation"
        message="Are you sure you want to sign out of Spendly?"
        type="confirm"
        confirmLabel="Sign Out"
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleSignOut}
      />

      <AlertModal
        isOpen={showDeleteConfirm}
        title="Permanently Delete Account?"
        message="This will completely remove your account and all transaction records. This action cannot be undone."
        type="error"
        confirmLabel="Delete Account"
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
