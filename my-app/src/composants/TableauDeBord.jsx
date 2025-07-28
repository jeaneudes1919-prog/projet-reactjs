import React, { useState, useEffect } from "react";
import BarreNavigation from "./BarreNavigation";
import VueEnsemble from "./VueEnsemble";
import OffresEmploi from "./OffresEmploi";
import PublierOffre from "./publieroffres";
import ProfilEntreprise from "./ProfilEntreprise";
import Parametres from "./Parametres";
import Support from "./Support";
import CvCandidat from "./CvCandidat";
import ListeCandidats from "./ListeCandidats";
import messageIcon from "../assets/icons/message-icon.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TableauDeBord() {
  const [ongletActif, setOngletActif] = useState("vueEnsemble");
  const [messagesNonLus, setMessagesNonLus] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/support/non-lus?utilisateur_id=1"
        );
        setMessagesNonLus(res.data.nonLus || 0);
      } catch (err) {
        console.error("Erreur lors de la récupération des messages :", err);
        setMessagesNonLus(0);
      }
    }
    fetchMessages();
  }, []);

  // Appliquer le thème au niveau du document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const pages = {
    vueEnsemble: <VueEnsemble />,
    offresEmploi: <OffresEmploi />,
    publierOffres: <PublierOffre />,
    profilEntreprise: <ProfilEntreprise />,
    parametres: <Parametres />,
    support: <Support />,
    listeCandidats: <ListeCandidats />,
  };

  const changerOnglet = (id) => {
    if (id === "deconnexion") {
      localStorage.removeItem("token");
      navigate("/");
      return;
    }
    setOngletActif(id);
  };

  return (
    <div className="min-h-screen flex bg-blue-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Barre latérale */}
      <aside className="w-64 bg-white shadow-md border-r border-blue-100 dark:bg-gray-900 dark:border-gray-700 transition-colors duration-300">
        <BarreNavigation
          ongletActif={ongletActif}
          changerOnglet={changerOnglet}
        />

        
      </aside>

      {/* Contenu principal */}
      <div className="flex flex-col flex-grow">
        <main className="flex-grow p-6 overflow-y-auto text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {pages[ongletActif]}
        </main>
      </div>
    </div>
  );
}
