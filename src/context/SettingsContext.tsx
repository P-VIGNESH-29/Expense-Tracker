import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, DefaultCategory } from "../types";

export type LanguageType = "en" | "hi" | "es" | "fr" | "de";
export type CurrencyType = "USD" | "INR" | "EUR" | "GBP" | "JPY";

export interface SettingsContextType {
  language: LanguageType;
  currency: CurrencyType;
  monthlyBudget: string;
  name: string;
  email: string;
  updateSettings: (updates: {
    name: string;
    email: string;
    currency: CurrencyType;
    monthlyBudget: string;
    language: LanguageType;
  }) => boolean;
  t: (key: string) => string;
  formatCurrency: (val: number | string) => string;
  getCurrencySymbol: () => string;
  refreshSettings: () => void;
  defaultCategories: DefaultCategory[];
  updateDefaultCategories: (cats: DefaultCategory[]) => void;
  currentMonthBudgets: DefaultCategory[];
  updateCurrentMonthBudgets: (cats: DefaultCategory[]) => void;
  getBudgetStatus: (spent: number, budget: number) => "Safe" | "Near Limit" | "Exceeded";
  getBillStatus: (spent: number, budget: number) => "Paid" | "Unpaid";
}


const translations: Record<LanguageType, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    expenses: "Expenses",
    categories: "Categories",
    profile: "Profile",
    welcomeBack: "Welcome back",
    searchPlaceholder: "Search by category or amount...",
    logOut: "Log Out",
    spendingByCategory: "Spending by Category",
    allTimeTotals: "All-time totals per category",
    noExpensesYet: "No expenses yet",
    addExpensesToSeeBreakdown: "Add expenses to see spending breakdown",
    recentTransactions: "Recent Transactions",
    yourLatestEntries: "Your latest entries",
    totalSpend: "Total Spend",
    monthlyBudgetCap: "Monthly Budget Cap",
    budgetStatus: "Budget Status",
    monthlyOverview: "Monthly Overview",
    categoryBreakdown: "Category Breakdown",
    manageExpenses: "Manage Expenses",
    summary: "Summary",
    totalBudget: "Total Budget",
    safeToSpend: "Safe to Spend",
    budgetExceeded: "Budget Exceeded!",
    withinBudget: "Within Budget",
    filterByCategory: "Filter by Category",
    selectCategory: "Select Category",
    filterByDate: "Filter by Date",
    clearFilters: "Clear Filters",
    addExpense: "Add Expense",
    date: "Date",
    category: "Category",
    amount: "Amount",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    addNewExpense: "Add New Expense",
    categoryRequired: "Category is required",
    amountRequired: "Amount must be a positive number",
    dateRequired: "Date is required",
    saveChanges: "Save Changes",
    manageCategories: "Manage Categories",
    customiseCategories: "Customise your spending categories, colors and budget limits",
    createCategory: "Create Category",
    categoryName: "Category Name",
    colorHex: "Color Hex Code",
    addCustomCategory: "Add Custom Category",
    categoryList: "Category List",
    budgetLimit: "Budget Limit",
    profileAndSettings: "Profile & Settings",
    managePreferences: "Manage your account preferences and budget limits",
    personalDetails: "Personal Details",
    fullName: "Full Name",
    emailAddress: "Email Address",
    defaultCurrency: "Default Currency",
    monthlyBudgetCapLabel: "Monthly Budget Cap",
    languageLabel: "Language",
    preferencesAndBudgets: "Preferences & Budgets",
    editProfile: "Edit Profile",
    saveSettings: "Save Settings",
    preferencesSaved: "Preferences saved successfully!",
    accountActions: "Account Actions",
    signOut: "Sign Out",
    deleteAccount: "Delete Account",
    confirmSignOutTitle: "Sign Out Confirmation",
    confirmSignOutMsg: "Are you sure you want to sign out of your account?",
    confirmDeleteTitle: "Delete Account Permanently?",
    confirmDeleteMsg: "Are you absolutely sure you want to delete your account? This action is irreversible. All of your transactions, categories, and settings will be permanently wiped.",
    cancel: "Cancel",
    confirm: "Confirm"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    expenses: "खर्च",
    categories: "श्रेणियाँ",
    profile: "प्रोफ़ाइल",
    welcomeBack: "स्वागत है",
    searchPlaceholder: "श्रेणी या राशि द्वारा खोजें...",
    logOut: "लॉग आउट",
    spendingByCategory: "श्रेणी के अनुसार खर्च",
    allTimeTotals: "प्रति श्रेणी कुल खर्च",
    noExpensesYet: "अभी तक कोई खर्च नहीं",
    addExpensesToSeeBreakdown: "खर्च का विश्लेषण देखने के लिए खर्च जोड़ें",
    recentTransactions: "हाल के लेन-देन",
    yourLatestEntries: "आपकी नवीनतम प्रविष्टियाँ",
    totalSpend: "कुल खर्च",
    monthlyBudgetCap: "मासिक बजट सीमा",
    budgetStatus: "बजट स्थिति",
    monthlyOverview: "मासिक अवलोकन",
    categoryBreakdown: "श्रेणी विश्लेषण",
    manageExpenses: "खर्चों का प्रबंधन",
    summary: "सारांश",
    totalBudget: "कुल बजट",
    safeToSpend: "खर्च करने के लिए सुरक्षित",
    budgetExceeded: "बजट पार हो गया!",
    withinBudget: "बजट के भीतर",
    filterByCategory: "श्रेणी के अनुसार फ़िल्टर करें",
    selectCategory: "श्रेणी चुनें",
    filterByDate: "तिथि के अनुसार फ़िल्टर करें",
    clearFilters: "फ़िल्टर साफ़ करें",
    addExpense: "खर्च जोड़ें",
    date: "तिथि",
    category: "श्रेणी",
    amount: "राशि",
    actions: "कार्रवाई",
    edit: "संपादित करें",
    delete: "हटाएं",
    addNewExpense: "नया खर्च जोड़ें",
    categoryRequired: "श्रेणी आवश्यक है",
    amountRequired: "राशि एक सकारात्मक संख्या होनी चाहिए",
    dateRequired: "तिथि आवश्यक है",
    saveChanges: "परिवर्तन सहेजें",
    manageCategories: "श्रेणियों का प्रबंधन",
    customiseCategories: "अपने खर्च की श्रेणियों, रंगों और बजट सीमाओं को अनुकूलित करें",
    createCategory: "श्रेणी बनाएं",
    categoryName: "श्रेणी का नाम",
    colorHex: "रंग हेक्स कोड",
    addCustomCategory: "कस्टम श्रेणी जोड़ें",
    categoryList: "श्रेणी सूची",
    budgetLimit: "बजट सीमा",
    profileAndSettings: "प्रोफ़ाइल और सेटिंग्स",
    managePreferences: "अपने खाता प्राथमिकताओं और बजट सीमाओं को प्रबंधित करें",
    personalDetails: "व्यक्तिगत विवरण",
    fullName: "पूरा नाम",
    emailAddress: "ईमेल पता",
    defaultCurrency: "डिफ़ॉल्ट मुद्रा",
    monthlyBudgetCapLabel: "मासिक बजट सीमा",
    languageLabel: "भाषा",
    preferencesAndBudgets: "प्राथमिकताएं और बजट",
    editProfile: "प्रोफ़ाइल संपादित करें",
    saveSettings: "सेटिंग्स सहेजें",
    preferencesSaved: "प्राथमिकताएं सफलतापूर्वक सहेजी गईं!",
    accountActions: "खाता कार्रवाइयाँ",
    signOut: "साइन आउट",
    deleteAccount: "खाता हटाएं",
    confirmSignOutTitle: "साइन आउट पुष्टि",
    confirmSignOutMsg: "क्या आप वाकई अपने खाते से साइन आउट करना चाहते हैं?",
    confirmDeleteTitle: "खाता स्थायी रूप से हटाएं?",
    confirmDeleteMsg: "क्या आप वाकई अपना खाता हटाना चाहते हैं? यह कार्रवाई अपरिवर्तनीय है। आपके सभी लेन-देन, श्रेणियां और सेटिंग्स स्थायी रूप से हटा दिए जाएंगे।",
    cancel: "रद्द करें",
    confirm: "पुष्टि करें"
  },
  es: {
    dashboard: "Tablero",
    expenses: "Gastos",
    categories: "Categorías",
    profile: "Perfil",
    welcomeBack: "Bienvenido de nuevo",
    searchPlaceholder: "Buscar por categoría o monto...",
    logOut: "Cerrar sesión",
    spendingByCategory: "Gastos por Categoría",
    allTimeTotals: "Totales históricos por categoría",
    noExpensesYet: "Aún no hay gastos",
    addExpensesToSeeBreakdown: "Agregue gastos para ver el desglose de gastos",
    recentTransactions: "Transacciones Recientes",
    yourLatestEntries: "Tus últimas entradas",
    totalSpend: "Gasto Total",
    monthlyBudgetCap: "Límite de presupuesto mensual",
    budgetStatus: "Estado del presupuesto",
    monthlyOverview: "Resumen Mensual",
    categoryBreakdown: "Desglose por Categoría",
    manageExpenses: "Gestionar Gastos",
    summary: "Resumen",
    totalBudget: "Presupuesto Total",
    safeToSpend: "Seguro para Gastar",
    budgetExceeded: "¡Presupuesto Excedido!",
    withinBudget: "Dentro del Presupuesto",
    filterByCategory: "Filtrar por Categoría",
    selectCategory: "Seleccionar Categoría",
    filterByDate: "Filtrar por Fecha",
    clearFilters: "Limpiar Filtros",
    addExpense: "Agregar Gasto",
    date: "Fecha",
    category: "Categoría",
    amount: "Monto",
    actions: "Acciones",
    edit: "Editar",
    delete: "Eliminar",
    addNewExpense: "Agregar Nuevo Gasto",
    categoryRequired: "Categoría es requerida",
    amountRequired: "El monto debe ser un número positivo",
    dateRequired: "La fecha es requerida",
    saveChanges: "Guardar Cambios",
    manageCategories: "Gestionar Categorías",
    customiseCategories: "Personalice sus categorías de gastos, colores y límites de presupuesto",
    createCategory: "Crear Categoría",
    categoryName: "Nombre de la Categoría",
    colorHex: "Código Hexagonal de Color",
    addCustomCategory: "Agregar Categoría Personalizada",
    categoryList: "Lista de Categorías",
    budgetLimit: "Límite de Presupuesto",
    profileAndSettings: "Perfil y Ajustes",
    managePreferences: "Administre sus preferencias de cuenta y límites de presupuesto",
    personalDetails: "Detalles Personales",
    fullName: "Nombre Completo",
    emailAddress: "Dirección de correo electrónico",
    defaultCurrency: "Moneda Predeterminada",
    monthlyBudgetCapLabel: "Límite de presupuesto mensual",
    languageLabel: "Idioma",
    preferencesAndBudgets: "Preferencias y Presupuestos",
    editProfile: "Editar Perfil",
    saveSettings: "Guardar Ajustes",
    preferencesSaved: "¡Preferencias guardadas con éxito!",
    accountActions: "Acciones de la Cuenta",
    signOut: "Cerrar Sesión",
    deleteAccount: "Eliminar Cuenta",
    confirmSignOutTitle: "Confirmación de Cierre de Sesión",
    confirmSignOutMsg: "¿Estás seguro de que quieres cerrar la sesión de tu cuenta?",
    confirmDeleteTitle: "¿Eliminar cuenta permanentemente?",
    confirmDeleteMsg: "¿Estás absolutamente seguro de que quieres eliminar tu cuenta? Esta acción es irreversible. Todos tus datos se borrarán permanentemente.",
    cancel: "Cancelar",
    confirm: "Confirmar"
  },
  fr: {
    dashboard: "Tableau de bord",
    expenses: "Dépenses",
    categories: "Catégories",
    profile: "Profil",
    welcomeBack: "Bon retour",
    searchPlaceholder: "Rechercher par catégorie ou montant...",
    logOut: "Se déconnecter",
    spendingByCategory: "Dépenses par catégorie",
    allTimeTotals: "Totaux cumulés par catégorie",
    noExpensesYet: "Pas encore de dépenses",
    addExpensesToSeeBreakdown: "Ajoutez des dépenses pour voir la répartition des dépenses",
    recentTransactions: "Transactions récentes",
    yourLatestEntries: "Vos dernières entrées",
    totalSpend: "Dépenses totales",
    monthlyBudgetCap: "Plafond du budget mensuel",
    budgetStatus: "Statut du budget",
    monthlyOverview: "Aperçu mensuel",
    categoryBreakdown: "Répartition par catégorie",
    manageExpenses: "Gérer les dépenses",
    summary: "Résumé",
    totalBudget: "Budget total",
    safeToSpend: "Sûr à dépenser",
    budgetExceeded: "Budget dépassé !",
    withinBudget: "Dans le budget",
    filterByCategory: "Filtrer par catégorie",
    selectCategory: "Choisir une catégorie",
    filterByDate: "Filtrer par date",
    clearFilters: "Effacer les filtres",
    addExpense: "Ajouter une dépense",
    date: "Date",
    category: "Catégorie",
    amount: "Montant",
    actions: "Actions",
    edit: "Modifier",
    delete: "Supprimer",
    addNewExpense: "Ajouter une nouvelle dépense",
    categoryRequired: "La catégorie est requise",
    amountRequired: "Le montant doit être un nombre positif",
    dateRequired: "La date est requise",
    saveChanges: "Enregistrer les modifications",
    manageCategories: "Gérer les catégories",
    customiseCategories: "Personnalisez vos catégories de dépenses, vos couleurs et vos limites budgétaires",
    createCategory: "Créer une catégorie",
    categoryName: "Nom de la catégorie",
    colorHex: "Code couleur hexadécimal",
    addCustomCategory: "Ajouter une catégorie personnalisée",
    categoryList: "Liste des catégories",
    budgetLimit: "Limite budgétaire",
    profileAndSettings: "Profil et paramètres",
    managePreferences: "Gérer vos préférences de compte et vos limites budgétaires",
    personalDetails: "Détails personnels",
    fullName: "Nom complet",
    emailAddress: "Adresse e-mail",
    defaultCurrency: "Devise par défaut",
    monthlyBudgetCapLabel: "Plafond du budget mensuel",
    languageLabel: "Langue",
    preferencesAndBudgets: "Préférences et budgets",
    editProfile: "Modifier le profil",
    saveSettings: "Enregistrer les paramètres",
    preferencesSaved: "Préférences enregistrées avec succès !",
    accountActions: "Actions du compte",
    signOut: "Se déconnecter",
    deleteAccount: "Supprimer le compte",
    confirmSignOutTitle: "Confirmation de déconnexion",
    confirmSignOutMsg: "Êtes-vous sûr de vouloir vous déconnecter de votre compte ?",
    confirmDeleteTitle: "Supprimer le compte définitivement ?",
    confirmDeleteMsg: "Êtes-vous absolument sûr de vouloir supprimer votre compte ? Cette action est irréversible. Toutes vos données seront définitivement effacées.",
    cancel: "Annuler",
    confirm: "Confirmer"
  },
  de: {
    dashboard: "Dashboard",
    expenses: "Ausgaben",
    categories: "Kategorien",
    profile: "Profil",
    welcomeBack: "Willkommen zurück",
    searchPlaceholder: "Suche nach Kategorie oder Betrag...",
    logOut: "Abmelden",
    spendingByCategory: "Ausgaben nach Kategorie",
    allTimeTotals: "Gesamtsummen pro Kategorie",
    noExpensesYet: "Noch keine Ausgaben",
    addExpensesToSeeBreakdown: "Fügen Sie Ausgaben hinzu, um die Aufteilung zu sehen",
    recentTransactions: "Letzte Transaktionen",
    yourLatestEntries: "Ihre neuesten Einträge",
    totalSpend: "Gesamtausgaben",
    monthlyBudgetCap: "Monatliches Budgetlimit",
    budgetStatus: "Budgetstatus",
    monthlyOverview: "Monatsübersicht",
    categoryBreakdown: "Kategorieaufteilung",
    manageExpenses: "Ausgaben verwalten",
    summary: "Zusammenfassung",
    totalBudget: "Gesamtbudget",
    safeToSpend: "Sicher auszugeben",
    budgetExceeded: "Budget überschritten!",
    withinBudget: "Im Budget",
    filterByCategory: "Nach Kategorie filtern",
    selectCategory: "Kategorie auswählen",
    filterByDate: "Nach Datum filtern",
    clearFilters: "Filter löschen",
    addExpense: "Ausgabe hinzufügen",
    date: "Datum",
    category: "Kategorie",
    amount: "Betrag",
    actions: "Aktionen",
    edit: "Bearbeiten",
    delete: "Löschen",
    addNewExpense: "Neue Ausgabe hinzufügen",
    categoryRequired: "Kategorie ist erforderlich",
    amountRequired: "Der Betrag muss eine positive Zahl sein",
    dateRequired: "Datum ist erforderlich",
    saveChanges: "Änderungen speichern",
    manageCategories: "Kategorien verwalten",
    customiseCategories: "Passen Sie Ihre Ausgabenkategorien, Farben und Budgetgrenzen an",
    createCategory: "Kategorie erstellen",
    categoryName: "Kategorie-Name",
    colorHex: "Farb-Hex-Code",
    addCustomCategory: "Benutzerdefinierte Kategorie hinzufügen",
    categoryList: "Kategorieliste",
    budgetLimit: "Budgetgrenze",
    profileAndSettings: "Profil & Einstellungen",
    managePreferences: "Verwalten Sie Ihre Kontoeinstellungen und Budgetgrenzen",
    personalDetails: "Persönliche Daten",
    fullName: "Vollständiger Name",
    emailAddress: "E-Mail-Adresse",
    defaultCurrency: "Standardwährung",
    monthlyBudgetCapLabel: "Monatliches Budgetlimit",
    languageLabel: "Sprache",
    preferencesAndBudgets: "Präferenzen & Budgets",
    editProfile: "Profil bearbeiten",
    saveSettings: "Einstellungen speichern",
    preferencesSaved: "Einstellungen erfolgreich gespeichert!",
    accountActions: "Kontotätigkeiten",
    signOut: "Abmelden",
    deleteAccount: "Konto löschen",
    confirmSignOutTitle: "Abmeldung bestätigen",
    confirmSignOutMsg: "Sind Sie sicher, dass Sie sich abmelden möchten?",
    confirmDeleteTitle: "Konto dauerhaft löschen?",
    confirmDeleteMsg: "Sind Sie absolut sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten werden dauerhaft gelöscht.",
    cancel: "Abbrechen",
    confirm: "Bestätigen"
  }
};

