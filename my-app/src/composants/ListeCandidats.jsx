import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ListeCandidats() {
  const [candidats, setCandidats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [offreSelectionnee, setOffreSelectionnee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    async function fetchCandidats() {
      try {
        const res = await axios.get("http://localhost:3000/api/candidats-offres");
        setCandidats(res.data);
        setLoading(false);
      } catch (err) {
        setErreur("Erreur lors du chargement des candidats");
        setLoading(false);
      }
    }
    fetchCandidats();
  }, []);

  const candidatsFiltres = candidats.filter((c) =>
    c.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="max-w-7xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg">
      <h1 className="text-4xl font-extrabold text-blue-900 dark:text-blue-400 mb-8 text-center">
        Liste des candidats reçus
      </h1>

      <input
        type="search"
        placeholder="Recherche par nom du candidat..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full md:w-1/3 mb-8 px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500 transition"
      />

      {loading ? (
        <p className="text-center text-blue-600 dark:text-blue-400 text-lg font-semibold mt-20">
          Chargement...
        </p>
      ) : erreur ? (
        <p className="text-center text-red-600 dark:text-red-400 text-lg font-semibold mt-20">
          {erreur}
        </p>
      ) : candidatsFiltres.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 italic mt-20">
          Aucun candidat trouvé.
        </p>
      ) : (
        <>
          {/* Tableau */}
          <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            <table className="min-w-full text-left text-sm font-medium text-gray-900 dark:text-gray-100">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
                <tr>
                  <th className="px-8 py-4">Candidat</th>
                  <th className="px-8 py-4">Email</th>
                  <th className="px-8 py-4">Offre liée</th>
                  <th className="px-8 py-4">Détails</th>
                </tr>
              </thead>
              <tbody>
                {candidatsFiltres.map((candidat, idx) => (
                  <tr
                    key={candidat.id}
                    className={`
                      border-b border-gray-200 dark:border-gray-700
                      ${idx % 2 === 0 ? "bg-blue-50 dark:bg-blue-900/30" : "bg-white dark:bg-gray-900"}
                      hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer
                      transition
                    `}
                  >
                    <td className="px-8 py-4 text-blue-900 dark:text-blue-300 font-semibold flex items-center gap-3">
                      <img
                        src={
                          
                          candidat.photoUrl
                            ? `http://localhost:3000${candidat.photoUrl}`
                            : `https://via.placeholder.com/40?text=${encodeURIComponent(
                               
                              )}`
                        }
                        
                        className="rounded-full w-10 h-10 object-cover border border-blue-300 dark:border-blue-600"
                      />
                      <span>{candidat.nom} {candidat.prenom || ""}</span>
                    </td>
                    <td className="px-8 py-4 truncate max-w-xs">{candidat.email}</td>
                    <td className="px-8 py-4 font-semibold text-blue-800 dark:text-blue-400">
                      {candidat.offre?.titre || "Aucune"}
                    </td>
                    <td className="px-8 py-4 text-center">
                      <button
                        onClick={() => setOffreSelectionnee(candidat.offre)}
                        aria-label={`Voir détails de l'offre liée à ${candidat.nom}`}
                        className="inline-flex items-center justify-center p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-500 transition shadow-md"
                      >
                        {/* Icône œil SVG */}
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Popup modale offre */}
          {offreSelectionnee && (
            <div
              onClick={() => setOffreSelectionnee(null)}
              className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full p-8 shadow-lg max-h-[90vh] overflow-y-auto relative"
              >
                <button
                  onClick={() => setOffreSelectionnee(null)}
                  className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 text-3xl font-bold"
                  aria-label="Fermer la fenêtre"
                >
                  &times;
                </button>

                <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-400 mb-6 border-b border-gray-300 dark:border-gray-700 pb-3">
                  Détails de l'offre liée
                </h2>
                <p className="mb-2">
                  <strong>Titre :</strong>{" "}
                  <span className="text-blue-700 dark:text-blue-300 font-semibold">
                    {offreSelectionnee.titre}
                  </span>
                </p>
                <p className="mb-2">
                  <strong>Domaine :</strong> {offreSelectionnee.domaine || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Lieu :</strong> {offreSelectionnee.lieu || "N/A"}
                </p>
                <p className="mb-4">
                  <strong>Description :</strong>{" "}
                  {offreSelectionnee.description || (
                    <span className="italic text-gray-500 dark:text-gray-400">Pas de description</span>
                  )}
                </p>
                <p>
                  <strong>Date de publication :</strong>{" "}
                  {new Date(offreSelectionnee.datePublication).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
