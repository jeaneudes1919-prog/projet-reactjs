import React, { useEffect, useState } from "react";
import { EyeIcon, XCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";

export default function ListeCandidats() {
  const [candidats, setCandidats] = useState([]);
  const [selected, setSelected] = useState(null);
  const [raison, setRaison] = useState("");
  const [alerte, setAlerte] = useState({ type: "", message: "" });
  const [confirmation, setConfirmation] = useState({ ouverte: false, action: null, id: null });

  useEffect(() => {
    fetchCandidats();
  }, []);

  const fetchCandidats = async () => {
    try {
      const res = await axios.get("http://localhost:3000/candidats");
      setCandidats(res.data);
    } catch (err) {
      afficherAlerte("error", "Erreur chargement candidats");
      console.error("Erreur chargement candidats :", err);
    }
  };

  const voirDetails = async (id) => {
    try {
      const res = await axios.get(`http://localhost:3000/candidats/${id}`);
      const cvParsed = res.data.cv.map((cv) => ({
        ...cv,
        postes: parseJSON(cv.postes),
        competences: parseJSON(cv.competences),
        langues: parseJSON(cv.langues),
        diplomes: parseJSON(cv.diplomes),
      }));
      setSelected({ ...res.data, cv: cvParsed });
      setRaison(""); // Reset raison à chaque ouverture
    } catch (err) {
      afficherAlerte("error", "Erreur récupération détails");
      console.error("Erreur détails :", err);
    }
  };

  const parseJSON = (data) => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return [];
    }
  };

  const afficherAlerte = (type, message) => {
    setAlerte({ type, message });
    setTimeout(() => setAlerte({ type: "", message: "" }), 4000);
  };

  // Ouvre la modale de confirmation (action = suspendre ou reactiver)
  const demanderConfirmation = (action, id) => {
    if (!raison.trim()) {
      afficherAlerte("error", action === "suspendre" ? "Veuillez saisir la raison de suspension." : "Veuillez saisir un message de réactivation.");
      return;
    }
    setConfirmation({ ouverte: true, action, id });
  };

  const confirmerAction = async () => {
    try {
      if (confirmation.action === "suspendre") {
        await axios.put(`http://localhost:3000/candidats/${confirmation.id}/suspendre`, { raison });
        afficherAlerte("success", "Candidat suspendu avec succès");
      } else if (confirmation.action === "reactiver") {
        await axios.put(`http://localhost:3000/candidats/${confirmation.id}/reactiver`, { raison });
        afficherAlerte("success", "Candidat réactivé avec succès");
      }
      fetchCandidats();
      setSelected(null);
      setRaison("");
    } catch (err) {
      afficherAlerte("error", "Erreur lors de la mise à jour du candidat");
      console.error("Erreur mise à jour :", err);
    } finally {
      setConfirmation({ ouverte: false, action: null, id: null });
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-full relative">
      <h2 className="text-4xl font-extrabold mb-8 text-gray-900 dark:text-gray-100">Liste des candidats</h2>

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
              {["Photo", "Nom", "Prénom", "Date création", "Statut", "Voir détails"].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-sm font-semibold text-white uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {candidats.map(({ id, photo, nom, prenom, date_creation, statut }) => (
              <tr key={id} className="hover:bg-indigo-50 dark:hover:bg-indigo-900 transition">
                <td className="px-6 py-4">
                  <img src={`http://localhost:3000${photo}`} alt={prenom} className="w-12 h-12 rounded-full ring-2 ring-indigo-500" />
                </td>
                <td className="px-6 py-4">{nom}</td>
                <td className="px-6 py-4">{prenom}</td>
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
                  <button onClick={() => voirDetails(id)} className="text-indigo-600 hover:text-indigo-900">
                    <EyeIcon className="w-6 h-6 mx-auto" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modale de détails */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-8 relative shadow-xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-white">
              ×
            </button>

            <div className="text-center">
              <img
                src={`http://localhost:3000${selected.photoUrl}`}
                alt={selected.nom}
                className="w-24 h-24 mx-auto rounded-full ring-4 ring-indigo-500 mb-4"
              />
              <h3 className="text-2xl font-bold mb-2">
                {selected.prenom} {selected.nom}
              </h3>
              <p className="text-sm text-gray-500">{selected.email}</p>
              <p className="text-sm text-gray-500">{selected.telephone}</p>
              <p className="text-sm text-gray-500 mb-4">
                Créé le {new Date(selected.date_creation).toLocaleDateString("fr-FR")}
              </p>

              <p className="text-left font-semibold text-indigo-600 mb-2">CV du candidat :</p>
              {/* CV */}
              {selected.cv?.length > 0 ? (
                selected.cv.map((cv, i) => (
                  <div key={i} className="text-left bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
                    <p className="mb-2">
                      <strong>Résumé :</strong> {cv.resume}
                    </p>
                    <p className="mb-2">
                      <strong>Expérience :</strong> {cv.experience}
                    </p>
                    <p className="mb-2">
                      <strong>Date de naissance :</strong>{" "}
                      {cv.date_naissance ? new Date(cv.date_naissance).toLocaleDateString("fr-FR") : "N/A"}
                    </p>

                    {cv.postes?.length > 0 && (
                      <>
                        <p className="font-semibold mt-2">Postes :</p>
                        <ul className="list-disc list-inside">{cv.postes.map((poste, j) => <li key={j}>{poste}</li>)}</ul>
                      </>
                    )}

                    {cv.diplomes?.length > 0 && (
                      <>
                        <p className="font-semibold mt-2">Diplômes :</p>
                        <ul className="list-disc list-inside">{cv.diplomes.map((dip, j) => <li key={j}>{dip}</li>)}</ul>
                      </>
                    )}

                    {cv.competences?.length > 0 && (
                      <>
                        <p className="font-semibold mt-2">Compétences :</p>
                        <ul className="list-disc list-inside">{cv.competences.map((c, j) => <li key={j}>{c}</li>)}</ul>
                      </>
                    )}

                    {cv.langues?.length > 0 && (
                      <>
                        <p className="font-semibold mt-2">Langues :</p>
                        <ul className="list-disc list-inside">{cv.langues.map((l, j) => <li key={j}>{l}</li>)}</ul>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm italic text-gray-400">Aucun CV</p>
              )}

              {/* Raison */}
              <textarea
                placeholder={selected.statut === "actif" ? "Raison de la suspension" : "Message de réactivation"}
                className="w-full p-3 mt-4 rounded-md border border-gray-300 dark:bg-gray-700 dark:text-white"
                value={raison}
                onChange={(e) => setRaison(e.target.value)}
              />

              {/* Boutons suspendre / réactiver */}
              {selected.statut === "actif" ? (
                <button
                  onClick={() => demanderConfirmation("suspendre", selected.id)}
                  className="mt-4 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center justify-center gap-2"
                >
                  <XCircleIcon className="w-5 h-5" />
                  Suspendre le candidat
                </button>
              ) : (
                <button
                  onClick={() => demanderConfirmation("reactiver", selected.id)}
                  className="mt-4 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                >
                  Réactiver le candidat
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
                ? "Confirmer la suspension de ce candidat ?"
                : "Confirmer la réactivation de ce candidat ?"}
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
