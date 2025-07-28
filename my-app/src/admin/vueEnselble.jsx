import React, { useEffect, useState } from "react";
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

export default function VueEnsemble() {
  const [stats, setStats] = useState({
    entreprises: 0,
    candidats: 0,
    offres: 0,
  });

  useEffect(() => {
    axios
      .get("http://localhost:3000/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Erreur lors du chargement des statistiques :", err));
  }, []);

  const cards = [
    {
      id: 1,
      title: "Entreprises",
      value: stats.entreprises,
      icon: <BuildingOfficeIcon className="w-12 h-12 text-indigo-500" />,
    },
    {
      id: 2,
      title: "Candidats",
      value: stats.candidats,
      icon: <UserGroupIcon className="w-12 h-12 text-green-500" />,
    },
    {
      id: 3,
      title: "Offres",
      value: stats.offres,
      icon: <BriefcaseIcon className="w-12 h-12 text-pink-500" />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
      {cards.map(({ id, title, value, icon }) => (
        <div
          key={id}
          className="relative rounded-xl shadow-lg bg-white dark:bg-gray-800 p-8 flex items-center gap-6 cursor-default transform transition-transform duration-300 hover:scale-[1.04]"
        >
          <div className="p-4 rounded-full bg-white/70 dark:bg-black/40 backdrop-blur-md">
            {icon}
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">{title}</p>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
