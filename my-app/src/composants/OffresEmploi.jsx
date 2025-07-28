import React, { useState, useEffect } from "react";
import axios from "axios";
import { EyeIcon } from "@heroicons/react/24/outline";

function CVSection({ titre, data }) {
  let parsedData;

  try {
    parsedData = typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    parsedData = [];
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mt-4">{titre} :</h3>
      {Array.isArray(parsedData) && parsedData.length > 0 ? (
        <ul className="list-disc list-inside bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
          {parsedData.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
          Aucun {titre.toLowerCase()}.
        </p>
      )}
    </div>
  );
}

export default function HistoriqueOffres() {
  const [offres, setOffres] = useState([]);
  const [offresActives, setOffresActives] = useState([]);
  const [candidatActif, setCandidatActif] = useState(null);

  const [recherche, setRecherche] = useState("");
  const [filtreRegion, setFiltreRegion] = useState("");
  const [filtretitre, setFiltretitre] = useState("");
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    async function fetchOffres() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/offres", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOffres(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur fetchOffres:", err);
        setErreur("Erreur lors du chargement des offres");
        setLoading(false);
      }
    }
    fetchOffres();
  }, []);

  function supprimerOffre(id) {
    if (!window.confirm("Voulez-vous vraiment supprimer cette offre ?")) return;

    axios
      .delete(`/api/offres/${id}`)
      .then((response) => {
        alert(response.data.message);

        // Mettre à jour la liste localement en filtrant l'offre supprimée
        setOffres((prevOffres) => prevOffres.filter((offre) => offre.id !== id));
      })
      .catch((error) => {
        console.error(error);
        alert(
          error.response?.data?.message || "Erreur lors de la suppression de l'offre."
        );
      });
  }

  const changerStatut = async (offreId, candidatId, nouveauStatut) => {
    try {
      await axios.post(
        `http://localhost:3000/api/offres/${offreId}/candidats/${candidatId}/statut`,
        { statut: nouveauStatut }
      );
      setOffres((prev) =>
        prev.map((offre) =>
          offre.id === offreId
            ? {
                ...offre,
                candidats: offre.candidats.map((c) =>
                  c.id === candidatId ? { ...c, statut: nouveauStatut } : c
                ),
              }
            : offre
        )
      );
    } catch (error) {
      console.error("Erreur changement statut:", error);
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  // Nouvelle fonction d'acceptation avec confirmation irréversible
  const accepterCandidat = (offreId, candidatId) => {
    const confirmation = window.confirm(
      "⚠️ Vous êtes sur le point d'accepter définitivement ce candidat.\n" +
      "Cette action est irréversible. Vous ne pourrez plus refuser ni annuler.\n\n" +
      "Confirmez-vous cette acceptation ?"
    );
    if (confirmation) {
      changerStatut(offreId, candidatId, "acceptée");
    }
  };

  if (loading)
    return (
      <p className="text-center text-blue-600 dark:text-blue-400 mt-20 text-xl font-semibold">
        Chargement...
      </p>
    );
  if (erreur)
    return (
      <p className="text-center text-red-600 dark:text-red-400 mt-20 text-xl font-semibold">
        {erreur}
      </p>
    );

  const regionsDisponibles = [...new Set(offres.map((o) => o.lieu))];
  const titresDisponibles = [...new Set(offres.map((o) => o.titre))];

  const offresFiltrees = offres.filter((offre) => {
    const matchRecherche =
      offre.titre.toLowerCase().includes(recherche.toLowerCase()) ||
      offre.lieu.toLowerCase().includes(recherche.toLowerCase());

    const matchRegion = filtreRegion ? offre.lieu === filtreRegion : true;
    const matchTitre = filtretitre ? offre.titre === filtretitre : true;

    return matchRecherche && matchRegion && matchTitre;
  });

  return (
    <section className="max-w-7xl mx-auto p-8 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg">
      <h1 className="text-4xl font-extrabold text-blue-900 dark:text-blue-400 mb-10 text-center">
        Historique des Offres
      </h1>

      {/* Filtres */}
      <form className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
        <input
          type="text"
          placeholder="Recherche par titre ou lieu"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="flex-grow px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
        />
        <select
          value={filtreRegion}
          onChange={(e) => setFiltreRegion(e.target.value)}
          className="w-56 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
        >
          <option value="">Toutes les régions</option>
          {regionsDisponibles.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <select
          value={filtretitre}
          onChange={(e) => setFiltretitre(e.target.value)}
          className="w-56 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
        >
          <option value="">Tous les titres</option>
          {titresDisponibles.map((titre) => (
            <option key={titre} value={titre}>
              {titre}
            </option>
          ))}
        </select>
      </form>

      {/* Liste des offres */}
      <div className="space-y-8 max-h-[650px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 dark:scrollbar-thumb-blue-700 dark:scrollbar-track-blue-900">
        {offresFiltrees.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 text-lg mt-20">
            Aucune offre ne correspond à vos critères.
          </p>
        )}

        {offresFiltrees.map((offre) => (
          <article
            key={offre.id}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
          >
            {/* Bouton SUPPRIMER en haut à droite */}
            <button
              onClick={() => supprimerOffre(offre.id)}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-1 text-sm rounded-md shadow-md transition"
            >
              Supprimer
            </button>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-400">
                  {offre.titre}
                </h2>
                <p className="text-sm text-blue-600 dark:text-blue-300 font-medium mt-1">
                  {offre.lieu} &bull; Publié le{" "}
                  {new Date(offre.datePublication).toLocaleDateString()}
                </p>
                <p className="mt-2 text-gray-700 dark:text-gray-300">
                  Candidats :{" "}
                  <span className="font-semibold">{offre.candidats.length}</span>
                </p>
              </div>

              {offre.candidats.length > 0 && (
                <button
                  onClick={() =>
                    setOffresActives((prev) =>
                      prev.includes(offre.id)
                        ? prev.filter((id) => id !== offre.id)
                        : [...prev, offre.id]
                    )
                  }
                  className="px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-md transition"
                >
                  {offresActives.includes(offre.id)
                    ? "Masquer les candidats"
                    : "Voir les candidats"}
                </button>
              )}
            </div>

            {/* Liste des candidats */}
            {offresActives.includes(offre.id) && (
              <div className="mt-6 bg-blue-50 dark:bg-blue-900 rounded-xl p-5 shadow-inner border border-blue-200 dark:border-blue-700 overflow-x-auto">
                <table className="w-full table-auto text-sm md:text-base">
                  <thead>
                    <tr className="bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-200 text-left">
                      <th className="p-3">Candidat</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offre.candidats.map((candidat) => (
                      <tr
                        key={candidat.id}
                        className="bg-white dark:bg-gray-700 border-b dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-800 transition"
                      >
                        <td className="p-3 flex items-center gap-3 font-semibold text-blue-800 dark:text-blue-300">
                          <img
                            src={
                              candidat.photoUrl
                                ? `http://localhost:3000${candidat.photoUrl}`
                                : `https://via.placeholder.com/40?text=${encodeURIComponent(
                                    candidat.nom[0] +
                                      (candidat.prenom ? candidat.prenom[0] : "")
                                  )}`
                            }
                            alt={`Photo de ${candidat.nom} ${candidat.prenom}`}
                            className="rounded-full w-10 h-10 object-cover border border-blue-300 dark:border-blue-600"
                          />
                          <span>
                            {candidat.nom} {candidat.prenom}
                          </span>
                        </td>

                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              candidat.statut === "acceptée"
                                ? "bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200"
                                : candidat.statut === "refusée"
                                ? "bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200"
                                : "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200"
                            }`}
                          >
                            {candidat.statut === "acceptée"
                              ? "Accepté"
                              : candidat.statut === "refusée"
                              ? "Refusé"
                              : "En attente"}
                          </span>
                        </td>

                        <td className="p-3 flex flex-wrap gap-2 items-center">
                          {candidat.statut === "en attente" ? (
                            <>
                              {/* Acceptation avec confirmation irréversible */}
                              <button
                                onClick={() =>
                                  accepterCandidat(offre.id, candidat.id)
                                }
                                className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-semibold"
                              >
                                Accepter
                              </button>

                              <button
                                onClick={() =>
                                  changerStatut(offre.id, candidat.id, "refusée")
                                }
                                className="px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-semibold"
                              >
                                Refuser
                              </button>
                            </>
                          ) : candidat.statut === "refusée" ? (
                            // Après refus, on peut annuler
                            <button
                              onClick={() =>
                                changerStatut(offre.id, candidat.id, "en attente")
                              }
                              className="px-4 py-1 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition font-semibold"
                            >
                              Annuler refus
                            </button>
                          ) : (
                            // Après acceptation, plus possible d'annuler
                            <button
                              disabled
                              title="Acceptation irréversible"
                              className="px-4 py-1 bg-green-400 cursor-not-allowed text-white rounded-md font-semibold"
                            >
                              Accepté (irréversible)
                            </button>
                          )}

                          <button
                            onClick={() => setCandidatActif(candidat)}
                            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Modal candidat */}
      {candidatActif && (
        <div
          onClick={() => setCandidatActif(null)}
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-8 shadow-lg max-h-[90vh] overflow-y-auto relative"
          >
            <button
              onClick={() => setCandidatActif(null)}
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 text-3xl font-bold"
            >
              &times;
            </button>

            <div className="flex flex-col items-center mb-6">
              {console.log("photoUrl candidatActif:", candidatActif.photoUrl)}

              <img
                src={
                  candidatActif.photoUrl
                    ? `http://localhost:3000${candidatActif.photoUrl}`
                    : `https://via.placeholder.com/150?text=${encodeURIComponent(
                        candidatActif.nom
                      )}`
                }
                alt={`Photo de ${candidatActif.nom}`}
                className="rounded-lg border border-blue-300 dark:border-blue-600 w-40 h-40 object-cover"
              />
            </div>

            <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-400 text-center mb-6">
              {candidatActif.nom} {candidatActif.prenom}
            </h2>

            <div className="space-y-4 text-gray-800 dark:text-gray-300 text-lg">
              <p>
                <strong>Email :</strong> {candidatActif.email}
              </p>
              <p>
                <strong>Téléphone :</strong> {candidatActif.telephone}
              </p>

              <h3 className="text-xl font-semibold mt-4">Résumé du CV :</h3>
              <p className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                {candidatActif.cv_resume || "Aucun résumé disponible."}
              </p>

              <h3 className="text-xl font-semibold mt-4">Expérience :</h3>
              <p className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                {candidatActif.cv_experience || "Non renseignée."}
              </p>

              {/* Fonction pour afficher les listes JSON */}
              <CVSection titre="Postes" data={candidatActif.cv_postes} />
              <CVSection titre="Diplômes" data={candidatActif.cv_diplomes} />
              <CVSection titre="Compétences" data={candidatActif.cv_competences} />
              <CVSection titre="Langues" data={candidatActif.cv_langues} />
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setCandidatActif(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-8 py-3 font-semibold transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
