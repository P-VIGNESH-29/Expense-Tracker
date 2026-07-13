import { useNavigate, useLocation } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";

interface NavbarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Navbar({ isOpen, onClose }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useSettings();

  const navItems = [
    {
      name: "Dashboard",
      translationKey: "dashboard",
      path: "Dashboard",
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Expenses",
      translationKey: "expenses",
      path: "Expenses",
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: "Categories",
      translationKey: "categories",
      path: "Categories",
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: "Profile",
      translationKey: "profile",
      path: "Profile",
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  // Helper to determine if a route is currently active
  const isActive = (path: string) => {
    if (path === "/Dashboard" && location.pathname === "/") return true;
    return location.pathname.toLowerCase() === path.toLowerCase();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-bg-surface border-r border-border-light text-text-secondary h-screen flex flex-col justify-between shrink-0 transform transition-transform duration-300 md:sticky md:top-0 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border-light">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-tr from-brand to-brand-hover font-bold text-white text-sm font-display">
              S
            </div>
            <span className="text-lg font-bold tracking-wider text-text-primary font-display">Spendly</span>
          </div>
          {/* Close button on mobile */}
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary md:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`w-full h-11 flex items-center px-4 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${active
                    ? "bg-brand/10 text-brand border border-brand/20"
                    : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary border border-transparent"
                  }`}
              >
                {item.icon}
                {t(item.translationKey)}
              </button>
            );
          })}
        </nav>
      </div>

    </aside>
  );
}


