import React, { useState } from "react";

export default function Parametres() {
  const [ancienMotDePasse, setAncienMotDePasse] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nouveauMotDePasse.length < 6) {
      return setMessage({
        type: "error",
        text: "Le mot de passe doit contenir au moins 6 caractères.",
      });
    }

    if (nouveauMotDePasse !== confirmation) {
      return setMessage({
        type: "error",
        text: "Les mots de passe ne correspondent pas.",
      });
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/admin/modifier-motdepasse", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ancienMotDePasse,
          nouveauMotDePasse,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: data.message || "Mot de passe mis à jour avec succès !",
        });
        setAncienMotDePasse("");
        setNouveauMotDePasse("");
        setConfirmation("");
      } else {
        setMessage({
          type: "error",
          text: data.message || "Une erreur est survenue.",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Erreur de connexion au serveur.",
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-indigo-700 dark:text-indigo-300">
        Modifier le mot de passe
      </h2>

      {message.text && (
        <div
          className={`mb-4 px-4 py-3 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
            Mot de passe actuel
          </label>
          <input
            type="password"
            value={ancienMotDePasse}
            onChange={(e) => setAncienMotDePasse(e.target.value)}
            required
            className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            value={nouveauMotDePasse}
            onChange={(e) => setNouveauMotDePasse(e.target.value)}
            required
            className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
            Confirmer le nouveau mot de passe
          </label>
          <input
            type="password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            required
            className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
        >
          Mettre à jour
        </button>
      </form>
    </div>
  );
}
