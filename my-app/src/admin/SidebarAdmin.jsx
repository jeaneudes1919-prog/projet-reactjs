import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

import {
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

export default function Sidebar({ isOpen, toggle, darkMode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState({ nom: "", email: "" });
  const [confirmLogout, setConfirmLogout] = useState(false);

  const fetchAdminInfos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/infos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdminInfo(res.data);
    } catch (err) {
      console.error("Erreur récupération admin:", err);
    }
  };

  const updateAdminInfos = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:3000/modifier-infos", adminInfo, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setModalOpen(false);
    } catch (err) {
      console.error("Erreur mise à jour admin:", err);
    }
  };

  useEffect(() => {
    fetchAdminInfos();
  }, []);

  const navItems = [
    { name: "Vu d'ensemble", to: "/admin/vue", icon: HomeIcon },
    { name: "Candidats", to: "/admin/candidats", icon: UserGroupIcon },
    { name: "Entreprises", to: "/admin/entreprises", icon: BuildingOfficeIcon },
    { name: "Offres", to: "/admin/offres", icon: BriefcaseIcon },
    { name: "Paramètres", to: "/admin/parametres", icon: Cog6ToothIcon },
  ];

  // Fonction pour déconnecter après confirmation
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-900 border-r border-indigo-200 dark:border-indigo-700 shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-none`}
      >
        {/* Profil */}
        <div className="flex flex-col items-center py-8 border-b border-indigo-200 dark:border-indigo-700">
          <img
            src="/admin.png"
            alt="Admin"
            className="w-20 h-20 rounded-full border-4 border-indigo-500 dark:border-indigo-400 shadow-lg"
          />
          <h3 className="mt-4 text-xl font-semibold text-indigo-700 dark:text-indigo-300">
            {adminInfo.nom || "Admin"}
          </h3>
          <p className="text-sm text-indigo-600 dark:text-indigo-400">
            Administrateur
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="text-xs text-indigo-500 hover:underline mt-2"
          >
            Modifier
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-6 space-y-3">
          {navItems.map(({ name, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : darkMode
                    ? "text-indigo-300 hover:bg-indigo-700 hover:text-white"
                    : "text-indigo-700 hover:bg-indigo-200 hover:text-indigo-900"
                }`
              }
            >
              <Icon className="w-6 h-6" />
              {name}
            </NavLink>
          ))}
        </nav>

        {/* Bouton Déconnexion */}
        <div className="absolute bottom-0 w-full px-6 py-4 border-t border-indigo-200 dark:border-indigo-700">
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
              />
            </svg>
            <span className="whitespace-nowrap">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Modale pour modifier les infos */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-md w-full shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">
              Modifier mes infos
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateAdminInfos();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nom
                </label>
                <input
                  type="text"
                  value={adminInfo.nom}
                  onChange={(e) =>
                    setAdminInfo({ ...adminInfo, nom: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={adminInfo.email}
                  onChange={(e) =>
                    setAdminInfo({ ...adminInfo, email: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modale confirmation déconnexion */}
      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-sm w-full shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Confirmer la déconnexion ?
            </h3>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setConfirmLogout(false)}
                className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Oui, déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
