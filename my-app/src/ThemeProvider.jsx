import React, { useEffect, useState } from "react";

export default function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <button
        onClick={() => setIsDark(!isDark)}
        className="fixed bottom-4 right-4 px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700"
      >
        {isDark ? "☀️ Mode clair" : "🌙 Mode sombre"}
      </button>
      {children}
    </div>
  );
}
