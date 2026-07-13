import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Header from "./Header";
import { useSettings } from "../../context/SettingsContext";

export default function Layout() {
  const { refreshSettings } = useSettings();
  
  useEffect(() => {
    refreshSettings();
  }, []);

  const currentUser = localStorage.getItem("currentUser");
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-main relative">
      {/* Mobile Sidebar Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <Navbar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden w-full">
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        />
        <main className="flex-grow overflow-y-auto max-w-[1440px] w-full mx-auto p-4 md:p-8 text-text-primary">
          <Outlet context={{ searchQuery, setSearchQuery }} />
        </main>
      </div>
    </div>
  );
}


