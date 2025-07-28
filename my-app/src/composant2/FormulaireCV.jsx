import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const postesDisponibles = [
  { label: "Développeur", value: "Développeur" },
  { label: "Designer", value: "Designer" },
  { label: "Administrateur Système", value: "Administrateur Système" },
];

const diplomesDisponibles = [
  { label: "Licence", value: "Licence" },
  { label: "Master", value: "Master" },
  { label: "Doctorat", value: "Doctorat" },
];

const competencesDisponibles = [
  { label: "JavaScript", value: "JavaScript" },
  { label: "React", value: "React" },
  { label: "Node.js", value: "Node.js" },
];

const languesDisponibles = [
  { label: "Français", value: "Français" },
  { label: "Anglais", value: "Anglais" },
  { label: "Espagnol", value: "Espagnol" },
];

export default function FormulaireCV() {
  const [formData, setFormData] = useState({
    postes: [],
    diplomes: [],
    experience: "",
    competences: [],
    langues: [],
    date_naissance: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const candidatId = role === "candidat" ? parseInt(userId) : null;

  useEffect(() => {
    if (!candidatId || isNaN(candidatId)) {
      setMessage("❌ Aucun identifiant de candidat détecté. Veuillez vous reconnecter.");
      setLoading(false);
      return;
    }

    async function fetchCV() {
      try {
        const response = await axios.get(`http://localhost:3000/api/cv/${candidatId}`);
        if (response.status === 200) {
          const cv = response.data;
          setFormData({
            postes: (cv.postes || []).map((p) => ({ label: p, value: p })),
            diplomes: (cv.diplomes || []).map((d) => ({ label: d, value: d })),
            experience: cv.experience || "",
            competences: (cv.competences || []).map((c) => ({ label: c, value: c })),
            langues: (cv.langues || []).map((l) => ({ label: l, value: l })),
            date_naissance: cv.date_naissance || "",
          });
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setMessage("Aucun CV trouvé. Remplissez les informations ci-dessous pour le créer.");
          setEditMode(true);
        } else {
          console.error("Erreur chargement CV:", error);
          setMessage("❌ Impossible de charger le CV.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCV();
  }, [candidatId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field, values) => {
    setFormData((prev) => ({ ...prev, [field]: values }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!candidatId || isNaN(candidatId)) {
      setMessage("❌ Aucun identifiant candidat trouvé.");
      return;
    }

    const payload = {
      postes: formData.postes.map((p) => p.value),
      diplomes: formData.diplomes.map((d) => d.value),
      competences: formData.competences.map((c) => c.value),
      langues: formData.langues.map((l) => l.value),
      experience: formData.experience,
      date_naissance:formData.date_naissance
    };

    try {
      const response = await axios.put(`http://localhost:3000/api/cv/${candidatId}`, payload);
      if (response.status === 200) {
        setMessage("✅ CV enregistré avec succès !");
        setEditMode(false);
      } else {
        setMessage("❌ Erreur lors de la mise à jour.");
      }
    } catch (error) {
      console.error("Erreur mise à jour CV:", error);
      setMessage("❌ Erreur serveur lors de la mise à jour.");
    }
  };

  if (loading)
    return <p className="text-center p-6 text-gray-700 font-medium animate-pulse">Chargement du CV...</p>;

  return (
    <section className="max-w-7xl mx-auto p-10 rounded-xl min-h-screen flex flex-col 
                        animate-fadeIn transition-all duration-500 ease-in-out">
      <h2 className="text-4xl font-extrabold mb-10 text-green-700 text-center tracking-wide animate-slideUp">
        Mon CV - Informations
      </h2>

      {message && (
        <div
          className={`mb-8 px-6 py-4 rounded-lg font-semibold text-center transition-all duration-300 animate-slideUp
            ${message.startsWith("✅") ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}
          `}
          role="alert"
        >
          {message}
        </div>
      )}

      {/* Mode affichage */}
      {!editMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-gray-800 text-lg leading-relaxed animate-slideUp">
          <div>
            <p className="text-gray-900 dark:text-yellow-400">
              <span className="font-semibold">Date de naissance :</span>{" "}
              {formData.date_naissance ? new Date(formData.date_naissance).toLocaleDateString() : "Non renseignée"}
            </p>
            <p className="text-gray-900 dark:text-yellow-400">
              <span className="font-semibold">Postes :</span> {formData.postes.map((p) => p.label).join(", ")}
            </p>
          </div>

          <div>
            <p className="text-gray-900 dark:text-yellow-400">
              <span className="font-semibold">Diplômes :</span> {formData.diplomes.map((d) => d.label).join(", ")}
            </p>
            <p className="text-gray-900 dark:text-yellow-400">
              <span className="font-semibold">Compétences :</span> {formData.competences.map((c) => c.label).join(", ")}
            </p>
            <p className="text-gray-900 dark:text-yellow-400">
              <span className="font-semibold">Langues :</span> {formData.langues.map((l) => l.label).join(", ")}
            </p>
          </div>

          <div className="md:col-span-2">
            <p><span className="font-semibold">Expérience :</span></p>
            <p className="whitespace-pre-wrap text-gray-700">{formData.experience}</p>
          </div>

          <div className="md:col-span-2 flex justify-center">
            <button
              onClick={() => setEditMode(true)}
              className="mt-8 w-64 bg-gradient-to-r from-green-500 to-green-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:scale-105 transform transition duration-300"
            >
              Modifier
            </button>
          </div>
        </div>
      )}

      {/* Mode édition */}
      {editMode && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mt-6 animate-slideUp">
          {/* Date de naissance */}
<div>
  <label className="block mb-2 font-semibold text-gray-900">Date de naissance :</label>
  <input
    type="date"
    name="date_naissance"
    value={formData.date_naissance}
    onChange={handleChange}
    className="w-full border border-gray-300 rounded-md p-3 text-gray-900 placeholder-gray-400 
               focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent 
               transition hover:scale-[1.01]"
  />
</div>

          {/* Selects */}
          {[
            { label: "Postes", field: "postes", options: postesDisponibles },
            { label: "Diplômes", field: "diplomes", options: diplomesDisponibles },
            { label: "Compétences", field: "competences", options: competencesDisponibles },
            { label: "Langues", field: "langues", options: languesDisponibles },
          ].map((select, i) => (
            <div key={i}>
              <label className="block mb-2 font-semibold text-gray-900">{select.label} :</label>
              <Select
                isMulti
                options={select.options}
                value={formData[select.field]}
                onChange={(values) => handleSelectChange(select.field, values)}
                classNamePrefix="react-select"
                className="text-gray-900"
                placeholder={`Sélectionnez ${select.label.toLowerCase()}...`}
                noOptionsMessage={() => "Aucune option"}
              />
            </div>
          ))}

          {/* Expérience */}
          <div className="md:col-span-2">
            <label className="block mb-2 font-semibold text-gray-900">Expérience :</label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows="5"
              placeholder="Décrivez votre expérience..."
              className="w-full border border-gray-300 rounded-md p-3 text-gray-900 placeholder-gray-400 resize-none 
                        focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent 
                        transition hover:scale-[1.01]"
            ></textarea>
          </div>

          {/* Bouton Enregistrer */}
          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              className="w-64 bg-gradient-to-r from-green-600 to-green-800 text-white py-3 rounded-lg font-semibold 
                        shadow-lg hover:scale-105 transform transition duration-300"
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
