import React, { useEffect, useState } from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import axios from "axios";

export default function ListeEntreprises() {
  const [entreprises, setEntreprises] = useState([]);
  const [selected, setSelected] = useState(null);
  const [raison, setRaison] = useState("");
  const [alerte, setAlerte] = useState({ type: "", message: "" });
  const [confirmation, setConfirmation] = useState({ ouverte: false, action: null, id: null });

  useEffect(() => {
    fetchEntreprises();
  }, []);

  const fetchEntreprises = async () => {
    try {
      const res = await axios.get("http://localhost:3000/entreprises");
      setEntreprises(res.data);
    } catch (err) {
      afficherAlerte("error", "Erreur chargement entreprises");
      console.error("Erreur chargement entreprises :", err);
    }
  };

  const voirDetails = async (id) => {
    try {
      const res = await axios.get(`http://localhost:3000/entreprises/${id}`);
      setSelected(res.data);
      setRaison("");
    } catch (err) {
      afficherAlerte("error", "Erreur récupération détails entreprise");
      console.error("Erreur détails entreprise :", err);
    }
  };

  const afficherAlerte = (type, message) => {
    setAlerte({ type, message });
    setTimeout(() => setAlerte({ type: "", message: "" }), 4000);
  };

  // Ouvre modale confirmation
  const demanderConfirmation = (action, id) => {
    if (!raison.trim()) {
      afficherAlerte(
        "error",
        action === "suspendre"
          ? "Veuillez entrer une raison de suspension."
          : "Veuillez entrer un message de réactivation."
      );
      return;
    }
    setConfirmation({ ouverte: true, action, id });
  };

  const confirmerAction = async () => {
    try {
      if (confirmation.action === "suspendre") {
        await axios.put(`http://localhost:3000/entreprises/${confirmation.id}/suspendre`, { raison });
        afficherAlerte("success", "Entreprise suspendue avec succès");
      } else if (confirmation.action === "reactiver") {
        await axios.put(`http://localhost:3000/entreprises/${confirmation.id}/reactiver`, { raison });
        afficherAlerte("success", "Entreprise réactivée avec succès");
      }
      fetchEntreprises();
      setSelected(null);
      setRaison("");
    } catch (err) {
      afficherAlerte("error", "Erreur lors de la mise à jour de l'entreprise");
      console.error("Erreur mise à jour entreprise :", err);
    } finally {
      setConfirmation({ ouverte: false, action: null, id: null });
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-full relative">
      <h2 className="text-4xl font-extrabold mb-8 text-gray-900 dark:text-gray-100">Liste des entreprises</h2>

      {/* Alerte personnalisée */}
      {alerte.message && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-md text-white font-semibold z-50 ${
            alerte.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {alerte.message}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-indigo-600 dark:bg-indigo-700">
            <tr>
              {["Logo", "Nom", "Date création", "Statut", "Voir détails"].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {entreprises.map(({ id, logo, nom, date_creation, statut }) => (
              <tr key={id} className="hover:bg-indigo-50 dark:hover:bg-indigo-900 transition cursor-pointer">
                <td className="px-6 py-4">
                  <img
                    src={`http://localhost:3000${logo}`}
                    alt={`Logo ${nom}`}
                    className="w-12 h-12 rounded object-cover ring-2 ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4">{nom}</td>
                <td className="px-6 py-4">{new Date(date_creation).toLocaleDateString("fr-FR")}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      statut === "actif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {statut}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => voirDetails(id)}
                    className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400 transition"
                  >
                    <EyeIcon className="w-6 h-6 mx-auto" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modale détails */}
      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-8 relative shadow-xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-white"
            >
              ×
            </button>

            <div className="text-center">
              <img
                src={`http://localhost:3000${selected.logoUrl}`}
                alt={selected.nom}
                className="w-28 h-28 rounded mx-auto mb-6 ring-4 ring-indigo-500"
              />
              <h3 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">{selected.nom}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Secteur :</strong> {selected.secteur || "N/A"}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Adresse :</strong> {selected.adresse || "N/A"}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Description :</strong> {selected.description || "N/A"}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Nombre de connexions :</strong> {selected.nb_connexions || 0}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong>Email :</strong> {selected.email}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong>Téléphone :</strong> {selected.telephone}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong>Date création :</strong> {new Date(selected.date_creation).toLocaleDateString("fr-FR")}
              </p>
              <p className="text-indigo-600 dark:text-indigo-300 font-semibold mb-4">
                Nombre d'offres publiées : <span className="text-lg">{selected.offresCount || 0}</span>
              </p>

              {/* Textarea pour raison */}
              <textarea
                placeholder={selected.statut === "actif" ? "Raison de suspension" : "Message de réactivation"}
                className="w-full p-3 mt-4 rounded-md border border-gray-300 dark:bg-gray-700 dark:text-white"
                value={raison}
                onChange={(e) => setRaison(e.target.value)}
              />

              {/* Bouton suspendre ou réactiver */}
              {selected.statut === "actif" ? (
                <button
                  onClick={() => demanderConfirmation("suspendre", selected.id)}
                  className="mt-4 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                >
                  Suspendre l'entreprise
                </button>
              ) : (
                <button
                  onClick={() => demanderConfirmation("reactiver", selected.id)}
                  className="mt-4 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                >
                  Réactiver l'entreprise
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation */}
      {confirmation.ouverte && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setConfirmation({ ouverte: false, action: null, id: null })}
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-sm w-full shadow-lg text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {confirmation.action === "suspendre"
                ? "Confirmer la suspension de cette entreprise ?"
                : "Confirmer la réactivation de cette entreprise ?"}
            </h3>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setConfirmation({ ouverte: false, action: null, id: null })}
                className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmerAction}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Oui
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
}
