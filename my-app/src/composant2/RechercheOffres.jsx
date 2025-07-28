import React, { useState, useEffect } from "react";
import axios from "axios";

export default function RechercheOffres() {
  const [offres, setOffres] = useState([]);
  const [terme, setTerme] = useState("");
  const [filtreRegion, setFiltreRegion] = useState("");
  const [filtreDomaine, setFiltreDomaine] = useState("");
  const [resultats, setResultats] = useState([]);
  const [offresOuvertes, setOffresOuvertes] = useState({});

  // Charger les offres au montage
  useEffect(() => {
    axios
      .get("http://localhost:3000/offres")
      .then((res) => setOffres(res.data))
      .catch((err) => console.error("Erreur récupération des offres :", err));
  }, []);

  // Met à jour les résultats à chaque changement des filtres ou des offres
  useEffect(() => {
    if (!offres.length) {
      setResultats([]);
      return;
    }

    // Copie toutes les offres
    let filtres = [...offres];

    const filtreTexte = terme.trim().toLowerCase();

    // Filtrage par texte dans titre, entreprise ou adresse (au lieu de lieu)
if (filtreTexte.length > 0) {
  filtres = filtres.filter((offre) => {
    const titre = offre.titre?.toLowerCase() || "";
    const entreprise = offre.entreprise?.toLowerCase() || "";
    const adresse = offre.adresse?.toLowerCase() || ""; // au lieu de lieu
    return (
      titre.includes(filtreTexte) ||
      entreprise.includes(filtreTexte) ||
      adresse.includes(filtreTexte)
    );
  });
}

// Filtrage par région (filtreRegion correspond à adresse)
if (filtreRegion) {
  filtres = filtres.filter((offre) => offre.adresse === filtreRegion);
}

// Filtrage par domaine (filtreDomaine correspond à secteur)
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

  const handlePostuler = async (offre) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Veuillez vous connecter d'abord.");

      const response = await axios.post(
        "http://localhost:3000/candidatures",
        {
          offre_id: offre.id,
          poste: offre.titre,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert("Vous avez déjà postulé à cette offre.");
      } else {
        console.error(err);
        alert("Erreur lors de la candidature.");
      }
    }
  };

  const regions = Array.from(new Set(offres.map((o) => o.adresse).filter(Boolean))).sort();
  const domaines = Array.from(new Set(offres.map((o) => o.secteur).filter(Boolean))).sort();

  return (
    <section className="p-6 max-w-7xl mx-auto">
      <h2 className="text-4xl font-extrabold mb-10 text-green-900 text-center">
        Recherche d’offres d’emploi
      </h2>

      {/* Barre de recherche et filtres */}
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

      {/* Liste des offres */}
      <div className="flex flex-col gap-8 max-h-[80vh] overflow-y-auto px-2 sm:px-6">
  {resultats.map((offre) => {
    const estOuvert = offresOuvertes[offre.id];

    return (
      <div
        key={offre.id}
        className="bg-transparent dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform duration-300 p-6"
      >
        <div className="grid sm:grid-cols-[140px_1fr] gap-6">
          {/* Logo */}
          <div className="flex justify-center items-center w-32 h-32 overflow-hidden rounded-lg border-2 border-green-400 dark:border-green-600 shadow-sm">
            <img
              src={`http://localhost:3000${offre.logo}`}
              alt={`Logo de ${offre.entreprise}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Contenu */}
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

            <div className="mt-6">
              <button
                type="button"
                onClick={() => handlePostuler(offre)}
                className="bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition"
              >
                Postuler
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  })}
</div>

    </section>
  );
}
