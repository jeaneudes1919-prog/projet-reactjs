import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProfilCandidat() {
  const [profil, setProfil] = useState({
    nom: "",
    prenom: "",
    adresse: "",
    telephone: "",
    email: "",
    photoUrl: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) {
      setMessage("Utilisateur non connecté !");
      return;
    }

    setLoading(true);
    axios
      .get(`http://localhost:3000/api/candidats/profil?id=${id}`)
      .then((res) => {
        setProfil(res.data);
      })
      .catch((err) => {
        console.error("Erreur profil candidat :", err);
        setMessage("Erreur lors du chargement du profil");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfil((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      setLoading(true);
      try {
        const res = await axios.put("http://localhost:3000/api/candidats/profil", {
          ...profil,
          id: localStorage.getItem("userId"),
        });
        setMessage(res.data.message || "Profil mis à jour !");
      } catch (err) {
        console.error("Erreur update candidat :", err);
        setMessage("Erreur lors de la mise à jour du profil");
      } finally {
        setLoading(false);
      }
    }
    setIsEditing(!isEditing);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("id", localStorage.getItem("userId"));

    try {
      const res = await axios.post("http://localhost:3000/api/candidats/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfil((prev) => ({ ...prev, photoUrl: res.data.photoUrl }));
      setMessage("Photo mise à jour !");
    } catch (err) {
      console.error("Erreur upload photo :", err);
      setMessage("Erreur lors du téléchargement de la photo.");
    }
  };

  return (
    <section className="p-4 md:p-8 bg-transparent min-h-screen transition-colors duration-300 dark:bg-transparent">
      <h2 className="text-4xl font-extrabold mb-10 text-center text-teal-800 dark:text-teal-300 tracking-wide animate-fadeIn">
        Profil du candidat
      </h2>

      {loading ? (
        <p className="text-teal-600 dark:text-teal-400 text-center animate-pulse">
          Chargement...
        </p>
      ) : (
        <form
          onSubmit={(e) => e.preventDefault()}
          className="max-w-4xl bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-lg dark:shadow-gray-800 space-y-6 mx-auto transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl"
        >
          {/* PHOTO */}
          <div className="flex justify-center mb-6">
            <div className="relative group w-40 h-40 rounded-md overflow-hidden border-4 border-teal-600 dark:border-teal-400 shadow-lg transition-transform duration-300 hover:scale-105">
              <img
                src={
                  profil.photoUrl
                    ? `http://localhost:3000${profil.photoUrl}`
                    : "https://via.placeholder.com/150?text=Photo"
                }
                alt="Photo du candidat"
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
              />
              {isEditing && (
                <>
                  <label
                    htmlFor="photoUpload"
                    className="absolute inset-0 bg-teal-700 bg-opacity-70 flex items-center justify-center text-white text-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    title="Changer la photo"
                  >
                    📷
                  </label>
                  <input
                    id="photoUpload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </>
              )}
            </div>
          </div>

          {/* CHAMPS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: "nom", label: "Nom" },
              { name: "prenom", label: "Prénom" },
              { name: "adresse", label: "Adresse" },
              { name: "telephone", label: "Téléphone" },
              { name: "email", label: "Email", type: "email" },
            ].map(({ name, label, type }) => (
              <div key={name} className="flex flex-col">
                <label className="mb-2 font-semibold text-teal-800 dark:text-teal-200">
                  {label}
                </label>
                <input
                  type={type || "text"}
                  name={name}
                  value={profil[name] || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required={["nom", "prenom", "email"].includes(name)}
                  className={`rounded-lg border px-4 py-2 text-gray-800 dark:text-gray-200 dark:bg-gray-800 transition-all duration-300 ${
                    isEditing
                      ? "border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      : "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* BOUTON */}
          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={handleToggleEdit}
              className={`px-8 py-3 rounded-full font-bold text-white shadow-md transition-all duration-300 transform hover:scale-105 ${
                isEditing
                  ? "bg-teal-600 hover:bg-teal-700"
                  : "bg-teal-800 hover:bg-teal-900"
              }`}
              disabled={loading}
            >
              {isEditing ? "Enregistrer" : "Modifier le profil"}
            </button>
          </div>

          {/* MESSAGE */}
          {message && (
            <p className="text-center text-teal-700 dark:text-teal-300 font-medium mt-4 animate-fadeIn">
              {message}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
