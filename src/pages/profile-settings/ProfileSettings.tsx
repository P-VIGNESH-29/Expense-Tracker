import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import type { LanguageType, CurrencyType } from "../../context/SettingsContext";
import type { DefaultCategory } from "../../types";
import CustomSelect from "../../components/common/CustomSelect";
import { 
  User as UserIcon, 
  Settings, 
  Globe, 
  Edit3, 
  Check, 
  Calendar,
  Layers,
  ArrowLeft,
  X
} from "lucide-react";
import AlertModal from "../../components/common/AlertModal";

const colorPalette = [
  "#F27878", // Coral Red
  "#7C9CFF", // Soft Blue
  "#C47CFF", // Purple
  "#5FD7A3", // Green
  "#F2B263", // Orange/Yellow
  "#FF9E7C", // Peach
  "#7CC8FF", // Sky Blue
  "#8B90A0", // Slate Grey
  "#E056FD", // Pinkish Purple
  "#10AC84", // Deep Teal
];

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
  const [activeTab, setActiveTab] = useState<"personal" | "preferences" | "categories" | "account">("personal");

  // Error/Success state
  const [successMsg, setSuccessMsg] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Confirmation Modals State
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit Default Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState(colorPalette[0]);
  const [catBudget, setCatBudget] = useState("");
  const [catDueDate, setCatDueDate] = useState("");
  const [catNotes, setCatNotes] = useState("");
  const [catEnabled, setCatEnabled] = useState(true);
  const [catAutoInclude, setCatAutoInclude] = useState(true);
  const [catError, setCatError] = useState("");

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
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatColor(cat.color);
    setCatBudget(cat.monthlyBudget);
    setCatDueDate(cat.dueDate || "");
    setCatNotes(cat.notes || "");
    setCatEnabled(cat.enabled);
    setCatAutoInclude(cat.autoInclude);
    setCatError("");
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catBudget || Number(catBudget) <= 0) {
      setCatError("Monthly Amount must be a positive number");
      return;
    }

    const updatedCats = cats.map(c => c.id === editingCatId ? {
      ...c,
      color: catColor,
      monthlyBudget: catBudget,
      dueDate: catDueDate || undefined,
      notes: catNotes || undefined,
      enabled: catEnabled,
      autoInclude: catAutoInclude
    } : c);

    updateDefaultCategories(updatedCats);
    setIsCategoryModalOpen(false);
    setSuccessMsg("Recurring bill updated successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
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
    <div className="w-full space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border-light pb-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate("../Profile")}
            className="p-2 rounded-lg hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition-all duration-200"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-display text-text-primary tracking-tight">
              Profile Settings
            </h1>
            <p className="text-text-secondary text-xs">
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

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Navigation Sidebar */}
        <div className="bg-bg-surface border border-border-light rounded-xl p-3 shadow-subtle space-y-1">
          <button
            onClick={() => setActiveTab("personal")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === "personal"
                ? "bg-brand/10 text-brand font-semibold"
                : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Personal Info</span>
          </button>

          <button
            onClick={() => setActiveTab("preferences")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === "preferences"
                ? "bg-brand/10 text-brand font-semibold"
                : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Preferences & Budget</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === "categories"
                ? "bg-brand/10 text-brand font-semibold"
                : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Recurring Monthly Bills</span>
          </button>

          <button
            onClick={() => setActiveTab("account")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-error hover:bg-error/5 transition-all`}
          >
            <Settings className="w-4 h-4" />
            <span>Account Actions</span>
          </button>
        </div>

        {/* Right Content Panel */}
        <div className="md:col-span-3 bg-bg-surface border border-border-light rounded-xl p-6 shadow-medium min-h-[380px]">
          {/* Tab 1: Personal Information */}
          {activeTab === "personal" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold font-display text-text-primary">Personal Details</h3>
                <p className="text-xs text-text-muted">Manage your primary account info</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Full Name
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

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Email Address
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

                <div className="pt-4 border-t border-border-light">
                  <button type="submit" className="btn-primary px-6 py-2.5 rounded-lg text-sm font-semibold">
                    Save Profile Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Preferences & Budgets */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold font-display text-text-primary">Preferences & Budget</h3>
                <p className="text-xs text-text-muted">Set default currency, language, and total budget limits</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Default Currency
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

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
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

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Total Monthly Budget Cap ({editCurrency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-semibold">
                      {editCurrency === "USD" && "$"}
                      {editCurrency === "INR" && "₹"}
                      {editCurrency === "EUR" && "€"}
                      {editCurrency === "GBP" && "£"}
                      {editCurrency === "JPY" && "¥"}
                    </span>
                    <input
                      type="number"
                      className="input-field w-full pl-8"
                      value={editMonthlyBudget}
                      onChange={(e) => setEditMonthlyBudget(e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">This sets the maximum allowed spending limit per month.</p>
                </div>

                <div className="pt-4 border-t border-border-light">
                  <button type="submit" className="btn-primary px-6 py-2.5 rounded-lg text-sm font-semibold">
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 3: Recurring Monthly Bills */}
          {activeTab === "categories" && (
            <div className="space-y-6">
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
                      className={`relative border rounded-xl p-4 shadow-subtle flex flex-col justify-between transition-all hover:shadow-medium ${
                        cat.enabled ? "bg-bg-surface border-border-light" : "bg-bg-main/40 border-border-light/40 opacity-70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div 
                            className="w-4 h-4 rounded-full shrink-0 border border-black/10" 
                            style={{ backgroundColor: cat.color }} 
                          />
                          <h4 className="font-bold text-sm text-text-primary truncate">{cat.name}</h4>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleOpenEditCategory(cat)}
                            className="p-1.5 rounded hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition cursor-pointer"
                            title="Edit Bill Amount"
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
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            status === "Paid" 
                              ? "bg-success/10 text-success border border-success/20" 
                              : "bg-error/10 text-error border border-error/20"
                          }`}>
                            {status}
                          </span>

                          <button
                            onClick={() => handleToggleCategory(cat.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                              cat.enabled 
                                ? "bg-brand/10 text-brand border border-brand/20" 
                                : "bg-text-muted/10 text-text-muted border border-border-light"
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

          {/* Tab 4: Account Actions */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold font-display text-text-primary">Account settings</h3>
                <p className="text-xs text-text-muted">Manage session options and account deletion credentials</p>
              </div>

              <div className="p-4 rounded-xl border border-border-light bg-bg-main/50 space-y-4 max-w-lg">
                <p className="text-xs text-text-secondary leading-relaxed">
                  Logging out will sign you out of Spendly on this device. Deleting your account is permanent and cannot be undone.
                </p>
                <div className="flex items-center space-x-3 w-full">
                  <button 
                    onClick={() => setShowSignOutConfirm(true)}
                    className="flex-1 h-10 text-xs font-semibold rounded-lg bg-brand hover:bg-brand-hover text-white transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Sign Out Account
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 h-10 text-xs font-semibold rounded-lg bg-error hover:bg-error-hover text-white transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* POPUP EDIT DEFAULT BILL MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
          <div className="relative bg-bg-surface border border-border-light rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border-light pb-3">
              <h3 className="text-lg font-bold font-display text-text-primary">
                Edit {catName} Amount
              </h3>
              <button 
                onClick={() => setIsCategoryModalOpen(false)} 
                className="text-text-secondary hover:text-text-primary cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {catError && (
              <div className="p-3 text-xs bg-error/10 text-error rounded-lg border border-error/20 font-medium">
                {catError}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Bill Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorPalette.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCatColor(color)}
                      className={`w-8 h-8 rounded-full border transition-all ${
                        catColor === color ? "scale-110 ring-2 ring-brand ring-offset-2" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Monthly Bill Amount
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    className="input-field w-full"
                    value={catBudget}
                    onChange={(e) => setCatBudget(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Due Day of Month (optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="e.g. 15"
                    className="input-field w-full"
                    value={catDueDate}
                    onChange={(e) => setCatDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Notes (optional)
                </label>
                <textarea
                  placeholder="Remarks or notes..."
                  className="input-field w-full h-20 resize-none py-2"
                  value={catNotes}
                  onChange={(e) => setCatNotes(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-text-secondary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-border-light text-brand accent-brand w-4 h-4"
                    checked={catAutoInclude}
                    onChange={() => setCatAutoInclude(!catAutoInclude)}
                  />
                  <span>Automatically carry over to monthly budgets</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-text-secondary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-border-light text-brand accent-brand w-4 h-4"
                    checked={catEnabled}
                    onChange={() => setCatEnabled(!catEnabled)}
                  />
                  <span>Recurring bill active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border-light mt-4">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="btn-secondary px-5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5"
                >
                  Save Amount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
