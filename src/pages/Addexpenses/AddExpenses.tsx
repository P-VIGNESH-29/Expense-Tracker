import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categoryitems } from "../category/gategory";
import { useSettings } from "../../context/SettingsContext";
import BackButton from "../../components/common/BackButton";
import AlertModal from "../../components/common/AlertModal";
import CustomDatePicker from "../../components/common/CustomDatePicker";
import { AlertTriangle } from "lucide-react";

interface Category {
  type: string;
}

function AddExpenses() {
  const navigate = useNavigate();
  const { t, getCurrencySymbol, monthlyBudget, formatCurrency, currentMonthBudgets, refreshSettings } = useSettings();
  const currentUser = localStorage.getItem("currentUser") || "";
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    refreshSettings();
  }, []);
  
  const [category, setcategory] = useState<string>("");
  const [amount, setamount] = useState<string>("");
  const [date, setdate] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [note, setNote] = useState<string>("");

  const [amountError, setAmountError] = useState("");
  const [dateError, setDateError] = useState("");
  const [categoryError, setCategoryError] = useState("");


  const [showBudgetWarning, setShowBudgetWarning] = useState(false);
  const [warningData, setWarningData] = useState<{
    category: string;
    budget: number;
    spent: number;
    exceeded: number;
    onContinue: () => void;
  } | null>(null);

  // Alert Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"info" | "warning" | "error" | "success" | "confirm">("info");
  const [onModalCloseAction, setOnModalCloseAction] = useState<(() => void) | undefined>(undefined);

  const showAlert = (title: string, message: string, type: "info" | "warning" | "error" | "success" = "info", onCloseAction?: () => void) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setOnModalCloseAction(() => onCloseAction);
    setModalOpen(true);
  };

  const paymentMethods = ["Cash", "Card", "Bank Transfer", "UPI"];

  useEffect(() => {
    const stored = localStorage.getItem(`categories_${currentUser}`);
    let parsed: Category[] = [];
    if (stored) {
      parsed = JSON.parse(stored);
    } else {
      parsed = categoryitems;
    }
    let updated = [...parsed];
    let changed = false;
    categoryitems.forEach(item => {
      if (!updated.some(c => c.type.toLowerCase() === item.type.toLowerCase())) {
        updated.push(item);
        changed = true;
      }
    });
    if (changed || !stored) {
      localStorage.setItem(`categories_${currentUser}`, JSON.stringify(updated));
    }
    setCategories(updated);
  }, [currentUser]);

  const validateAmount = (val: string) => {
    if (!val) {
      setAmountError(t("amountRequired"));
    } else if (Number(val) <= 0) {
      setAmountError(t("amountRequired"));
    } else {
      setAmountError("");
    }
  };

  const validateDate = (val: string) => {
    if (!val) {
      setDateError(t("dateRequired"));
    } else {
      setDateError("");
    }
  };

  const handleCategorySelect = (type: string) => {
    setcategory(type);
    setCategoryError("");
  };

  function addexpenses() {
    validateAmount(amount);
    validateDate(date);
    if (!category) {
      setCategoryError(t("categoryRequired"));
    }

    if (!amount || Number(amount) <= 0 || !date || !category) {
      showAlert("Validation Error", "Please fill in all required fields correctly.", "error");
      return;
    }

    const amtNum = Number(amount);
    const expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser}`) || "[]");
    
    // Check if category budget is exceeded for the expense month
    const expenseDateObj = new Date(date);
    const expMonth = expenseDateObj.getMonth();
    const expYear = expenseDateObj.getFullYear();
    
    const catBudgetObj = currentMonthBudgets.find(
      (c) => c.name.toLowerCase() === category.toLowerCase() && c.enabled
    );

    const saveExpenseData = () => {
      const data = {
        id: Date.now().toString(),
        category,
        amount,
        date,
        paymentMethod,
        note,
      };
      expenses.push(data);
      localStorage.setItem(`expenses_${currentUser}`, JSON.stringify(expenses));
      window.dispatchEvent(new Event("expensesUpdated"));

      // Check total monthly budget cap
      const totalMonthSpent = expenses
        .filter((exp: any) => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === expMonth && expDate.getFullYear() === expYear;
        })
        .reduce((sum: number, exp: any) => sum + Number(exp.amount || 0), 0);

      const budgetCap = Number(monthlyBudget) || 0;
      if (budgetCap > 0 && totalMonthSpent > budgetCap) {
        showAlert(
          "Monthly Budget Cap Exceeded!",
          `Warning: Your total monthly spending has reached ${formatCurrency(totalMonthSpent)}, exceeding your monthly budget cap of ${formatCurrency(budgetCap)}!`,
          "warning",
          () => navigate("../Expenses")
        );
      } else {
        navigate("../Expenses");
      }
    };

    if (catBudgetObj) {
      const catBudgetLimit = Number(catBudgetObj.monthlyBudget) || 0;
      const catSpentBefore = expenses
        .filter((exp: any) => {
          const expDate = new Date(exp.date);
          return (
            expDate.getMonth() === expMonth &&
            expDate.getFullYear() === expYear &&
            exp.category.toLowerCase() === category.toLowerCase()
          );
        })
        .reduce((sum: number, exp: any) => sum + Number(exp.amount || 0), 0);

      const catSpentTotal = catSpentBefore + amtNum;
      if (catBudgetLimit > 0 && catSpentTotal > catBudgetLimit) {
        setWarningData({
          category: catBudgetObj.name,
          budget: catBudgetLimit,
          spent: catSpentTotal,
          exceeded: catSpentTotal - catBudgetLimit,
          onContinue: saveExpenseData
        });
        setShowBudgetWarning(true);
        return;
      }
    }

    saveExpenseData();
  }

  return (
    <div className="space-y-8 w-full">
      <div className="flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold font-display text-text-primary tracking-tight">{t("addExpense")}</h1>
          <p className="text-text-secondary text-sm mt-1">Log a new spending transaction</p>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-light rounded-2xl p-6 space-y-6 shadow-medium w-full">
        {/* Amount Field */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-semibold  tracking-wider text-text-secondary">
            {t("amount")} ({getCurrencySymbol()})
          </label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-semibold">
              {getCurrencySymbol()}
            </span>
            <input
              type="number"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className={`input-field w-full pl-8 ${amountError ? "border-error/50 focus:border-error focus:ring-error/10" : ""}`}
              value={amount}
              onChange={(e) => {
                setamount(e.target.value);
                if (amountError) validateAmount(e.target.value);
              }}
              onBlur={(e) => validateAmount(e.target.value)}
            />
          </div>
          {amountError && <span className="text-error text-xs font-medium">{amountError}</span>}
        </div>

        {/* Date Field */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-semibold  tracking-wider text-text-secondary">{t("date")}</label>
          <CustomDatePicker
            value={date}
            onChange={(val) => {
              setdate(val);
              if (dateError) validateDate(val);
            }}
            className="w-full"
          />
          {dateError && <span className="text-error text-xs font-medium">{dateError}</span>}
        </div>

        {/* Category Selector */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-semibold  tracking-wider text-text-secondary">{t("category")}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categories.map((item) => {
              const isSelected = category === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleCategorySelect(item.type)}
                  className={`h-11 px-3 text-xs font-semibold rounded-md border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-brand border-brand text-white shadow-subtle"
                      : "bg-bg-main border-border-light text-text-secondary hover:border-border-hover hover:text-text-primary"
                  }`}
                >
                  {item.type}
                </button>
              );
            })}
          </div>
          {categoryError && <span className="text-error text-xs font-medium">{categoryError}</span>}
        </div>

        {/* Payment Method Selector */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-semibold  tracking-wider text-text-secondary">Payment Method</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {paymentMethods.map((method) => {
              const isSelected = paymentMethod === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`h-11 px-3 text-xs font-semibold rounded-md border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-brand border-brand text-white shadow-subtle"
                      : "bg-bg-main border-border-light text-text-secondary hover:border-border-hover hover:text-text-primary"
                  }`}
                >
                  {method}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description / Note Field */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-semibold  tracking-wider text-text-secondary">Description / Note</label>
          <input
            type="text"
            placeholder="Add a descriptive note (optional)"
            className="input-field w-full"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Submit & Cancel Actions */}
        <div className="flex space-x-3 pt-4 border-t border-border-light">
           <button onClick={() => navigate("../Expenses")} className="btn-secondary flex-1">
            {t("cancel")}
          </button>
          <button onClick={addexpenses} className="btn-primary flex-1">
            {t("addExpense")}
          </button>
         
        </div>
      </div>

      {/* AlertModal */}
      <AlertModal
        isOpen={modalOpen}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => {
          setModalOpen(false);
          if (onModalCloseAction) onModalCloseAction();
        }}
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
                Adding this expense will exceed the monthly budget configured for <span className="font-bold text-text-primary">{warningData.category}</span>.
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

export default AddExpenses;