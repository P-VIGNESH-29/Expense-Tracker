import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import type { User } from "../../types";
import { Eye, EyeOff } from "lucide-react";
import AlertModal from "../../components/common/AlertModal";

function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: "", message: "", type: "warning" as "info" | "warning" | "error" | "success" | "confirm" });
  
  // Theme state
  const [isDark] = useState(() => {
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
  
  // Sign In / Sign Up inputs
  const [inputname, setname] = useState(""); // used as email
  const [inputpassword, setpassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateEmail = (val: string) => {
    if (!val) {
      setNameError("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(val)) {
      setNameError("Please enter a valid email address");
    } else {
      setNameError("");
    }
  };

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError("Password is required");
    } else if (val.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateEmail(inputname);
    validatePassword(inputpassword);

    if (!inputname || !inputpassword || nameError || passwordError) {
      setError("Please fill in the form correctly.");
      return;
    }

    // Default demo user creation if empty
    let usersList: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    if (usersList.length === 0) {
      const demoUser: User = { name: "Demo User", email: "test@test.com", password: "password123" };
      usersList.push(demoUser);
      localStorage.setItem("users", JSON.stringify(usersList));
    }

    const matchedUser = usersList.find(
      (u) => u.email.toLowerCase() === inputname.toLowerCase() && u.password === inputpassword
    );

    if (matchedUser) {
      localStorage.setItem("currentUser", matchedUser.email);
      localStorage.setItem("isAuthenticated", "true");
      setError("");
      navigate("/Layout");
    } else {
      setError("Invalid email or password. Feel free to sign up a new account!");
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateEmail(inputname);
    validatePassword(inputpassword);

    if (!fullName) {
      setFullNameError("Full name is required");
    } else {
      setFullNameError("");
    }

    if (inputpassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }

    if (!fullName || !inputname || !inputpassword || nameError || passwordError || inputpassword !== confirmPassword) {
      setError("Please fix all validation errors before proceeding.");
      return;
    }

    const usersList: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    const userExists = usersList.some((u) => u.email.toLowerCase() === inputname.toLowerCase());

    if (userExists) {
      setAlertConfig({
        title: "Account Already Exists",
        message: "An account with this email address is already registered. Please sign in instead.",
        type: "warning"
      });
      setIsAlertOpen(true);
      return;
    }

    const newUser: User = {
      name: fullName,
      email: inputname,
      password: inputpassword,
    };

    usersList.push(newUser);
    localStorage.setItem("users", JSON.stringify(usersList));

    // Clear input fields and toggle to login
    setFullName("");
    setConfirmPassword("");
    setpassword("");
    setError("");
    setSuccess("Account successfully registered! You can now log in.");
    setIsSignUp(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8fafc] dark:bg-bg-main transition-colors duration-150">
      
      {/* LEFT COLUMN: Brand, Marketing & Decorative (50% screen width on Desktop) */}
      <div className="lg:w-[50%] shrink-0 bg-gradient-to-br from-[#0B1020] to-[#111827] text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden min-h-[40vh] lg:min-h-screen">
        {/* Abstract Glowing Decorative Backdrops */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-brand/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none"></div>

        {/* Logo at Top Left */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-brand to-brand-hover font-bold text-white text-base font-display shadow-md shadow-brand/20">
            S
          </div>
          <span className="text-2xl font-bold tracking-wider font-display bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Spendly
          </span>
        </div>

        {/* Marketing headline and description */}
        <div className="relative z-10 my-auto py-12 space-y-6 max-w-lg">
          <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-white leading-tight">
            Master your money with confidence.
          </h2>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed font-sans">
            Spendly offers a clean, streamlined dashboard to track your expenses, organize transactions into customized categories, and help you reach your saving targets without the hassle.
          </p>
        </div>

        {/* Simple Decorative Grid Pattern at Bottom */}
        <div className="relative z-10 opacity-25">
          <svg className="w-48 h-24" fill="currentColor" viewBox="0 0 200 100">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" className="text-slate-500" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* RIGHT COLUMN: Clean White Form Area (50% screen width on Desktop) */}
      <div className="w-full lg:w-[50%] flex items-center justify-center p-6 md:p-16 bg-white dark:bg-slate-950 transition-colors duration-150 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-8">
          
          {/* Header Title Block */}
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
              {isSignUp ? "Create an account" : "Welcome Back"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-sans">
              {isSignUp ? "Get started in seconds" : "Please enter your details to sign in to Spendly."}
            </p>
          </div>

          <form onSubmit={isSignUp ? handleSignUpSubmit : handleLoginSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-semibold animate-shake">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-semibold">
                {success}
              </div>
            )}

            {/* FULL NAME FIELD (Sign Up Only) */}
            {isSignUp && (
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="fullName"
                    type="text"
                    className={`input-field w-full px-4 h-11 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-brand/20 ${fullNameError ? "border-error/50 focus:border-error" : ""}`}
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fullNameError) setFullNameError("");
                    }}
                  />
                </div>
                {fullNameError && (
                  <span className="text-error text-xs font-medium">{fullNameError}</span>
                )}
              </div>
            )}

            {/* EMAIL / USERNAME FIELD */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Email Address
              </label>
              <div className="relative">
                
                <input
                  id="email"
                  type="email"
                  className={`input-field w-full px-4 h-11 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-brand/20 ${nameError ? "border-error/50 focus:border-error" : ""}`}
                  placeholder="you@example.com"
                  value={inputname}
                  onChange={(e) => {
                    setname(e.target.value);
                    if (nameError) validateEmail(e.target.value);
                  }}
                  onBlur={(e) => validateEmail(e.target.value)}
                />
              </div>
              {nameError && (
                <span className="text-error text-xs font-medium">{nameError}</span>
              )}
            </div>

            {/* PASSWORD FIELD */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Password
                </label>
                {!isSignUp && (
                  <a href="#forgot" className="text-xs font-semibold text-brand hover:text-brand-hover hover:underline transition-colors">
                    Forgot Password?
                  </a>
                )}
              </div>
              <div className="relative">
                
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`input-field w-full pl-4 pr-10 h-11 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-brand/20 ${passwordError ? "border-error/50 focus:border-error" : ""}`}
                  placeholder="••••••••"
                  value={inputpassword}
                  onChange={(e) => {
                    setpassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                  }}
                  onBlur={(e) => validatePassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {passwordError && (
                <span className="text-error text-xs font-medium">{passwordError}</span>
              )}
            </div>

            {/* CONFIRM PASSWORD (Sign Up Only) */}
            {isSignUp && (
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    className={`input-field w-full px-4 h-11 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-brand/20 ${confirmPasswordError ? "border-error/50 focus:border-error" : ""}`}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) setConfirmPasswordError("");
                    }}
                  />
                </div>
                {confirmPasswordError && (
                  <span className="text-error text-xs font-medium">{confirmPasswordError}</span>
                )}
              </div>
            )}

            {/* REMEMBER ME CHECKBOX */}
            {!isSignUp && (
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-brand focus:ring-brand cursor-pointer"
                />
                <label htmlFor="rememberMe" className="ml-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  Remember me
                </label>
              </div>
            )}

            {/* ACTION BUTTON */}
            <button
              type="submit"
              className="w-full h-11 bg-brand hover:bg-brand-hover text-white font-bold rounded-lg shadow-md shadow-brand/10 hover:shadow-lg hover:shadow-brand/20 active:scale-98 transition-all duration-150 cursor-pointer text-sm mt-2"
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>

          {/* SIGN IN / SIGN UP NAVIGATION LINK */}
          <div className="text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccess("");
              }}
              className="text-xs font-bold text-brand hover:text-brand-hover hover:underline transition-all cursor-pointer"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>

        </div>
      </div>
      
      <AlertModal
        isOpen={isAlertOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setIsAlertOpen(false)}
      />
    </div>
  );
}

export default Login;