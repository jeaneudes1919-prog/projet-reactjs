import React, { useState } from "react";
import { LogOut } from "lucide-react";

import {
  HomeIcon,
  BriefcaseIcon,
  UsersIcon,
  PencilSquareIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  LifebuoyIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const ongletsPrincipaux = [
  { id: "vueEnsemble", label: "Vue d’ensemble", Icon: HomeIcon },
  { id: "offresEmploi", label: "Offres d’emploi", Icon: BriefcaseIcon },
  { id: "listeCandidats", label: "Candidats Sélectionnés", Icon: UsersIcon },
  { id: "publierOffres", label: "Publier une offre", Icon: PencilSquareIcon },
  { id: "profilEntreprise", label: "Profil", Icon: UserCircleIcon },
  { id: "parametres", label: "Paramètres", Icon: Cog6ToothIcon },
  { id: "support", label: "Support", Icon: LifebuoyIcon },
];

export default function BarreNavigation({ ongletActif, changerOnglet }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <nav className="flex flex-col justify-between w-64 h-screen px-6 py-8 border-r border-gray-200 shadow-md bg-white select-none dark:bg-gray-900 dark:border-gray-700">
        {/* Logo */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-wide text-blue-800 cursor-default dark:text-blue-400">
            Espace entreprise
          </h1>
        </div>

        {/* Liens principaux */}
        <div className="flex flex-col space-y-3">
          {ongletsPrincipaux.map(({ id, label, Icon }) => {
            const actif = ongletActif === id;
            return (
              <button
                key={id}
                onClick={() => changerOnglet(id)}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-lg font-medium
                  transition-colors duration-300
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${
                    actif
                      ? "bg-blue-600 text-white shadow-lg dark:bg-blue-700"
                      : "text-gray-700 hover:bg-blue-100 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
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

        {/* Déconnexion */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-4">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-4 px-4 py-3 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <LogOut className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">Déconnexion</span>
          </button>
        </div>
      </nav>

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
                localStorage.removeItem("userId"); // si tu stockes aussi l'ID
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
    </>
  );
}
