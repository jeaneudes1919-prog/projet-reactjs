import React, { useState, useEffect } from "react";
import axios from "axios";

export default function GestionOffresAdmin() {
  const [offres, setOffres] = useState([]);
  const [terme, setTerme] = useState("");
  const [filtreRegion, setFiltreRegion] = useState("");
  const [filtreDomaine, setFiltreDomaine] = useState("");
  const [resultats, setResultats] = useState([]);
  const [offresOuvertes, setOffresOuvertes] = useState({});
  const [candidatsOffre, setCandidatsOffre] = useState(null);

  // Nouveaux états pour modale et alerte personnalisée
  const [alerte, setAlerte] = useState({ type: "", message: "" });
  const [modalSuppression, setModalSuppression] = useState({ ouverte: false, offreId: null });
  const [raisonSuppression, setRaisonSuppression] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3000/offres")
      .then((res) => setOffres(res.data))
      .catch((err) => console.error("Erreur récupération des offres :", err));
  }, []);

  useEffect(() => {
    if (!offres.length) {
      setResultats([]);
      return;
    }

    let filtres = [...offres];
    const filtreTexte = terme.trim().toLowerCase();

    if (filtreTexte.length > 0) {
      filtres = filtres.filter((offre) => {
        const titre = offre.titre?.toLowerCase() || "";
        const entreprise = offre.entreprise?.toLowerCase() || "";
        const adresse = offre.adresse?.toLowerCase() || "";
        return (
          titre.includes(filtreTexte) ||
          entreprise.includes(filtreTexte) ||
          adresse.includes(filtreTexte)
        );
      });
    }

    if (filtreRegion) {
      filtres = filtres.filter((offre) => offre.adresse === filtreRegion);
    }

    if (filtreDomaine) {
      filtres = filtres.filter((offre) => offre.secteur === filtreDomaine);
    }

    setResultats(filtres);
  }, [terme, filtreRegion, filtreDomaine, offres]);

  const toggleVoirPlus = (id) => {
    setOffresOuvertes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR");
  };

  const handleVoirCandidats = async (offreId) => {
    try {
      const res = await axios.get(`http://localhost:3000/offres/${offreId}/candidats`);
      setCandidatsOffre({ offreId, candidats: res.data });
    } catch (err) {
      console.error("Erreur récupération candidats :", err);
      setAlerte({ type: "error", message: "Impossible de charger les candidats." });
      setTimeout(() => setAlerte({ type: "", message: "" }), 4000);
    }
  };

  // Ouvre la modale de suppression personnalisée
  const handleSupprimerOffre = (offreId) => {
    setModalSuppression({ ouverte: true, offreId });
    setRaisonSuppression("");
  };

  // Confirme la suppression avec raison
  const confirmerSuppression = async () => {
    if (!raisonSuppression.trim()) {
      setAlerte({ type: "error", message: "La raison de suppression est obligatoire." });
      setTimeout(() => setAlerte({ type: "", message: "" }), 4000);
      return;
    }
    try {
      await axios.delete(`http://localhost:3000/offres/${modalSuppression.offreId}`, {
        data: { raison: raisonSuppression },
      });
      setOffres((prev) => prev.filter((o) => o.id !== modalSuppression.offreId));
      if (candidatsOffre?.offreId === modalSuppression.offreId) setCandidatsOffre(null);
      setAlerte({ type: "success", message: "Offre supprimée avec succès." });
      setModalSuppression({ ouverte: false, offreId: null });
    } catch (err) {
      console.error("Erreur suppression offre :", err);
      setAlerte({ type: "error", message: "Erreur lors de la suppression." });
    }
    setTimeout(() => setAlerte({ type: "", message: "" }), 4000);
  };

  const regions = Array.from(new Set(offres.map((o) => o.adresse).filter(Boolean))).sort();
  const domaines = Array.from(new Set(offres.map((o) => o.secteur).filter(Boolean))).sort();

  return (
    <section className="p-6 max-w-7xl mx-auto">
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

      <h2 className="text-4xl font-extrabold mb-10 text-green-900 text-center">
        Gestion des offres d’emploi
      </h2>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="mb-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-4xl mx-auto bg-transparent dark:bg-transparent"
      >
        <input
          type="text"
          placeholder="Rechercher par titre, entreprise ou lieu..."
          value={terme}
          onChange={(e) => setTerme(e.target.value)}
          className="flex-grow border-2 border-green-600 dark:border-green-400 rounded-lg px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-transparent text-green-900 dark:text-white placeholder-green-600 dark:placeholder-green-400"
        />

        <select
          value={filtreRegion}
          onChange={(e) => setFiltreRegion(e.target.value)}
          className="border-2 border-green-600 dark:border-green-400 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-transparent text-green-900 dark:text-white"
        >
          <option value="">Toutes les régions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>

        <select
          value={filtreDomaine}
          onChange={(e) => setFiltreDomaine(e.target.value)}
          className="border-2 border-green-600 dark:border-green-400 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-transparent text-green-900 dark:text-white"
        >
          <option value="">Tous les domaines</option>
          {domaines.map((domaine) => (
            <option key={domaine} value={domaine}>
              {domaine}
            </option>
          ))}
        </select>
      </form>

      {resultats.length === 0 && terme && (
        <p className="text-center text-red-600 font-semibold">
          Aucun résultat trouvé pour ces critères.
        </p>
      )}

      <div className="flex flex-col gap-8 max-h-[80vh] overflow-y-auto px-2 sm:px-6">
        {resultats.map((offre) => {
          const estOuvert = offresOuvertes[offre.id];

          return (
            <div
              key={offre.id}
              className="bg-transparent dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform duration-300 p-6"
            >
              <div className="grid sm:grid-cols-[140px_1fr] gap-6">
                <div className="flex justify-center items-center w-32 h-32 overflow-hidden rounded-lg border-2 border-green-400 dark:border-green-600 shadow-sm">
                  <img
                    src={`http://localhost:3000${offre.logo}`}
                    alt={`Logo de ${offre.entreprise}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="w-full flex flex-col">
                  <h3 className="text-2xl font-bold text-green-800 dark:text-white">{offre.titre}</h3>
                  <p className="text-green-700 dark:text-white font-semibold">{offre.entreprise}</p>
                  <p className="text-green-600 dark:text-gray-300 italic mb-1">
                    {offre.lieu} — <span>{offre.region}</span>
                  </p>
                  <p className="text-green-600 dark:text-gray-300 font-semibold mb-3">{offre.domaine}</p>

                  <p className="text-green-700 dark:text-gray-200 leading-relaxed">
                    {estOuvert || offre.description.length <= 120
                      ? offre.description
                      : offre.description.slice(0, 120) + "..."}
                  </p>

                  {offre.description.length > 120 && (
                    <button
                      type="button"
                      onClick={() => toggleVoirPlus(offre.id)}
                      className="text-green-700 dark:text-gray-300 hover:underline font-semibold mt-3 self-start"
                    >
                      {estOuvert ? "Voir moins" : "Voir les détails"}
                    </button>
                  )}

                  <div className="flex justify-between mt-5 text-sm text-green-600 dark:text-gray-400 font-medium">
                    <span>
                      {offre.candidatures} candidat{offre.candidatures > 1 ? "s" : ""}
                    </span>
                    <span>Date limite : {formatDate(offre.dateLimite)}</span>
                  </div>

                  <div className="mt-6 flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleVoirCandidats(offre.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition"
                    >
                      Voir candidats
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSupprimerOffre(offre.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition"
                    >
                      Supprimer l’offre
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modale candidats */}
      {candidatsOffre && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => setCandidatsOffre(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-8 relative shadow-xl overflow-auto max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setCandidatsOffre(null)}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition text-2xl font-bold"
              aria-label="Fermer la modale"
            >
              ×
            </button>

            <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Candidats pour l’offre #{candidatsOffre.offreId}
            </h3>

            {candidatsOffre.candidats.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300">Aucun candidat n’a postulé pour cette offre.</p>
            ) : (
              <ul className="divide-y divide-gray-300 dark:divide-gray-700 max-h-[60vh] overflow-y-auto">
                {candidatsOffre.candidats.map((candidat) => (
                  <li key={candidat.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={`http://localhost:3000${candidat.photoUrl || "/default.jpg"}`}
                        alt="Photo candidat"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {candidat.prenom} {candidat.nom}
                        </p>
                      </div>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(candidat.date_postulation).toLocaleDateString("fr-FR")}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Modale suppression personnalisée */}
      {modalSuppression.ouverte && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setModalSuppression({ ouverte: false, offreId: null })}
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-sm w-full shadow-lg text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Confirmer la suppression de cette offre ?
            </h3>

            <textarea
              placeholder="Veuillez entrer la raison de la suppression"
              className="w-full p-3 mb-4 rounded-md border border-gray-300 dark:bg-gray-700 dark:text-white"
              value={raisonSuppression}
              onChange={(e) => setRaisonSuppression(e.target.value)}
            />

            <div className="flex justify-center gap-6">
              <button
                onClick={() => setModalSuppression({ ouverte: false, offreId: null })}
                className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmerSuppression}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
