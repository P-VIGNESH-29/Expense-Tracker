import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import BackButton from "../../components/common/BackButton";
import { getCategoryEmoji } from "../../utils/emojiHelper";

function Profile() {
  const navigate = useNavigate();
  const {
    language,
    currency,
    monthlyBudget,
    name,
    email,
    t,
    formatCurrency,
    refreshSettings,
    currentMonthBudgets
  } = useSettings();

  useEffect(() => {
    refreshSettings();
  }, []);

  // Load expenses to calculate stats
  const [expenses, setExpenses] = useState<any[]>([]);
  useEffect(() => {
    const currentUserEmail = localStorage.getItem("currentUser") || "";
    if (currentUserEmail) {
      const data = JSON.parse(localStorage.getItem(`expenses_${currentUserEmail}`) || "[]");
      setExpenses(data);
    }
  }, [email]);

  // Confirmation Modals State
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleOpenEdit = () => {
    navigate("/Layout/ProfileSettings");
  };

  const handleSignOut = () => {
    localStorage.removeItem("currentUser");
    localStorage.setItem("isAuthenticated", "false");
    navigate("/");
  };

  const handleDeleteAccount = () => {
    const currentUserEmail = localStorage.getItem("currentUser") || "";
    const usersList = JSON.parse(localStorage.getItem("users") || "[]");

    // Remove user profile
    const filteredUsers = usersList.filter(
      (u: any) => u.email.toLowerCase() !== currentUserEmail.toLowerCase()
    );
    localStorage.setItem("users", JSON.stringify(filteredUsers));

    // Remove isolated user database
    localStorage.removeItem(`expenses_${currentUserEmail}`);
    localStorage.removeItem("currentUser");
    localStorage.setItem("isAuthenticated", "false");

    navigate("/");
  };

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Filter expenses for current month
  const monthlyExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });
  const monthlySpent = monthlyExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Filter expenses for current year
  const yearlyExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === currentYear;
  });
  const yearlySpent = yearlyExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const budgetNum = Number(monthlyBudget) || 0;
  const monthlySaving = Math.max(0, budgetNum - monthlySpent);
  const yearSaving = Math.max(0, (budgetNum * 12) - yearlySpent);

  const categorySpentMap = monthlyExpenses.reduce((acc: Record<string, number>, exp: any) => {
    const cat = exp.category;
    acc[cat] = (acc[cat] || 0) + (Number(exp.amount) || 0);
    return acc;
  }, {});


  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold font-display text-text-primary tracking-tight">
            {t("profileAndSettings")}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {t("managePreferences")}
          </p>
        </div>
      </div>



      {/* Row 1 Grid: Unified Profile Card & Financial Summary (Equal Heights) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* LEFT COLUMN: Profile Info & Read-Only Preferences */}
        <div className="bg-bg-surface border border-border-light rounded-xl p-6 shadow-subtle flex flex-col justify-between h-full">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-light">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-brand to-brand-hover flex items-center justify-center text-white text-xl font-bold font-display shadow-medium shrink-0">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold font-display text-text-primary truncate">{name || "User"}</h2>
                  <p className="text-text-secondary text-xs truncate">{email || "test@test.com"}</p>
                </div>
              </div>
              <button
                onClick={handleOpenEdit}
                className="btn-primary px-4 py-2 text-xs font-semibold rounded-lg shadow-sm hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-text-secondary block">
                  Full name
                </span>
                <p className="text-sm font-semibold text-text-primary truncate">{name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-text-secondary block">
                  Email address
                </span>
                <p className="text-sm font-semibold text-text-primary truncate">{email}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-text-secondary block">
                  Default currency
                </span>
                <p className="text-sm font-semibold text-text-primary">
                  {currency === "USD" && "USD ($)"}
                  {currency === "INR" && "INR (₹)"}
                  {currency === "EUR" && "EUR (€)"}
                  {currency === "GBP" && "GBP (£)"}
                  {currency === "JPY" && "JPY (¥)"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-text-secondary block">
                  Total monthly budget cap
                </span>
                <p className="text-sm font-semibold text-text-primary">
                  {formatCurrency(monthlyBudget)}
                </p>
              </div>

              <div className="space-y-1 col-span-2">
                <span className="text-[10px] font-bold tracking-wider text-text-secondary block">
                  Language
                </span>
                <p className="text-sm font-semibold text-text-primary">
                  {language === "en" && "English"}
                  {language === "hi" && "हिन्दी (Hindi)"}
                  {language === "es" && "Español (Spanish)"}
                  {language === "fr" && "Français (French)"}
                  {language === "de" && "Deutsch (German)"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Financial Summary Card */}
        <div className="bg-bg-surface border border-border-light rounded-xl p-6 shadow-subtle flex flex-col justify-between h-full">
          <div className="border-b border-border-light pb-4 mb-4">
            <h3 className="text-base font-bold font-display text-text-primary  tracking-wider">
              Financial Summary
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 flex-grow">
            <div className="p-4 rounded-xl bg-bg-main/30 border border-border-light/60 flex flex-col justify-center">
              <span className="text-[10px] font-bold tracking-wider text-text-secondary block mb-1">
                Monthly Budget
              </span>
              <p className="text-lg  text-text-primary">{formatCurrency(monthlyBudget)}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-bg-main/30 border border-border-light/60 flex flex-col justify-center">
              <span className="text-[10px] font-bold tracking-wider text-text-secondary block mb-1">
                Monthly Spent
              </span>
              <p className="text-lg text-error">{formatCurrency(monthlySpent)}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-bg-main/30 border border-border-light/60 flex flex-col justify-center">
              <span className="text-[10px] font-bold  tracking-wider text-text-secondary block mb-1">
                Monthly Saving
              </span>
              <p className="text-lg text-success">{formatCurrency(monthlySaving)}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-bg-main/30 border border-border-light/60 flex flex-col justify-center">
              <span className="text-[10px] font-bold  tracking-wider text-text-secondary block mb-1">
                Year Saving Goal
              </span>
              <p className="text-lg  text-brand">{formatCurrency(yearSaving)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 Grid: Account Actions & Recurring Bills Status (Perfect Alignment & Equal Heights) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left: Account Actions Card */}
        <div className="bg-bg-surface border border-border-light rounded-xl p-6 shadow-subtle flex flex-col justify-between h-full min-h-[220px]">
          <div>
            <h3 className="text-base font-bold font-display text-text-primary border-b border-border-light pb-3  tracking-wider">
              {t("accountActions")}
            </h3>
            <p className="text-xs text-text-secondary mt-3 leading-relaxed">
              Manage your credentials or close your Spendly account. Warning: account deletion is permanent and all data will be permanently wiped.
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full pt-4">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 h-10 text-xs font-bold rounded-lg bg-error hover:bg-error-hover text-white transition cursor-pointer flex items-center justify-center animate-in fade-in duration-200"
            >
              {t("deleteAccount")}
            </button>
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="flex-1 h-10 text-xs font-bold rounded-lg border border-border-light hover:bg-bg-surface-hover hover:border-border-hover text-text-secondary transition cursor-pointer flex items-center justify-center animate-in fade-in duration-200"
            >
              {t("signOut")}
            </button>
          </div>
        </div>

        {/* Right: Recurring Monthly Bills Status Card */}
        <div className="bg-bg-surface border border-border-light rounded-xl p-6 shadow-subtle flex flex-col justify-between h-full min-h-[220px]">
          <div>
            <div className="border-b border-border-light pb-3 mb-3">
              <span className="text-sm font-bold  tracking-wider text-text-primary block">
                Recurring Monthly Bills Status
              </span>
            </div>
            {currentMonthBudgets.filter(cat => ["house rent", "electricity bill", "internet bill", "gas bill"].includes(cat.name.toLowerCase())).length === 0 ? (
              <p className="text-xs text-text-secondary py-4 text-center">No recurring bills active for this month.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {currentMonthBudgets.filter(cat => ["house rent", "electricity bill", "internet bill", "gas bill"].includes(cat.name.toLowerCase())).map((cat, idx) => {
                  const spent = categorySpentMap[cat.name] || 0;
                  const budget = Number(cat.monthlyBudget) || 0;
                  const status = spent >= budget ? "Paid" : "Unpaid";
                  return (
                    <div key={cat.id || idx} className="flex justify-between items-center p-2 rounded-lg bg-bg-main/30 border border-border-light/20">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="text-base shrink-0">
                          {getCategoryEmoji(cat.name, cat.color)}
                        </span>
                        <span className="text-xs font-semibold text-text-primary truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-[10px] text-text-muted">
                          {formatCurrency(spent)} / {formatCurrency(budget)}
                        </span>
                        <span className={`text-[9px] font-extrabold tracking-wider  px-2 py-0.5 rounded border ${
                          status === "Paid" 
                            ? "bg-success/10 text-success border-success/20" 
                            : "bg-error/10 text-error border-error/20"
                        }`}>
                          {status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PREMIUM SIGN OUT MODAL */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSignOutConfirm(false)}
          />
          <div className="relative bg-bg-surface border border-border-light rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-brand">
              <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-lg font-bold font-display text-text-primary">
                {t("confirmSignOutTitle")}
              </h3>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              {t("confirmSignOutMsg")}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="btn-secondary px-5"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSignOut}
                className="btn-primary px-5 bg-brand hover:bg-brand-hover"
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM DELETE ACCOUNT MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-bg-surface border border-border-light rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-error">
              <div className="h-10 w-10 rounded-full bg-error/10 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold font-display text-text-primary">
                {t("confirmDeleteTitle")}
              </h3>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              {t("confirmDeleteMsg")}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary px-5"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-5 h-11 rounded-md bg-error hover:bg-error-hover text-white transition-all font-semibold text-sm cursor-pointer"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;