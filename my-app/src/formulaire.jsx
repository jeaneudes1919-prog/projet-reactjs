import React, { useState } from "react";

function JobOfferForm() {
  const initialFormData = {
    title: "",
    description: "",
    contractType: "",
    region: "",
    city: "",
    sector: "",
    experience: "",
    deadline: "",
    diplomas: [],
  };

  const [formData, setFormData] = useState(initialFormData);

  const availableDiplomas = [
    "CEP",
    "BEPC",
    "BAC",
    "BAC+1",
    "BAC+2",
    "BAC+3 (Licence)",
    "BAC+4",
    "BAC+5 (Master)",
    "Doctorat",
    "Certificat professionnel",
    "Formation certifiée en ligne",
    "Aucun diplôme requis",
  ];

  const regionsWithCities = {
    Littoral: ["Cotonou"],
    Ouémé: ["Porto-Novo", "Avrankou", "Adjohoun"],
    Atlantique: ["Abomey-Calavi", "Ouidah", "Allada"],
    Zou: ["Abomey", "Bohicon"],
    Borgou: ["Parakou", "Nikki"],
    Alibori: ["Kandi", "Malanville"],
    Atacora: ["Natitingou", "Tanguiéta"],
    Donga: ["Djougou"],
    Mono: ["Lokossa"],
    Couffo: ["Aplahoué"],
    Plateau: ["Pobè", "Sakété"],
    Collines: ["Dassa-Zoumè", "Savalou"],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(initialFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Données envoyées :", formData);
    // Ta logique backend ici
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Créer une offre d’emploi</h2>

      <label className="block mb-4">
        <span className="block font-semibold mb-1">Titre du poste :</span>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <label className="block mb-4">
        <span className="block font-semibold mb-1">Description :</span>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={5}
          className="w-full border border-gray-300 rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <label className="block mb-4">
        <span className="block font-semibold mb-1">Type de contrat :</span>
        <select
          name="contractType"
          value={formData.contractType}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Sélectionnez un type --</option>
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="Freelance">Freelance</option>
          <option value="Stage">Stage</option>
        </select>
      </label>

      <div className="mb-4">
        <label htmlFor="region" className="block font-semibold mb-1">
          Région :
        </label>
        <select
          id="region"
          name="region"
          value={formData.region}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              region: e.target.value,
              city: "",
            }))
          }
          required
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Sélectionnez une région --</option>
          {Object.keys(regionsWithCities).map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {formData.region && (
        <div className="mb-4">
          <label htmlFor="city" className="block font-semibold mb-1">
            Ville :
          </label>
          <select
            id="city"
            name="city"
            value={formData.city}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, city: e.target.value }))
            }
            required
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Sélectionnez une ville --</option>
            {regionsWithCities[formData.region].map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="sector" className="block font-semibold mb-1">
          Secteur d’activité :
        </label>
        <input
          type="text"
          id="sector"
          name="sector"
          list="secteurs"
          value={formData.sector}
          onChange={handleChange}
          placeholder="Commencez à taper un secteur"
          required
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <datalist id="secteurs">
          {[
            "Agriculture",
            "Agroalimentaire",
            "BTP / Construction",
            "Commerce / Distribution",
            "Éducation / Enseignement",
            "Santé / Médical",
            "Informatique / Télécoms / NTIC",
            "Banque / Finance / Assurance",
            "Énergie / Électricité",
            "Transports / Logistique",
            "Hôtellerie / Restauration",
            "Tourisme / Loisirs",
            "Communication / Marketing / Publicité",
            "Droit / Légal / Notariat",
            "Fonction publique / Administration",
            "Immobilier",
            "Industrie / Production",
            "Mécanique / Automobile",
            "Artisanat / Métier manuel",
            "Sécurité / Surveillance",
            "Services à la personne",
            "Mode / Beauté / Esthétique",
            "Environnement / Développement durable",
            "Sciences / Recherche",
            "Gestion / Comptabilité / Audit",
            "Import / Export",
            "Télévision / Médias / Journalisme",
            "Aéronautique / Maritime",
            "Événementiel",
            "Entrepreneuriat / Startups",
          ].map((secteur) => (
            <option key={secteur} value={secteur} />
          ))}
        </datalist>
      </div>

      <div className="mb-4">
        <span className="block font-semibold mb-1">Niveau d'expérience requis :</span>
        <div className="flex flex-wrap gap-4">
          {["0 à 2 ans", "2 à 4 ans", "4 à 6 ans", "6 ans et plus"].map(
            (exp, index) => (
              <label
                key={index}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="experience"
                  value={exp}
                  checked={formData.experience === exp}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      experience: e.target.value,
                    }))
                  }
                  className="cursor-pointer"
                />
                <span>{exp}</span>
              </label>
            )
          )}
        </div>
      </div>

      <label className="block mb-4">
        <span className="block font-semibold mb-1">Date limite de candidature :</span>
        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <div className="mb-6">
        <label htmlFor="diplomaSelect" className="block font-semibold mb-2">
          Ajouter un diplôme :
        </label>
        <select
          id="diplomaSelect"
          onChange={(e) => {
            const selected = e.target.value;
            if (!selected) return;

            if (!formData.diplomas.includes(selected)) {
              setFormData((prev) => ({
                ...prev,
                diplomas: [...prev.diplomas, selected],
              }));
            }

            e.target.value = "";
          }}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Sélectionner --</option>
          {availableDiplomas.map((diploma) => (
            <option key={diploma} value={diploma}>
              {diploma}
            </option>
          ))}
        </select>

        <div className="mt-3 flex flex-wrap gap-2">
          {formData.diplomas.map((diploma, index) => (
            <span
              key={index}
              className="bg-blue-600 text-white rounded-full px-4 py-1 flex items-center gap-2 text-sm"
            >
              {diploma}
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    diplomas: prev.diplomas.filter((d) => d !== diploma),
                  }))
                }
                className="text-white font-bold hover:text-gray-200 focus:outline-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Publier l’offre
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="bg-gray-300 px-5 py-2 rounded-md font-semibold hover:bg-gray-400 transition"
        >
          Réinitialiser
        </button>
      </div>
    </form>
  );
}

function  Formulaire() {
  return (
    <div className="min-h-screen bg-blue-300">
      <JobOfferForm />
    </div>
  );
}
export default JobOfferForm;
