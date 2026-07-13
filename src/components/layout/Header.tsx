import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSettings } from "../../context/SettingsContext";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onMenuToggle: () => void;
}

export default function Header({ searchQuery, setSearchQuery, onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { t, name } = useSettings();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSearchMobileOpen, setIsSearchMobileOpen] = useState(false);

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  // Apply theme class on mount and theme change
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    // @ts-ignore
    if (!document.startViewTransition) {
      setIsDark(!isDark);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // @ts-ignore
    const transition = document.startViewTransition(() => {
      setIsDark(!isDark);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 450,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: isDark
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
        }
      );
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.setItem("isAuthenticated", "false");
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 h-16 p-2 bg-bg-surface/90 backdrop-blur-md border-b border-border-light px-4 md:px-6 flex items-center justify-between transition-all duration-300 z-30 shadow-medium gap-4">
        {/* Mobile Search Overlay */}
        {isSearchMobileOpen ? (
          <div className="absolute inset-0 bg-bg-surface px-4 flex items-center gap-3 sm:hidden z-30 animate-in slide-in-from-top duration-150">
            <button
              onClick={() => {
                setIsSearchMobileOpen(false);
                setSearchQuery("");
              }}
              className="p-2 rounded-full hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary cursor-pointer shrink-0"
              aria-label="Close search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="relative flex-grow">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={t("") || ""}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-full pl-9 pr-4 placeholder:text-text-muted text-sm h-10 rounded-full bg-bg-main/50 focus:bg-bg-surface border-border-light hover:border-border-hover/80 transition-all duration-200"
                autoFocus
              />
            </div>
          </div>
        ) : null}

        {/* Left side: Mobile Menu Toggle + Search Bar */}
        <div className="flex items-center flex-1 gap-3 max-w-xs sm:max-w-md">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-full hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary md:hidden shrink-0 cursor-pointer transition-colors"
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="relative w-full hidden sm:block">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={t("") || ""}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full pl-9 pr-4 placeholder:text-text-muted text-sm h-10 rounded-full bg-bg-main/50 focus:bg-bg-surface border-border-light hover:border-border-hover/80 transition-all duration-200"
            />
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Mobile Search Button Trigger */}
          <button
            onClick={() => setIsSearchMobileOpen(true)}
            className="h-10 w-10 flex items-center justify-center rounded-full border border-border-light hover:border-border-hover text-text-secondary hover:text-text-primary transition-all duration-150 cursor-pointer bg-bg-surface-hover/30 sm:hidden shrink-0"
            aria-label="Open search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="h-10 w-10 flex items-center justify-center rounded-full border border-border-light hover:border-border-hover text-text-secondary hover:text-text-primary transition-all duration-150 cursor-pointer bg-bg-surface-hover/30"
            aria-label="Toggle Theme"
          >
            {isDark ? (
              // Sun Icon for Dark Mode
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              // Moon Icon for Light Mode
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>


          {/* User Profile Info */}
          <div className="flex items-center space-x-2 pl-2 border-l border-border-light shrink-0">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand to-brand-hover flex items-center justify-center text-white font-bold text-sm select-none shadow-sm shrink-0">
              {name ? name.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="text-sm font-semibold text-text-primary hidden md:inline-block max-w-[100px] truncate">
              {name || "User"}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowSignOutConfirm(true)}
            className="h-10 w-10 flex items-center justify-center rounded-full hover: text-text-secondary hover: hover:transition-all duration-150 cursor-pointer bg-bg-surface-hover/30"
            aria-label="Log out"
            title="Log out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

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
                onClick={handleLogout}
                className="btn-primary px-5 bg-brand hover:bg-brand-hover"
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
