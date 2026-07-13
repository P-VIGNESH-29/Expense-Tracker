import { categoryitems } from "../category/gategory";
import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { getCategoryEmoji, emojiList } from "../../utils/emojiHelper";
import AlertModal from "../../components/common/AlertModal";

// Category color hex codes
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

interface Category {
  type: string;
  color?: string;
}



function Categories() {
  const { t, defaultCategories, formatCurrency } = useSettings();
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const currentUser = localStorage.getItem("currentUser") || "";
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);

  // Alert/Confirm Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"info" | "warning" | "error" | "success" | "confirm">("info");
  const [modalAction, setModalAction] = useState<(() => void) | undefined>(undefined);

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: "confirm" | "warning" = "confirm") => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalAction(() => onConfirm);
    setModalOpen(true);
  };

  // Load user categories or initialize with default categories
  useEffect(() => {
    const stored = localStorage.getItem(`categories_${currentUser}`);
    let parsed: Category[] = [];
    if (stored) {
      try {
        parsed = JSON.parse(stored);
      } catch (e) {
        parsed = categoryitems;
      }
    } else {
      parsed = categoryitems;
    }

    // Filter out "Housing"
    let updated = parsed.filter(c => c.type.toLowerCase() !== "housing");
    let changed = (updated.length !== parsed.length);

    // Ensure all categories in categoryitems exist (except Housing)
    categoryitems.forEach(item => {
      if (item.type.toLowerCase() === "housing") return;
      if (!updated.some(c => c.type.toLowerCase() === item.type.toLowerCase())) {
        updated.push(item);
        changed = true;
      }
    });

    if (changed || !stored) {
      localStorage.setItem(`categories_${currentUser}`, JSON.stringify(updated));
    }
    setCategories(updated);

    const expensesKey = `expenses_${currentUser}`;
    const expensesList = JSON.parse(localStorage.getItem(expensesKey) || "[]");
    setExpenses(expensesList);
  }, [currentUser]);

  const saveCategoriesToStorage = (updatedList: Category[]) => {
    localStorage.setItem(`categories_${currentUser}`, JSON.stringify(updatedList));
    setCategories(updatedList);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrimmed = newCategoryName.trim();
    if (!nameTrimmed) {
      setErrorMsg(t("categoryRequired"));
      return;
    }
    if (!selectedColor) {
      setErrorMsg("Please select a color");
      return;
    }

    if (categories.some((c) => c.type.toLowerCase() === nameTrimmed.toLowerCase())) {
      setErrorMsg("Category already exists");
      return;
    }

    setErrorMsg("");
    const updated = [...categories, { type: nameTrimmed, color: selectedColor }];
    saveCategoriesToStorage(updated);
    setNewCategoryName("");
    setSelectedColor("");
    setIsAdding(false);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setNewCategoryName("");
    setSelectedColor("");
    setErrorMsg("");
  };

  const handleStartEdit = (index: number, item: Category) => {
    setIsAdding(false);
    setEditingIndex(index);
    setNewCategoryName(item.type);
    setSelectedColor(item.color || categoryColors[item.type] || "#8B90A0");
    setErrorMsg("");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex === null) return;
    
    const index = editingIndex;
    const oldName = categories[index].type;
    const newNameTrimmed = newCategoryName.trim();
    if (!newNameTrimmed) {
      setErrorMsg(t("categoryRequired"));
      return;
    }
    if (!selectedColor) {
      setErrorMsg("Please select a color");
      return;
    }

    if (
      categories.some(
        (c, idx) => idx !== index && c.type.toLowerCase() === newNameTrimmed.toLowerCase()
      )
    ) {
      setErrorMsg("Category already exists");
      return;
    }

    setErrorMsg("");
    const updated = [...categories];
    updated[index] = { ...updated[index], type: newNameTrimmed, color: selectedColor };
    saveCategoriesToStorage(updated);

    const expensesKey = `expenses_${currentUser}`;
    const expensesList = JSON.parse(localStorage.getItem(expensesKey) || "[]");
    const updatedExpenses = expensesList.map((exp: any) => {
      if (exp.category === oldName) {
        return { ...exp, category: newNameTrimmed };
      }
      return exp;
    });
    localStorage.setItem(expensesKey, JSON.stringify(updatedExpenses));
    setExpenses(updatedExpenses);

    resetForm();
  };

  const handleDeleteCategory = (index: number) => {
    const catName = categories[index].type;
    
    showConfirm(
      "Delete Category",
      `Are you sure you want to delete the category "${catName}"? Existing transactions in this category will fall back to "Other".`,
      () => {
        const updated = categories.filter((_, idx) => idx !== index);
        saveCategoriesToStorage(updated);

        const expensesKey = `expenses_${currentUser}`;
        const expensesList = JSON.parse(localStorage.getItem(expensesKey) || "[]");
        const updatedExpenses = expensesList.map((exp: any) => {
          if (exp.category === catName) {
            return { ...exp, category: "Other" };
          }
          return exp;
        });
        localStorage.setItem(expensesKey, JSON.stringify(updatedExpenses));
        setExpenses(updatedExpenses);
        
        // If we are currently editing the category being deleted, exit edit mode
        if (editingIndex === index) {
          resetForm();
        }
      },
      "warning"
    );
  };

  const filteredCategories = categories.filter((c) =>
    c.type.toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
        
          <div>
            <h1 className="text-3xl font-bold font-display text-text-primary tracking-tight">{t("categories")}</h1>
            <p className="text-text-secondary text-sm mt-1">{filteredCategories.length} of {categories.length} {t("categories")}</p>
          </div>
        </div>

        <button
          onClick={() => {
            if (isAdding) {
              resetForm();
            } else {
              setEditingIndex(null);
              setIsAdding(true);
              setNewCategoryName("");
              setSelectedColor("");
              setErrorMsg("");
            }
          }}
          className="flex items-center gap-2 px-4 h-11 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add</span>
        </button>
      </div>

      {/* Inline New/Edit Category Form */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isAdding || editingIndex !== null ? "max-h-[500px] opacity-100 mb-2" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <form onSubmit={editingIndex !== null ? handleSaveEdit : handleAddCategory} className="bg-bg-surface border border-border-light rounded-2xl p-6 shadow-medium space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold font-display text-text-primary">
              {editingIndex !== null ? "Edit Category" : "New Category"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary  tracking-wider">
                Category Name
              </label>
              <input
                type="text"
                placeholder="e.g. Subscriptions"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                className="input-field w-full"
              />
            </div>

            {/* Predefined Colors Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary">
                Category symbol / emoji
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-2.5 pt-1">
                {emojiList.map((item) => {
                  const isSelected = selectedColor === item.emoji;
                  return (
                    <button
                      key={item.emoji}
                      type="button"
                      onClick={() => {
                        setSelectedColor(item.emoji);
                        if (errorMsg) setErrorMsg("");
                      }}
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
          </div>

          {errorMsg && (
            <div className="text-error text-sm font-semibold flex items-center space-x-1 animate-pulse">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              className="btn-primary px-6"
            >
              {editingIndex !== null ? "Update Category" : "Add Category"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary px-6"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Categories Content */}
      <div className="space-y-10">
        {/* Section 1: Default Monthly Bills */}
        {(() => {
          const builtInNames = ["House Rent", "Electricity Bill", "Internet Bill", "Gas Bill"];
          const builtInBills = builtInNames.map(name => {
            return filteredCategories.find(c => c.type.toLowerCase() === name.toLowerCase());
          }).filter(Boolean) as Category[];

          if (builtInBills.length === 0) return null;

          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold font-display  tracking-wider text-text-secondary">
                  Default Monthly Bills
                </h2>
                <div className="h-[1px] bg-border-light flex-grow" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {builtInBills.map((item) => {
                  const originalIndex = categories.findIndex((c) => c.type === item.type);
                  const color = item.color || categoryColors[item.type] || "#8B90A0";
                  const expenseCount = expenses.filter((e) => e.category === item.type).length;

                  return (
                    <div
                      key={item.type + "_" + originalIndex}
                      className="bg-bg-surface border border-border-light rounded-xl p-5 shadow-subtle hover:shadow-medium hover:border-border-hover transition-all duration-200 relative group flex flex-col justify-between min-h-[140px]"
                    >
                      {/* Actions overlay (Only Edit) */}
                      

                      {/* Top Part: Indicator & Info */}
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-bg-surface-hover border border-border-light text-2xl"
                        >
                          {getCategoryEmoji(item.type, color)}
                        </div>
                        <div className="pr-16 truncate">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="font-bold text-base text-text-primary font-display leading-snug truncate" title={item.type}>
                              {item.type}
                            </h3>
                            
                          </div>
                          <span className="text-xs text-text-secondary block">
                            {expenseCount} {expenseCount === 1 ? "expense" : "expenses"}
                          </span>
                          {(() => {
                            const correspondingDefault = defaultCategories.find(c => c.name.toLowerCase() === item.type.toLowerCase());
                            return correspondingDefault ? (
                              <span className="text-xs font-semibold text-brand block mt-0.5">
                                Budget: {formatCurrency(correspondingDefault.monthlyBudget)}
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Section 2: Custom Categories */}
        {(() => {
          const builtInNames = ["house rent", "electricity bill", "internet bill", "gas bill"];
          const customCats = filteredCategories.filter(c => 
            !builtInNames.includes(c.type.toLowerCase())
          );

          if (customCats.length === 0) return null;

          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold font-display  tracking-wider text-text-secondary">
                  Custom Categories
                </h2>
                <div className="h-[1px] bg-border-light flex-grow" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {customCats.map((item) => {
                  const originalIndex = categories.findIndex((c) => c.type === item.type);
                  const color = item.color || categoryColors[item.type] || "#8B90A0";
                  const expenseCount = expenses.filter((e) => e.category === item.type).length;

                  return (
                    <div
                      key={item.type + "_" + originalIndex}
                      className="bg-bg-surface border border-border-light rounded-xl p-5 shadow-subtle hover:shadow-medium hover:border-border-hover transition-all duration-200 relative group flex flex-col justify-between min-h-[140px]"
                    >
                      {/* Actions overlay (Edit + Delete) */}
                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(originalIndex, item)}
                          className="p-2 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition-all duration-200 cursor-pointer"
                          title="Edit Category"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {item.type !== "Other" && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(originalIndex)}
                            className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-all duration-200 cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Top Part: Indicator & Info */}
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-bg-surface-hover border border-border-light text-2xl"
                        >
                          {getCategoryEmoji(item.type, color)}
                        </div>
                        <div className="pr-16 truncate">
                          <h3 className="font-bold text-base text-text-primary font-display leading-snug truncate" title={item.type}>
                            {item.type}
                          </h3>
                          <span className="text-xs text-text-secondary">
                            {expenseCount} {expenseCount === 1 ? "expense" : "expenses"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* AlertModal */}
      <AlertModal
        isOpen={modalOpen}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalOpen(false)}
        onConfirm={modalAction}
      />
    </div>
  );
}

export default Categories;