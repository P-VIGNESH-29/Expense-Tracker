export interface User {
  name: string;
  email: string;
  password?: string;
  currency?: string;
  monthlyBudget?: string;
  language?: string;
}

export interface Expense {
  date: string;
  category: string;
  amount: string;
}

export interface CategoryDetail {
  color: string;
  bg: string;
  icon: React.ReactNode;
}

export interface DefaultCategory {
  id: string;
  name: string;
  color: string;
  monthlyBudget: string;
  dueDate?: string;
  notes?: string;
  enabled: boolean;
  autoInclude: boolean;
}

