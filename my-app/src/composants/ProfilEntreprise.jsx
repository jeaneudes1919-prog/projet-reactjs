import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProfilEntreprise() {
  const [profil, setProfil] = useState({
    nom: "",
    adresse: "",
    secteur: "",
    telephone: "",
    email: "",
    description: "",
    logoUrl: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) {
      setError("ID utilisateur non défini. Veuillez vous reconnecter.");
      return;
    }
    setLoading(true);
    axios
      .get(`http://localhost:3000/api/entreprise/profil?id=${id}`)
      .then((res) => setProfil(res.data))
      .catch(() => setError("Erreur lors du chargement du profil"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfil((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      setLoading(true);
      setMessage("");
      setError("");
      try {
        const res = await axios.put("http://localhost:3000/api/entreprise/profil", {
          ...profil,
          id: localStorage.getItem("userId"),
        });
        setMessage(res.data.message || "Profil mis à jour !");
      } catch {
        setError("Erreur lors de la mise à jour du profil");
      } finally {
        setLoading(false);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("logoUrl", file);
    formData.append("id", localStorage.getItem("userId"));

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await axios.post("http://localhost:3000/api/entreprise/upload-logoUrl", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfil((prev) => ({ ...prev, logoUrl: res.data.logoUrl }));
      setMessage("Logo mis à jour !");
    } catch {
      setError("Erreur lors de l’upload du logo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto p-10 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-blue-300 dark:border-blue-700">
      <h2 className="text-4xl font-extrabold text-center text-blue-900 dark:text-blue-400 mb-12 tracking-tight">
        Profil Entreprise
      </h2>

      {loading && (
        <p className="text-center text-blue-600 dark:text-blue-400 font-semibold mb-6 animate-pulse">
          Chargement...
        </p>
      )}
      {message && (
        <p className="text-center text-blue-700 dark:text-blue-400 font-semibold mb-6 animate-fadeIn">
          {message}
        </p>
      )}
      {error && (
        <p className="text-center text-red-600 dark:text-red-400 font-semibold mb-6 animate-fadeIn">
          {error}
        </p>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-10">
        {/* Logo upload */}
        <div className="flex justify-center">
          <div className="relative group w-48 h-48 rounded-3xl overflow-hidden border-4 border-blue-600 dark:border-blue-500 shadow-lg cursor-pointer transition-transform hover:scale-105">
            <img
              src={
                profil.logoUrl
                  ? `http://localhost:3000${profil.logoUrl}`
                  : "https://via.placeholder.com/192?text=Logo"
              }
              alt="Logo entreprise"
              className="object-cover w-full h-full brightness-90 group-hover:brightness-75 transition"
            />
            {isEditing && (
              <>
                <label
                  htmlFor="logoUpload"
                  className="absolute inset-0 bg-blue-700 bg-opacity-75 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity"
                  title="Changer le logo"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </label>
                <input
                  id="logoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </>
            )}
          </div>
        </div>

        {/* Champs en grille responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {[
            { name: "nom", label: "Nom de l'entreprise", required: true },
            { name: "secteur", label: "Secteur d’activité" },
            { name: "adresse", label: "Adresse" },
            { name: "telephone", label: "Téléphone" },
            { name: "email", label: "Email", required: true, type: "email" },
          ].map(({ name, label, required, type }) => (
            <div key={name} className="flex flex-col">
              <label
                htmlFor={name}
                className="mb-2 font-semibold text-blue-800 dark:text-blue-400 tracking-wide"
              >
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <input
                id={name}
                type={type || "text"}
                name={name}
                value={profil[name]}
                onChange={handleChange}
                disabled={!isEditing}
                required={required}
                className={`rounded-2xl border px-6 py-3 text-lg transition shadow-md focus:outline-none focus:ring-4 focus:ring-blue-400
                  ${
                    isEditing
                      ? "border-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      : "border-gray-300 bg-blue-50 dark:bg-gray-700 cursor-not-allowed text-gray-700 dark:text-gray-400"
                  }
                `}
              />
            </div>
          ))}

          <div className="flex flex-col md:col-span-2">
            <label
              htmlFor="description"
              className="mb-2 font-semibold text-blue-800 dark:text-blue-400 tracking-wide"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={profil.description}
              onChange={handleChange}
              disabled={!isEditing}
              rows={6}
              className={`rounded-2xl border px-6 py-3 text-lg transition resize-none shadow-md focus:outline-none focus:ring-4 focus:ring-blue-400
                ${
                  isEditing
                    ? "border-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    : "border-gray-300 bg-blue-50 dark:bg-gray-700 cursor-not-allowed text-gray-700 dark:text-gray-400"
                }
              `}
            />
          </div>
        </div>

        {/* Bouton */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleToggleEdit}
            className={`relative inline-block px-12 py-3 rounded-full font-bold tracking-wide text-white
              bg-gradient-to-r from-blue-700 to-blue-900 shadow-xl
              transition-transform duration-300 hover:scale-105 hover:brightness-110
              focus:outline-none focus:ring-4 focus:ring-blue-600
              ${loading ? "opacity-60 cursor-not-allowed" : ""}
            `}
            disabled={loading}
          >
            {isEditing ? (loading ? "Enregistrement..." : "Enregistrer") : "Modifier"}
          </button>
        </div>
      </form>
    </section>
  );
}
