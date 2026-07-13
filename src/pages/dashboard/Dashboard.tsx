import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/card/Card";
// import router from "../../routes/routes";
import { useSettings } from "../../context/SettingsContext";

// Category color map — mirrors Categories.tsx
const categoryColors: { [key: string]: string } = {
  "Food & Drink": "#F2B263",
  "Transport": "#7C9CFF",
  "Shopping": "#C47CFF",
  "Entertainment": "#5FD7A3",
  "Housing": "#F27878",
  "Health": "#FF9E7C",
  "Utilities": "#7CC8FF",
  "Other": "#8B90A0",
};

function getCategoryColor(categories: any[], categoryName: string): string {
  const cat = categories.find((c: any) => c.type === categoryName);
  if (cat?.color) return cat.color;
  return categoryColors[categoryName] || "#8B90A0";
}

// ── Spending by Category Card ────────────────────────────────────────────────
interface CategoryRow {
  name: string;
  total: number;
  color: string;
}

function SpendingByCategoryCard({ expenses, userCategories }: { expenses: any[]; userCategories: any[] }) {
  const { formatCurrency, t } = useSettings();
  const categoryMap: { [key: string]: number } = {};
  expenses.forEach((exp) => {
    const cat = exp.category || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + Number(exp.amount || 0);
  });

  const rows: CategoryRow[] = Object.entries(categoryMap)
    .map(([name, total]) => ({
      name,
      total,
      color: getCategoryColor(userCategories, name),
    }))
    .sort((a, b) => b.total - a.total);

  const maxTotal = rows.length > 0 ? rows[0].total : 1;

  return (
    <div className="bg-bg-surface border border-border-light rounded-xl p-6 shadow-subtle hover:border-border-hover hover:shadow-medium transition-all duration-200">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold font-display text-text-primary">{t("spendingByCategory")}</h2>
          <p className="text-xs text-text-muted mt-0.5">{t("allTimeTotals")}</p>
        </div>
        <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center mb-3 text-brand">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">{t("noExpensesYet")}</p>
          <p className="text-xs text-text-muted">{t("addExpensesToSeeBreakdown")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const barWidth = maxTotal > 0 ? (row.total / maxTotal) * 100 : 0;
            return (
              <div
                key={row.name}
                className="group flex flex-col gap-1.5 rounded-lg p-2 -mx-2 hover:bg-bg-surface-hover/50 transition-colors duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: row.color }}
                    />
                    <span className="text-sm font-medium text-text-primary truncate">{row.name}</span>
                  </div>
                  <span className="text-sm font-bold font-display text-text-primary ml-4 shrink-0">
                    {formatCurrency(row.total)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full bg-border-light rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${barWidth}%`, backgroundColor: row.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Recent Transactions Card ─────────────────────────────────────────────────
interface RecentTransaction {
  category: string;
  amount: string;
  date: string;
  color: string;
}

function RecentTransactionsCard({ expenses, userCategories }: { expenses: any[]; userCategories: any[] }) {
  const navigate = useNavigate();
  const { formatCurrency, t } = useSettings();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Sort newest first and take only 8
  const recent: RecentTransaction[] = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8)
    .map((exp) => ({
      category: exp.category || "Other",
      amount: exp.amount,
      date: exp.date,
      color: getCategoryColor(userCategories, exp.category || "Other"),
    }));
  //abcd
  return (
    <div className="bg-bg-surface border border-border-light rounded-xl p-6 shadow-subtle hover:border-border-hover hover:shadow-medium transition-all duration-200">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold font-display text-text-primary">{t("recentTransactions")}</h2>
          <p className="text-xs text-text-muted mt-0.5">{t("yourLatestEntries")}</p>
        </div>
        <button
          onClick={() => navigate("/Layout/Expenses")}
          className="text-xs font-semibold text-brand hover:text-brand-hover hover:underline transition-colors duration-150 cursor-pointer"
        >
          View All →
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center mb-3 text-brand">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">{t("noExpensesYet")}</p>
          <p className="text-xs text-text-muted">{t("addExpensesToSeeBreakdown")}</p>
        </div>
      ) : (
        <div className="divide-y divide-border-light">
          {recent.map((tx, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-3 group hover:bg-bg-surface-hover/40 -mx-2 px-2 rounded-lg transition-colors duration-150"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Color dot */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${tx.color}18` }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tx.color }}
                  />
                </div>
                {/* Category + Date */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{tx.category}</p>
                  <p className="text-xs text-text-muted">{formatDate(tx.date)}</p>
                </div>
              </div>
              {/* Amount */}
              <span className="text-sm font-bold font-display text-text-primary ml-3 shrink-0">
                {formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
function Dashboard() {
  const { formatCurrency, t, refreshSettings } = useSettings();
  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  useEffect(() => {
    refreshSettings();
  }, []);

  const currentUser = localStorage.getItem("currentUser") || "";

  const loadExpenses = useCallback(() => {
    return JSON.parse(localStorage.getItem(`expenses_${currentUser}`) || "[]");
  }, [currentUser]);

  const loadCategories = useCallback(() => {
    return JSON.parse(localStorage.getItem(`categories_${currentUser}`) || "[]");
  }, [currentUser]);

  const [expenses, setExpenses] = useState<any[]>(loadExpenses);
  const [userCategories, setUserCategories] = useState<any[]>(loadCategories);

  const refreshData = useCallback(() => {
    setExpenses(loadExpenses());
    setUserCategories(loadCategories());
    refreshSettings();
  }, [loadExpenses, loadCategories, refreshSettings]);

  useEffect(() => {
    window.addEventListener("storage", refreshData);
    window.addEventListener("expensesUpdated", refreshData);
    return () => {
      window.removeEventListener("storage", refreshData);
      window.removeEventListener("expensesUpdated", refreshData);
    };
  }, [refreshData]);

  const total = expenses.reduce((sum: number, expense: any) => sum + Number(expense.amount || 0), 0);

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const currentMonthTotal = expenses
    .filter((expense: any) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    })
    .reduce((sum: number, expense: any) => sum + Number(expense.amount || 0), 0);

  // Calculate top category
  const categoryMap: { [key: string]: number } = {};
  expenses.forEach((expense: any) => {
    const cat = expense.category || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + Number(expense.amount || 0);
  });

  let topcat = "None";
  let maxAmount = 0;
  Object.entries(categoryMap).forEach(([cat, amt]) => {
    if (amt > maxAmount) {
      maxAmount = amt;
      topcat = cat;
    }
  });

  const dashboxitems = [
    {
      name: t("totalSpend"),
      value: formatCurrency(total),
      color: "text-[#7c9cff]",
      icon: (
        <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: t("monthlyOverview"),
      value: formatCurrency(currentMonthTotal),
      color: "text-[#5fd7a3]",
      icon: (
        <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: t("categoryBreakdown"),
      value: topcat,
      color: "text-[#f27878]",
      icon: (
        <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-text-primary tracking-tight">{t("dashboard")}</h1>
        <p className="text-text-secondary text-sm mt-1">{dayName}, {formattedDate}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboxitems.map((item, index) => (
          <Card
            key={index}
            heading={item.name}
            value={item.value}
            color={item.color}
            icon={item.icon}
          />
        ))}
      </div>



      {/* New Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingByCategoryCard expenses={expenses} userCategories={userCategories} />
        <RecentTransactionsCard expenses={expenses} userCategories={userCategories} />
      </div>
    </div>
  );
}

export default Dashboard;
