import React, { useState } from "react";
import {
  Home,
  User,
  FileText,
  Search,
  Settings,
  LogOut,
  ClipboardList,
  LifeBuoy,
} from "lucide-react";

export default function SidebarCandidat({ onNavigate, currentPage }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const ongletsPrincipaux = [
    { id: "accueil", label: "Vue d’ensemble", Icon: Home },
    { id: "profil", label: "Profil", Icon: User },
    { id: "CV", label: "CV", Icon: FileText },
    { id: "mes-candidatures", label: "Mes Candidatures", Icon: ClipboardList },
    { id: "recherche-offres", label: "Rechercher Offres", Icon: Search },
    { id: "parametres", label: "Paramètres", Icon: Settings },
    { id: "support", label: "Support", Icon: LifeBuoy },
  ];

  return (
    <nav className="flex flex-col justify-between bg-white dark:bg-gray-800 w-64 h-screen border-r border-gray-200 dark:border-gray-700 shadow-md px-6 py-8 select-none">
      {/* Logo ou titre */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 tracking-wide cursor-default">
          Espace Candidat
        </h1>
      </div>

      {/* Liens principaux */}
      <div className="flex flex-col space-y-3">
        {ongletsPrincipaux.map(({ id, label, Icon }) => {
          const actif = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-lg font-medium
                transition-colors duration-300
                focus:outline-none focus:ring-2 focus:ring-emerald-500
                ${
                  actif
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-gray-700 hover:text-emerald-700 dark:hover:text-emerald-300"
                }
              `}
              aria-current={actif ? "page" : undefined}
            >
              <Icon
                className={`h-6 w-6 flex-shrink-0 ${
                  actif ? "text-white" : "text-gray-500 dark:text-gray-400"
                }`}
                aria-hidden="true"
              />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Bouton de déconnexion */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-4">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-4 px-4 py-3 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <LogOut className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap">Déconnexion</span>
        </button>
      </div>

      {/* Modale de confirmation de déconnexion */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full text-center shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Bye bye 👋, à bientôt !
            </p>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold"
            >
              Confirmer la déconnexion
            </button>
            <button
              onClick={() => setShowLogoutModal(false)}
              className="ml-4 px-4 py-2 rounded-md font-semibold border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
