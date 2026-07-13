import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { Trash2, Edit2, X, AlertTriangle, Check } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import AlertModal from "../../components/common/AlertModal";
import CustomSelect from "../../components/common/CustomSelect";
import CustomDatePicker from "../../components/common/CustomDatePicker";
import { categoryitems } from "../category/gategory";

interface Expense {
  id?: string;
  date: string;
  category: string;
  amount: string;
  paymentMethod?: string;
  note?: string;
}

interface Category {
  type: string;
}

function Expenses() {
  const { formatCurrency, t, getCurrencySymbol, monthlyBudget, currentMonthBudgets, refreshSettings } = useSettings();
  const [expenses, setexpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { searchQuery, setSearchQuery } = useOutletContext<{ searchQuery: string; setSearchQuery: (q: string) => void }>();
  const currentUser = localStorage.getItem("currentUser") || "";

  useEffect(() => {
    refreshSettings();
  }, []);

  // Dropdown filtering states
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Edit inline state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<string>("");
  const [editAmount, setEditAmount] = useState<string>("");
  const [editDate, setEditDate] = useState<string>("");
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>("");
  const [editNote, setEditNote] = useState<string>("");

  const [showBudgetWarning, setShowBudgetWarning] = useState(false);
  const [warningData, setWarningData] = useState<{
    category: string;
    budget: number;
    spent: number;
    exceeded: number;
    onContinue: () => void;
  } | null>(null);

  // Alert/Confirm Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"info" | "warning" | "error" | "success" | "confirm">("info");
  const [modalAction, setModalAction] = useState<(() => void) | undefined>(undefined);

  const showAlert = (title: string, message: string, type: "info" | "warning" | "error" | "success" = "info") => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalAction(undefined);
    setModalOpen(true);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: "confirm" | "warning" = "confirm") => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalAction(() => onConfirm);
    setModalOpen(true);
  };

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(`expenses_${currentUser}`) || "[]");
    setexpenses(data);

    // Get categories for the filter dropdown
    const storedCats = localStorage.getItem(`categories_${currentUser}`);
    let parsedCats: Category[] = [];
    if (storedCats) {
      parsedCats = JSON.parse(storedCats);
    } else {
      parsedCats = categoryitems;
    }
    let updatedCats = [...parsedCats];
    let changedCats = false;
    categoryitems.forEach(item => {
      if (!updatedCats.some(c => c.type.toLowerCase() === item.type.toLowerCase())) {
        updatedCats.push(item);
        changedCats = true;
      }
    });
    if (changedCats || !storedCats) {
      localStorage.setItem(`categories_${currentUser}`, JSON.stringify(updatedCats));
    }
    setCategories(updatedCats);
  }, [currentUser]);

  const handleStartEdit = (expense: Expense, idx: number) => {
    const currentKey = expense.id || idx.toString();
    setEditingId(currentKey);
    setEditCategory(expense.category);
    setEditAmount(expense.amount);
    setEditDate(expense.date);
    setEditPaymentMethod(expense.paymentMethod || "Cash");
    setEditNote(expense.note || "");
  };

  const handleSaveEdit = (originalExpense: Expense, idx: number) => {
    if (!editCategory) {
      showAlert("Validation Error", t("categoryRequired"), "error");
      return;
    }
    if (Number(editAmount) <= 0 || isNaN(Number(editAmount))) {
      showAlert("Validation Error", t("amountRequired"), "error");
      return;
    }
    if (!editDate) {
      showAlert("Validation Error", t("dateRequired"), "error");
      return;
    }

    const updated = expenses.map((exp, index) => {
      const expKey = exp.id || index.toString();
      const origKey = originalExpense.id || idx.toString();
      if (expKey === origKey) {
        return {
          ...exp,
          date: editDate,
          category: editCategory,
          amount: editAmount,
          paymentMethod: editPaymentMethod,
          note: editNote,
        };
      }
      return exp;
    });

    const expenseDateObj = new Date(editDate);
    const expMonth = expenseDateObj.getMonth();
    const expYear = expenseDateObj.getFullYear();
    
    const catBudgetObj = currentMonthBudgets.find(
      (c) => c.name.toLowerCase() === editCategory.toLowerCase() && c.enabled
    );

    const saveUpdatedExpenses = () => {
      setexpenses(updated);
      localStorage.setItem(`expenses_${currentUser}`, JSON.stringify(updated));
      setEditingId(null);

      // Notify other components (Dashboard)
      window.dispatchEvent(new Event("expensesUpdated"));

      // Check total monthly budget cap
      const monthlyTotal = updated
        .filter((exp) => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === expMonth && expDate.getFullYear() === expYear;
        })
        .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

      const budgetLimit = Number(monthlyBudget) || 0;
      if (budgetLimit > 0 && monthlyTotal > budgetLimit) {
        showAlert(
          "Monthly Budget Cap Exceeded!",
          `Warning: Your total monthly spending has reached ${formatCurrency(monthlyTotal)}, exceeding your monthly budget cap of ${formatCurrency(budgetLimit)}!`,
          "warning"
        );
      }
    };

    if (catBudgetObj) {
      const catBudgetLimit = Number(catBudgetObj.monthlyBudget) || 0;
      const catSpentTotal = updated
        .filter((exp) => {
          const expDate = new Date(exp.date);
          return (
            expDate.getMonth() === expMonth &&
            expDate.getFullYear() === expYear &&
            exp.category.toLowerCase() === editCategory.toLowerCase()
          );
        })
        .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

      if (catBudgetLimit > 0 && catSpentTotal > catBudgetLimit) {
        setWarningData({
          category: catBudgetObj.name,
          budget: catBudgetLimit,
          spent: catSpentTotal,
          exceeded: catSpentTotal - catBudgetLimit,
          onContinue: saveUpdatedExpenses
        });
        setShowBudgetWarning(true);
        return;
      }
    }

    saveUpdatedExpenses();
  };

  const handleDelete = (id: string | undefined, idx: number) => {
    showConfirm(
      "Delete Expense",
      "Are you sure you want to delete this expense log?",
      () => {
        const filtered = expenses.filter((exp, index) => {
          const expKey = exp.id || index.toString();
          const targetKey = id || idx.toString();
          return expKey !== targetKey;
        });

        setexpenses(filtered);
        localStorage.setItem(`expenses_${currentUser}`, JSON.stringify(filtered));

        // Notify other components
        window.dispatchEvent(new Event("expensesUpdated"));
      },
      "warning"
    );
  };

  const filteredExpenses = expenses.filter((expense) => {
    const q = searchQuery.toLowerCase();
    const cat = (expense.category || "").toLowerCase();
    const note = (expense.note || "").toLowerCase();
    const amt = (expense.amount || "").toString();

    const matchesSearch =
      cat.includes(q) || note.includes(q) || amt.includes(q);

    const matchesCategory =
      selectedCategory === "All" || expense.category === selectedCategory;

    const matchesDate = !selectedDate || expense.date === selectedDate;

    return matchesSearch && matchesCategory && matchesDate;
  });

  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header section with title and dominant primary action */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display text-text-primary tracking-tight">{t("expenses")}</h1>
          <p className="text-text-secondary text-sm mt-1">Track and manage your spending logs</p>
        </div>

        {expenses.length > 0 && (
          <button
            className="btn-primary"
            onClick={() => navigate("../Addexpenses")}
          >
            {t("addExpense")}
          </button>
        )}
      </div>

      {expenses.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center text-center p-12 bg-bg-surface border border-border-light rounded-lg shadow-subtle min-h-[300px]">
          <div className="h-12 w-12 rounded-full bg-brand-light flex items-center justify-center mb-4 text-brand">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold font-display text-text-primary mb-2">{t("noExpensesYet")}</h3>
          <p className="text-text-secondary text-sm max-w-sm mb-6">
            Get started by logging your first expense. We'll track your spend and categorize it automatically.
          </p>
          <button
            className="btn-primary"
            onClick={() => navigate("../Addexpenses")}
          >
            {t("addNewExpense")}
          </button>
        </div>
      ) : (
        <>
          {/* Top Filter Bar */}
          <div className="w-full bg-bg-surface border border-border-light p-4 rounded-xl shadow-subtle mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              
              {/* Left Side: Search Filter */}
              <div className="flex-grow max-w-md">
                <span className="text-[10px]  font-bold tracking-wider text-text-muted mb-1 block">Search Transactions</span>
                <div className="relative">
                 
                  <input
                    type="text"
                    placeholder="Search note, category, amount..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field w-full pl-9 pr-8 placeholder:text-text-muted text-sm h-10 rounded-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Right Side: Category and Date filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                {/* Category Filter */}
                <div className="flex flex-col gap-1 sm:w-48">
                  <span className="text-[10px]  font-bold tracking-wider text-text-muted">{t("category")}</span>
                  <CustomSelect
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    options={[
                      { value: "All", label: "All Categories" },
                      ...categories.map((cat) => ({ value: cat.type, label: cat.type }))
                    ]}
                    className="w-full"
                  />
                </div>

                {/* Date Filter */}
                <div className="flex flex-col gap-1 sm:w-48">
                  <span className="text-[10px]  font-bold tracking-wider text-text-muted">{t("filterByDate")}</span>
                  <CustomDatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    clearable={true}
                    className="w-full"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-bg-surface border border-border-light rounded-lg overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border-light bg-bg-surface-hover/50">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary font-display w-32">{t("date")}</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary font-display w-40">{t("category")}</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary font-display w-40">Method</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary font-display">Description / Note</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary font-display text-right w-36">{t("amount")}</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary font-display text-center w-28">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-text-secondary">
                        No transactions match your filters or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense, index) => {
                      const currentKey = expense.id || index.toString();
                      const isEditing = editingId === currentKey;

                      if (isEditing) {
                        return (
                          <tr key={currentKey} className="border-b border-border-light bg-brand-light/5">
                            {/* Edit Date */}
                            <td className="px-6 py-3">
                              <CustomDatePicker
                                value={editDate}
                                onChange={setEditDate}
                                className="w-full"
                              />
                            </td>
                            {/* Edit Category */}
                            <td className="px-6 py-3">
                              <CustomSelect
                                value={editCategory}
                                onChange={setEditCategory}
                                options={categories.map((cat) => ({ value: cat.type, label: cat.type }))}
                                className="w-full"
                              />
                            </td>
                            {/* Edit Payment Method */}
                            <td className="px-6 py-3">
                              <CustomSelect
                                value={editPaymentMethod}
                                onChange={setEditPaymentMethod}
                                options={[
                                  { value: "Cash", label: "Cash" },
                                  { value: "Card", label: "Card" },
                                  { value: "Bank Transfer", label: "Bank Transfer" },
                                  { value: "UPI", label: "UPI" },
                                ]}
                                className="w-full"
                              />
                            </td>
                            {/* Edit Note */}
                            <td className="px-6 py-3">
                              <input
                                type="text"
                                value={editNote}
                                onChange={(e) => setEditNote(e.target.value)}
                                className="input-field h-9 w-full text-sm"
                                placeholder="Description"
                              />
                            </td>
                            {/* Edit Amount */}
                            <td className="px-6 py-3">
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
                                  {getCurrencySymbol()}
                                </span>
                                <input
                                  type="number"
                                  value={editAmount}
                                  onChange={(e) => setEditAmount(e.target.value)}
                                  className="input-field h-9 w-full text-sm pl-5 text-right font-semibold"
                                  min="0.01"
                                  step="0.01"
                                />
                              </div>
                            </td>
                            {/* Edit Actions */}
                            <td className="px-6 py-3 text-center">
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(expense, index)}
                                  className="p-1.5 rounded-full text-success bg-success/10 hover:bg-success hover:text-white hover:scale-105 active:scale-95 focus:ring-2 focus:ring-success/50 transition-all duration-150 cursor-pointer shadow-sm hover:shadow"
                                  title="Save Changes"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="p-1.5 rounded-full text-text-secondary border border-border-light hover:bg-error hover:border-transparent hover:text-white hover:scale-105 active:scale-95 focus:ring-2 focus:ring-error/50 transition-all duration-150 cursor-pointer shadow-sm hover:shadow"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr
                          key={currentKey}
                          className="border-b border-border-light hover:bg-bg-surface-hover/30 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 text-sm text-text-primary">{formatDate(expense.date)}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-brand/10 text-brand">
                              {expense.category || "Other"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary">{expense.paymentMethod || "Cash"}</td>
                          <td className="px-6 py-4 text-sm text-text-muted italic max-w-xs truncate" title={expense.note}>
                            {expense.note || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-text-primary text-right font-semibold font-display">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => handleStartEdit(expense, index)}
                                className="p-1.5 rounded-md text-text-muted hover:text-brand hover:bg-brand/10 transition-all duration-150 cursor-pointer"
                                title="Edit Expense"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(expense.id, index)}
                                className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error/10 transition-all duration-150 cursor-pointer"
                                title="Delete Expense"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Reusable AlertModal */}
      <AlertModal
        isOpen={modalOpen}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalOpen(false)}
        onConfirm={modalAction}
      />

      {/* Category Budget Exceeded Warning Modal */}
      {showBudgetWarning && warningData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBudgetWarning(false)} />
          <div className="relative bg-bg-surface border border-border-light rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-warning">
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-lg font-bold font-display text-text-primary">
                Category Budget Exceeded!
              </h3>
            </div>

            <div className="space-y-3 text-sm text-text-secondary">
              <p>
                Modifying this expense will exceed the monthly budget configured for <span className="font-bold text-text-primary">{warningData.category}</span>.
              </p>
              <div className="p-3 bg-bg-main/50 rounded-lg border border-border-light/40 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span>Configured Budget:</span>
                  <span className="font-semibold text-text-primary">{formatCurrency(warningData.budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Projected Spending:</span>
                  <span className="font-semibold text-error">{formatCurrency(warningData.spent)}</span>
                </div>
                <div className="flex justify-between border-t border-border-light/40 pt-1.5">
                  <span className="font-medium text-text-primary">Exceeded Amount:</span>
                  <span className="font-bold text-error">{formatCurrency(warningData.exceeded)}</span>
                </div>
              </div>
              <p className="text-xs italic text-text-muted">
                Would you like to log this expense anyway or adjust the budget limit?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:justify-end border-t border-border-light/40">
              <button
                type="button"
                onClick={() => setShowBudgetWarning(false)}
                className="btn-secondary px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBudgetWarning(false);
                  navigate("/Layout/ProfileSettings");
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-brand/20 bg-brand/10 text-brand hover:bg-brand hover:text-white transition cursor-pointer"
              >
                Edit Budget
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBudgetWarning(false);
                  warningData.onContinue();
                }}
                className="btn-primary px-4 py-2 text-xs font-semibold rounded-lg bg-warning hover:bg-warning-hover text-white border-transparent cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;