import React, { useEffect, useState } from "react";
import axios from "axios";
import HeroCarousel from "./HeroCarousel";
import CommentCaMarche from "./commentCaMarche";
export default function Accueil() {
  const [offres, setOffres] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [region, setRegion] = useState("");
  const [domaine, setDomaine] = useState("");
  const [resultats, setResultats] = useState([]);
  const [isHovered, setIsHovered] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/offres")
      .then((res) => {
        setOffres(res.data);
        setResultats(res.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let tmp = offres.filter((o) =>
      [o.titre, o.entreprise, o.adresse]
        .join(" ")
        .toLowerCase()
        .includes(recherche.trim().toLowerCase())
    );
    if (region) tmp = tmp.filter((o) => o.adresse === region);
    if (domaine) tmp = tmp.filter((o) => o.secteur === domaine);
    setResultats(tmp);
  }, [recherche, region, domaine, offres]);

  const regions = Array.from(new Set(offres.map((o) => o.adresse))).sort();
  const domaines = Array.from(new Set(offres.map((o) => o.secteur))).sort();
  const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR");

  return (
    <main className="min-h-screen flex flex-col bg-green-50 text-green-900 font-sans dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500 ease-in-out">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/60 backdrop-blur-sm py-4 border-b border-gray-200 dark:border-gray-800 transition-transform duration-700 ease-out animate-fadeInDown">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* LOGO + NOM */}
          <div className="flex items-center space-x-2 transform transition-transform duration-500 hover:scale-105">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg flex items-center justify-center shadow-md hover:rotate-6 transition duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-400 transition-colors duration-300">
              JobFinder
            </h1>
          </div>

          {/* BOUTONS */}
          <nav className="flex items-center space-x-3">
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300 hover:scale-105"
              onClick={() => (window.location = "./Connexion")}
            >
              Connexion
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition duration-300 shadow-md"
              onClick={() => (window.location = "./InscriptionEmploie")}
            >
              Inscription
            </button>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <HeroCarousel />


      {/* RECHERCHE + FILTRES */}
      <section
        id="offres"
        className="py-16 px-6 bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-500"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 dark:text-white">
              Trouvez votre opportunité
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Filtrer parmi nos offres pour trouver celle qui vous correspond.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow border border-gray-200 dark:border-gray-700 transition-colors duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr,1fr] gap-4 items-end">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Mots-clés
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    id="search"
                    type="text"
                    placeholder="Développeur, Designer, Marketing..."
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="region"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Région
                </label>
                <select
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="block w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="">Toutes</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="domaine"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Secteur
                </label>
                <select
                  id="domaine"
                  value={domaine}
                  onChange={(e) => setDomaine(e.target.value)}
                  className="block w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="">Tous</option>
                  {domaines.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* OFFRES */}
        <div className="max-w-7xl mx-auto px-6 mt-16">
          <h3 className="text-2xl font-bold mb-8 dark:text-white">
            {resultats.length}{" "}
            {resultats.length > 1
              ? "offres disponibles"
              : "offre disponible"}
          </h3>

          {resultats.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-500 dark:text-gray-300">
              <div className="mx-auto w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-600 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium mb-2">
                Aucun résultat trouvé
              </h4>
              <p>Essayez d'élargir vos critères de recherche.</p>
              <button
                onClick={() => {
                  setRecherche("");
                  setRegion("");
                  setDomaine("");
                }}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {resultats.map((offre) => (
                <div
                  key={offre.id}
                  className={`bg-white text-gray-900 dark:bg-gray-800 dark:text-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 transform hover:-translate-y-1 ${
                    isHovered === offre.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onMouseEnter={() => setIsHovered(offre.id)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <div className="relative">
                    <img
                      src={`http://localhost:3000${offre.logo}`}
                      alt={offre.titre}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs font-semibold text-gray-900 dark:text-gray-100 shadow-sm">
                        {offre.secteur}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold line-clamp-1">
                        {offre.titre}
                      </h3>
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                        {offre.candidatures} candidat
                        {offre.candidatures > 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                      {offre.entreprise}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center">
                      📍 {offre.adresse}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">
                      {offre.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center">
                        📅 {formatDate(offre.dateLimite)}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">
                        Voir détails
                      </span>
                    </div>
                    <button
                      onClick={() => (window.location = "./Connexion")}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg hover:shadow-md transition-all duration-300 flex items-center justify-center"
                    >
                      Postuler maintenant
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <CommentCaMarche />

      {/* FOOTER */}
      <footer className="mt-auto bg-blue-100 text-blue-900 pt-10 pb-6 px-6 border-t border-blue-200 dark:bg-black dark:text-gray-300 dark:border-gray-700 transition-colors duration-500">
  <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
    <div className="flex items-center space-x-4">
      <span className="font-semibold text-lg text-blue-800 dark:text-white">
        JobFinder
      </span>
    </div>
    <p className="text-sm text-blue-700 dark:text-gray-400">
      © {new Date().getFullYear()} JobFinder. Tous droits réservés.
    </p>
  </div>
</footer>

    </main>
  );
}
