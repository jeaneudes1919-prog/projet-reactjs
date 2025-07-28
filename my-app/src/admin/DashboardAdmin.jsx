import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./SidebarAdmin";
import ListeCandidats from "./candidats";
import VueEnsemble from "./vueEnselble";
import ListeEntreprises from "./ListeEntreprises";
import GestionOffresAdmin from "./offres";
import Parametres from "./parametre";
export default function DashboardAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode) setDarkMode(savedMode === "true");
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <div className="flex h-screen bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 from-indigo-50 via-indigo-100 to-indigo-50 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      <Sidebar
        isOpen={sidebarOpen}
        toggle={() => setSidebarOpen(!sidebarOpen)}
        darkMode={darkMode}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between bg-white dark:bg-gray-900 shadow-lg px-6 py-4 sticky top-0 z-10 transition-colors duration-500">
          <button
            className="text-gray-700 dark:text-gray-300 md:hidden focus:outline-none hover:text-indigo-500 dark:hover:text-indigo-400 transition"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <h1 className="text-3xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Tableau de bord Admin
          </h1>
        </header>

        {/* Main content avec Routes */}
        <main className="flex-1 overflow-auto p-8 space-y-12">
          <Routes>
            {/* Par défaut redirige vers /admin/candidats */}
            <Route path="/" element={<Navigate to="candidats" replace />} />
            {/* Route vers la liste des candidats */}
            <Route path="candidats" element={<ListeCandidats />} />
            <Route path="vue" element={<VueEnsemble />} />
            <Route path="entreprises" element={<ListeEntreprises />} />
            <Route path="offres" element={<GestionOffresAdmin />} />
            <Route path="parametres" element={<Parametres />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