const currencyLocales: Record<CurrencyType, string> = {
  USD: "en-US",
  INR: "en-IN",
  EUR: "fr-FR",
  GBP: "en-GB",
  JPY: "ja-JP"
};

const currencySymbols: Record<CurrencyType, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  JPY: "¥"
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUserEmail = localStorage.getItem("currentUser") || "";
  const usersList: User[] = JSON.parse(localStorage.getItem("users") || "[]");

  const userObj = usersList.find(
    (u) => u.email.toLowerCase() === currentUserEmail.toLowerCase()
  );

  const [language, setLanguage] = useState<LanguageType>(
    (userObj?.language as LanguageType) || "en"
  );
  const [currency, setCurrency] = useState<CurrencyType>(
    (userObj?.currency as CurrencyType) || "USD"
  );
  const [monthlyBudget, setMonthlyBudget] = useState<string>(
    userObj?.monthlyBudget || "2000"
  );
  const [name, setName] = useState<string>(userObj?.name || "Demo User");
  const [email, setEmail] = useState<string>(currentUserEmail || "test@test.com");

  const [defaultCategories, setDefaultCategories] = useState<DefaultCategory[]>([]);
  const [currentMonthBudgets, setCurrentMonthBudgets] = useState<DefaultCategory[]>([]);

  const initialDefaultCategories: DefaultCategory[] = [
    {
      id: "bill-rent",
      name: "House Rent",
      color: "#F27878",
      monthlyBudget: "1000",
      dueDate: "05",
      notes: "Monthly house rent",
      enabled: true,
      autoInclude: true
    },
    {
      id: "bill-electricity",
      name: "Electricity Bill",
      color: "#7CC8FF",
      monthlyBudget: "120",
      dueDate: "15",
      notes: "Power utility bill",
      enabled: true,
      autoInclude: true
    },
    {
      id: "bill-internet",
      name: "Internet Bill",
      color: "#7C9CFF",
      monthlyBudget: "60",
      dueDate: "10",
      notes: "Broadband subscription",
      enabled: true,
      autoInclude: true
    },
    {
      id: "bill-gas",
      name: "Gas Bill",
      color: "#FF9E7C",
      monthlyBudget: "50",
      dueDate: "20",
      notes: "Cooking gas bill",
      enabled: true,
      autoInclude: true
    }
  ];

  const refreshSettings = () => {
    const freshEmail = localStorage.getItem("currentUser") || "";
    const freshUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    const freshUser = freshUsers.find(
      (u) => u.email.toLowerCase() === freshEmail.toLowerCase()
    );

    if (freshUser) {
      if (freshUser.language) setLanguage(freshUser.language as LanguageType);
      if (freshUser.currency) setCurrency(freshUser.currency as CurrencyType);
      if (freshUser.monthlyBudget) setMonthlyBudget(freshUser.monthlyBudget);
      if (freshUser.name) setName(freshUser.name);
      setEmail(freshUser.email || freshEmail);
    } else {
      setName("Demo User");
      setEmail(freshEmail || "test@test.com");
    }

    if (freshEmail) {
      const storedDefaults = localStorage.getItem(`default_categories_${freshEmail}`);
      let parsedDefaults: DefaultCategory[] = [];
      if (storedDefaults) {
        try {
          parsedDefaults = JSON.parse(storedDefaults);
        } catch (e) {
          parsedDefaults = initialDefaultCategories;
        }
      } else {
        parsedDefaults = initialDefaultCategories;
      }

      // Enforce strictly only the four built-in categories in correct order
      parsedDefaults = initialDefaultCategories.map(initial => {
        const existing = parsedDefaults.find(p => p.name.toLowerCase() === initial.name.toLowerCase());
        if (existing) {
          return {
            ...initial,
            color: existing.color || initial.color,
            monthlyBudget: existing.monthlyBudget || initial.monthlyBudget,
            dueDate: existing.dueDate || initial.dueDate,
            notes: existing.notes || initial.notes,
            enabled: existing.enabled !== undefined ? existing.enabled : initial.enabled,
            autoInclude: existing.autoInclude !== undefined ? existing.autoInclude : initial.autoInclude
          };
        }
        return initial;
      });
      localStorage.setItem(`default_categories_${freshEmail}`, JSON.stringify(parsedDefaults));
      setDefaultCategories(parsedDefaults);

      const today = new Date();
      const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
      const storedMonthly = localStorage.getItem(`monthly_budgets_${freshEmail}`);
      let monthlyObj: Record<string, DefaultCategory[]> = {};
      if (storedMonthly) {
        try {
          monthlyObj = JSON.parse(storedMonthly);
        } catch (e) {
          monthlyObj = {};
        }
      }

      const activeDefaults = parsedDefaults.filter(c => c.enabled && c.autoInclude);
      const currentList = monthlyObj[currentMonthKey] || [];
      const sanitizedMonthlyList = activeDefaults.map(d => {
        const existing = currentList.find(m => m.name.toLowerCase() === d.name.toLowerCase());
        if (existing) {
          return {
            ...d,
            color: existing.color || d.color,
            monthlyBudget: existing.monthlyBudget || d.monthlyBudget,
            dueDate: existing.dueDate || d.dueDate,
            notes: existing.notes || d.notes,
            enabled: existing.enabled !== undefined ? existing.enabled : d.enabled,
            autoInclude: existing.autoInclude !== undefined ? existing.autoInclude : d.autoInclude
          };
        }
        return d;
      });

      monthlyObj[currentMonthKey] = sanitizedMonthlyList;
      localStorage.setItem(`monthly_budgets_${freshEmail}`, JSON.stringify(monthlyObj));
      setCurrentMonthBudgets(sanitizedMonthlyList);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, [currentUserEmail]);

  const updateDefaultCategories = (cats: DefaultCategory[]) => {
    const freshEmail = localStorage.getItem("currentUser") || "";
    if (!freshEmail) return;
    setDefaultCategories(cats);
    localStorage.setItem(`default_categories_${freshEmail}`, JSON.stringify(cats));

    const today = new Date();
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const storedMonthly = localStorage.getItem(`monthly_budgets_${freshEmail}`);
    let monthlyObj: Record<string, DefaultCategory[]> = {};
    if (storedMonthly) {
      try {
        monthlyObj = JSON.parse(storedMonthly);
      } catch (e) {}
    }
    
    if (!monthlyObj[currentMonthKey]) {
      monthlyObj[currentMonthKey] = [];
    }

    monthlyObj[currentMonthKey] = monthlyObj[currentMonthKey].map(mCat => {
      const correspondingDefault = cats.find(dCat => dCat.id === mCat.id || dCat.name.toLowerCase() === mCat.name.toLowerCase());
      if (correspondingDefault) {
        return {
          ...mCat,
          monthlyBudget: correspondingDefault.monthlyBudget,
          color: correspondingDefault.color,
          name: correspondingDefault.name,
          dueDate: correspondingDefault.dueDate,
          notes: correspondingDefault.notes,
          enabled: correspondingDefault.enabled,
          autoInclude: correspondingDefault.autoInclude
        };
      }
      return mCat;
    });

    cats.forEach(dCat => {
      if (dCat.enabled && dCat.autoInclude) {
        const exists = monthlyObj[currentMonthKey].some(mCat => mCat.id === dCat.id || mCat.name.toLowerCase() === dCat.name.toLowerCase());
        if (!exists) {
          monthlyObj[currentMonthKey].push({ ...dCat });
        }
      } else {
        monthlyObj[currentMonthKey] = monthlyObj[currentMonthKey].filter(mCat => {
          if (mCat.id === dCat.id || mCat.name.toLowerCase() === dCat.name.toLowerCase()) {
            return dCat.enabled;
          }
          return true;
        });
      }
    });

    localStorage.setItem(`monthly_budgets_${freshEmail}`, JSON.stringify(monthlyObj));
    setCurrentMonthBudgets(monthlyObj[currentMonthKey]);
    window.dispatchEvent(new Event("expensesUpdated"));
  };

  const updateCurrentMonthBudgets = (cats: DefaultCategory[]) => {
    const freshEmail = localStorage.getItem("currentUser") || "";
    if (!freshEmail) return;
    const today = new Date();
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    
    const storedMonthly = localStorage.getItem(`monthly_budgets_${freshEmail}`);
    let monthlyObj: Record<string, DefaultCategory[]> = {};
    if (storedMonthly) {
      try {
        monthlyObj = JSON.parse(storedMonthly);
      } catch (e) {}
    }
    monthlyObj[currentMonthKey] = cats;
    localStorage.setItem(`monthly_budgets_${freshEmail}`, JSON.stringify(monthlyObj));
    setCurrentMonthBudgets(cats);
    window.dispatchEvent(new Event("expensesUpdated"));
  };

  const getBudgetStatus = (spent: number, budget: number) => {
    if (budget <= 0) return "Safe" as const;
    const ratio = spent / budget;
    if (ratio >= 1.0) return "Exceeded" as const;
    if (ratio >= 0.8) return "Near Limit" as const;
    return "Safe" as const;
  };

  const getBillStatus = (spent: number, budget: number) => {
    if (budget <= 0) return "Unpaid" as const;
    return spent >= budget ? "Paid" as const : "Unpaid" as const;
  };

  const updateSettings = (updates: {
    name: string;
    email: string;
    currency: CurrencyType;
    monthlyBudget: string;
    language: LanguageType;
  }) => {
    if (!updates.name || !updates.email) return false;

    setName(updates.name);
    setEmail(updates.email);
    setCurrency(updates.currency);
    setMonthlyBudget(updates.monthlyBudget);
    setLanguage(updates.language);

    const updatedUsers = usersList.map((u) => {
      if (u.email.toLowerCase() === currentUserEmail.toLowerCase()) {
        return {
          ...u,
          name: updates.name,
          email: updates.email,
          currency: updates.currency,
          monthlyBudget: updates.monthlyBudget,
          language: updates.language
        };
      }
      return u;
    });

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("currentUser", updates.email);

    if (currentUserEmail.toLowerCase() !== updates.email.toLowerCase()) {
      const expensesData = localStorage.getItem(`expenses_${currentUserEmail}`);
      if (expensesData) {
        localStorage.setItem(`expenses_${updates.email}`, expensesData);
        localStorage.removeItem(`expenses_${currentUserEmail}`);
      }
      
      const defaultsData = localStorage.getItem(`default_categories_${currentUserEmail}`);
      if (defaultsData) {
        localStorage.setItem(`default_categories_${updates.email}`, defaultsData);
        localStorage.removeItem(`default_categories_${currentUserEmail}`);
      }

      const monthlyData = localStorage.getItem(`monthly_budgets_${currentUserEmail}`);
      if (monthlyData) {
        localStorage.setItem(`monthly_budgets_${updates.email}`, monthlyData);
        localStorage.removeItem(`monthly_budgets_${currentUserEmail}`);
      }
    }

    return true;
  };

  const t = (key: string): string => {
    const langDict = translations[language] || translations["en"];
    return langDict[key] || translations["en"][key] || key;
  };

  const formatCurrency = (val: number | string): string => {
    const numeric = typeof val === "number" ? val : Number(val) || 0;
    return new Intl.NumberFormat(currencyLocales[currency] || "en-US", {
      style: "currency",
      currency: currency
    }).format(numeric);
  };

  const getCurrencySymbol = (): string => {
    return currencySymbols[currency] || "$";
  };

  return (
    <SettingsContext.Provider
      value={{
        language,
        currency,
        monthlyBudget,
        name,
        email,
        updateSettings,
        t,
        formatCurrency,
        getCurrencySymbol,
        refreshSettings,
        defaultCategories,
        updateDefaultCategories,
        currentMonthBudgets,
        updateCurrentMonthBudgets,
        getBudgetStatus,
        getBillStatus
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
