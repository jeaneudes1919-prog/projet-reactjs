import React, { useState } from "react";
import axios from "axios";

export default function ParametresCandidat() {
  const [form, setForm] = useState({
    ancienMotDePasse: "",
    nouveauMotDePasse: "",
    confirmationMotDePasse: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmSuppr, setConfirmSuppr] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleModifier = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (form.nouveauMotDePasse !== form.confirmationMotDePasse) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("Utilisateur non connecté !");
        return;
      }

      const res = await axios.put(
        `http://localhost:3000/api/candidats/password?id=${userId}`,
        {
          ancienMotDePasse: form.ancienMotDePasse,
          nouveauMotDePasse: form.nouveauMotDePasse,
        }
      );

      setMessage(res.data.message || "Mot de passe modifié avec succès !");
      setForm({
        ancienMotDePasse: "",
        nouveauMotDePasse: "",
        confirmationMotDePasse: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la modification.");
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimerCompte = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("Utilisateur non connecté !");
        return;
      }

      const res = await axios.delete(
        `http://localhost:3000/api/candidats/supprimer-compte?id=${userId}`
      );

      setMessage(res.data.message || "Votre compte a été supprimé.");
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      setError("Une erreur est survenue lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-transparent shadow-lg rounded-xl space-y-12 text-gray-900 dark:text-white transition-opacity duration-700 ease-in animate-fadeIn">
  {/* Modification du mot de passe */}
  <form onSubmit={handleModifier} className="space-y-6">
    <h2 className="text-3xl font-bold text-green-800 dark:text-green-400 border-b pb-2">
      🔐 Modifier le mot de passe
    </h2>

    {["ancienMotDePasse", "nouveauMotDePasse", "confirmationMotDePasse"].map((field, i) => (
      <div key={field}>
        <label className="block text-sm font-medium mb-1">
          {i === 0
            ? "Ancien mot de passe"
            : i === 1
            ? "Nouveau mot de passe"
            : "Confirmation du nouveau mot de passe"}
        </label>
        <input
          type="password"
          name={field}
          value={form[field]}
          onChange={handleChange}
          required
          disabled={loading}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        />
      </div>
    ))}

    {(message || error) && (
      <p className={`font-semibold ${message ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
        {message || error}
      </p>
    )}

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
    >
      {loading ? "Traitement..." : "💾 Enregistrer les modifications"}
    </button>
  </form>

  {/* Suppression de compte */}
  <section>
    <h2 className="text-3xl font-bold text-red-700 dark:text-red-400 mb-4 border-b pb-2">
      ❌ Supprimer mon compte
    </h2>

    {!confirmSuppr ? (
      <button
        onClick={() => setConfirmSuppr(true)}
        className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white py-3 rounded-lg transition"
      >
        Supprimer mon compte
      </button>
    ) : (
      <div className="space-y-4">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          ⚠️ Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleSupprimerCompte}
            disabled={loading}
            className="flex-1 bg-red-700 hover:bg-red-800 dark:bg-red-800 dark:hover:bg-red-900 text-white py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Suppression..." : "Oui, supprimer"}
          </button>
          <button
            onClick={() => setConfirmSuppr(false)}
            disabled={loading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg transition"
          >
            Annuler
          </button>
        </div>
      </div>
    )}
  </section>
</div>

  );
}
