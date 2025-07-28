import React, { useState } from "react";
import axios from "axios";

const PublierOffre = () => {
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    lieu: "",
    type_contrat: "",
    salaire: "",
    dateLimite: "",
    entreprise_id: parseInt(localStorage.getItem("userId")),
  });

  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErreur("");

    try {
      await axios.post("http://localhost:3000/api/offres/publier", formData);
      setMessage("✅ Offre publiée avec succès !");
      setFormData({
        titre: "",
        description: "",
        lieu: "",
        type_contrat: "",
        salaire: "",
        dateLimite: "",
        
      });
    } catch (err) {
      console.error(err);
      setErreur("❌ Une erreur est survenue !");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl mt-12 border border-gray-200 dark:border-gray-700">
      <h2 className="text-4xl font-extrabold text-blue-900 dark:text-blue-400 mb-8 text-center tracking-tight">
        Publier une Offre
      </h2>

      {message && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg font-semibold text-center animate-fadeIn">
          {message}
        </div>
      )}
      {erreur && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg font-semibold text-center animate-fadeIn">
          {erreur}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Titre + Lieu */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col flex-1">
            <label htmlFor="titre" className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
              Titre de l'offre
            </label>
            <input
              type="text"
              id="titre"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              required
              placeholder="Ex : Développeur React"
              className="border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500 transition shadow-sm"
            />
          </div>

          <div className="flex flex-col flex-1">
            <label htmlFor="lieu" className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
              Lieu
            </label>
            <input
              type="text"
              id="lieu"
              name="lieu"
              value={formData.lieu}
              onChange={handleChange}
              required
              placeholder="Ex : Paris"
              className="border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500 transition shadow-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label htmlFor="description" className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
            Description de l'offre
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            required
            placeholder="Détaillez le poste, missions, compétences..."
            className="border border-gray-300 dark:border-gray-600 rounded-2xl px-5 py-4 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500 transition shadow-sm"
          />
        </div>

        {/* Type de contrat + Salaire */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col flex-1">
            <label
              htmlFor="type_contrat"
              className="mb-2 font-semibold text-gray-700 dark:text-gray-300"
            >
              Type de contrat
            </label>
            <select
              id="type_contrat"
              name="type_contrat"
              value={formData.type_contrat}
              onChange={handleChange}
              required
              className="border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500 transition shadow-sm"
            >
              <option value="" disabled>
                -- Sélectionnez --
              </option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Stage">Stage</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>

          <div className="flex flex-col flex-1">
            <label htmlFor="salaire" className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
              Salaire (€)
            </label>
            <input
              type="number"
              step="0.01"
              id="salaire"
              name="salaire"
              value={formData.salaire}
              onChange={handleChange}
              required
              placeholder="Ex : 1500.00"
              className="border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500 transition shadow-sm"
            />
          </div>
        </div>

        {/* Date limite */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <label
            htmlFor="dateLimite"
            className="mb-2 md:mb-0 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
          >
            Date limite de candidature
          </label>
          <input
            type="datetime-local"
            id="dateLimite"
            name="dateLimite"
            value={formData.dateLimite}
            onChange={handleChange}
            required
            className="border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-3 flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500 transition shadow-sm"
          />
        </div>

        {/* Bouton submit */}
        <button
          type="submit"
          className="w-full py-4 rounded-3xl bg-gradient-to-r from-blue-700 to-blue-900 text-white font-bold text-lg tracking-wide shadow-lg hover:scale-[1.03] hover:brightness-110 transition-transform duration-300"
        >
          Publier l'offre
        </button>
      </form>
    </div>
  );
};

export default PublierOffre;
