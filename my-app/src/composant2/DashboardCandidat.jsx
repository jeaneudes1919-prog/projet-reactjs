import React, { useState, useEffect } from "react";
import axios from "axios";
import FormulaireCV from "./FormulaireCV";
import AccueilCandidat from "./VueEnsembleCandidat";
import ProfilCandidat from "./ProfilCandidat";
import MesCandidatures from "./MesCandidatures";
import RechercheOffres from "./RechercheOffres";
import ParametresCandidat from "./ParametresCandidat";
import SidebarCandidat from "./SidebarCandidat";
import SupportCandidat from "./support candidat";
import { Bell } from "lucide-react";

export default function DashboardCandidat() {
  const [page, setPage] = useState("accueil");
  const [notifications, setNotifications] = useState([]);
  const [afficherNotif, setAfficherNotif] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const fetchNotifications = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const res = await axios.get(`http://localhost:3000/api/notifications/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Erreur récupération notifications :", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const nonLues = notifications.filter((n) => !n.lu);

  const marquerCommeLue = async (notifId) => {
    try {
      await axios.put(`http://localhost:3000/api/notifications/${notifId}/lu`);
      fetchNotifications();
    } catch (err) {
      console.error("Erreur mise à jour notification :", err);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 dark:bg-gray-900 flex relative">
      <SidebarCandidat onNavigate={setPage} currentPage={page} />

      <div className="flex-1 flex flex-col relative">
        {/* Barre supérieure avec notifications */}
        <div className="flex justify-end items-center p-4 bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
          <div className="relative mr-4">
            <button
              onClick={() => setAfficherNotif(!afficherNotif)}
              className="relative focus:outline-none"
              aria-label="Afficher les notifications"
              title="Afficher les notifications"
            >
              <Bell className="w-6 h-6 text-emerald-700 dark:text-emerald-300" />
              {nonLues.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5">
                  {nonLues.length}
                </span>
              )}
            </button>

            {afficherNotif && (
              <div className="absolute right-0 mt-3 w-96 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50">
                {notifications.length === 0 ? (
                  <p className="p-4 text-gray-500 dark:text-gray-300 text-sm">
                    Aucune notification.
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 border-b dark:border-gray-600 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        !notif.lu ? "bg-yellow-50 dark:bg-yellow-900/30" : ""
                      }`}
                      onClick={() => marquerCommeLue(notif.id)}
                      title="Cliquer pour marquer comme lu"
                    >
                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {notif.date
                          ? new Date(notif.date).toLocaleString("fr-FR")
                          : "Date inconnue"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contenu principal */}
        <main className="flex-1 max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow">
          {page === "accueil" && <AccueilCandidat />}
          {page === "profil" && <ProfilCandidat />}
          {page === "CV" && <FormulaireCV />}
          {page === "mes-candidatures" && <MesCandidatures />}
          {page === "recherche-offres" && <RechercheOffres />}
          {page === "parametres" && <ParametresCandidat />}
          {page === "support" && <SupportCandidat />}
        </main>
      </div>

      <button
  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
  title="Changer le thème"
  className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-800 shadow-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition focus:outline-none text-gray-700 dark:text-yellow-400 font-medium"
>
  {theme === "light" ? (
    <>
      {/* Icône lune */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        />
      </svg>
      Mode sombre
    </>
  ) : (
    <>
      {/* Icône soleil */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m8.66-9H21m-18 0H3m15.36 6.36l.7.7M6.34 6.34l.7.7m12.02 0l-.7.7M6.34 17.66l-.7.7M12 7a5 5 0 100 10 5 5 0 000-10z"
        />
      </svg>
      Mode clair
    </>
  )}
</button>

    </div>
  );
}
