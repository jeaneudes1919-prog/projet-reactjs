import React, { useState, useEffect } from "react";
import axios from "axios";

export default function MesCandidatures() {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        const headers = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const resCandidatures = await axios.get(
          `http://localhost:3000/api/candidatures/${userId}`,
          headers
        );

        setCandidatures(resCandidatures.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setErreur("❌ Impossible de charger les données.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAnnulerCandidature = async (candidatureId) => {
    const candidature = candidatures.find((c) => c.id === candidatureId);
    if (!candidature) return;
    console.log("Statut actuel :", candidature.statut);

    if (candidature.statut?.toLowerCase() === "acceptée") {
      alert("Vous ne pouvez pas annuler une candidature acceptée.");
      return;
    }

    const confirmation = window.confirm("Voulez-vous vraiment annuler cette candidature ?");
    if (!confirmation) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/candidatures/${candidatureId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCandidatures((prev) => prev.filter((c) => c.id !== candidatureId));
      alert("Candidature annulée.");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'annulation.");
    }
  };


  if (loading)
    return (
      <p className="text-center text-green-700 mt-10 text-xl font-semibold">
        Chargement en cours...
      </p>
    );
  if (erreur)
    return (
      <p className="text-center text-red-600 mt-10 text-xl font-semibold">{erreur}</p>
    );

  const statutClasses = (statut) => {
    switch (statut?.toLowerCase()) {
      case "acceptée":
        return "bg-green-100 text-green-800";
      case "refusée":
        return "bg-red-100 text-red-800";
      case "en attente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-4xl font-extrabold mb-10 text-green-800 dark:text-white text-center">
        Mes candidatures
      </h2>

      {candidatures.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
          Aucune candidature trouvée.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-green-300 dark:border-gray-600 shadow-md">
          <table className="min-w-full divide-y divide-green-300 dark:divide-gray-700">
            <thead className="bg-transparent">
              <tr>
                <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide text-green-900 dark:text-white">
                  Poste
                </th>
                <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide text-green-900 dark:text-white">
                  Entreprise
                </th>
                <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide text-green-900 dark:text-white">
                  Date
                </th>
                <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide text-green-900 dark:text-white">
                  Statut
                </th>
                <th className="p-3 text-center text-sm font-semibold uppercase tracking-wide text-green-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-transparent divide-y divide-green-200 dark:divide-gray-700">
              {candidatures.map(({ id, poste, entreprise, date, statut }) => (
                <tr
                  key={id}
                  className="hover:bg-green-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out cursor-default select-none"
                >
                  <td className="p-4 text-green-900 dark:text-white font-medium">{poste}</td>
                  <td className="p-4 text-green-800 dark:text-white font-semibold flex items-center gap-3">
                    <img
                      src={entreprise?.logoUrl || "http://localhost:3000/uploads/logo_entreprise.jpg"}

                      className="w-10 h-10 object-cover rounded-full border border-green-600 dark:border-green-300"
                    />

                    <span>{entreprise?.nom || entreprise}</span>
                  </td>

                  <td className="p-4 text-gray-700 dark:text-gray-300">
                    {new Date(date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-4 py-1 rounded-full font-semibold text-center 
                    ${statut?.toLowerCase() === "acceptée"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : statut?.toLowerCase() === "refusée"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            : statut?.toLowerCase() === "en attente"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }
                  `}
                    >
                      {statut}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {statut?.toLowerCase() === "acceptée" ? (
                      <button
                        disabled
                        className="bg-gray-300 text-gray-600 px-4 py-2 rounded-md font-semibold cursor-not-allowed"
                        title="Impossible d'annuler une candidature acceptée"
                      >
                        Acceptée
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAnnulerCandidature(id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-md transition duration-300 ease-in-out font-semibold"
                      >
                        Annuler
                      </button>
                    )}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>

  );
}
