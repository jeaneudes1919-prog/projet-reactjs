import React, { useState } from "react";

export default function Parametres() {
  const [passwordForm, setPasswordForm] = useState({
    ancienMotDePasse: "",
    nouveauMotDePasse: "",
    confirmationMotDePasse: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmSuppression, setConfirmSuppression] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (passwordForm.nouveauMotDePasse !== passwordForm.confirmationMotDePasse) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vous devez être connecté pour modifier le mot de passe.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/utilisateur/modifier-motdepasse", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ancienMotDePasse: passwordForm.ancienMotDePasse,
          nouveauMotDePasse: passwordForm.nouveauMotDePasse,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la modification");
      }
      setMessage("Mot de passe modifié avec succès !");
      setPasswordForm({
        ancienMotDePasse: "",
        nouveauMotDePasse: "",
        confirmationMotDePasse: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimerCompte = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vous devez être connecté pour supprimer votre compte.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/utilisateur/suppression", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la suppression");
      }
      alert("Compte supprimé définitivement !");
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setConfirmSuppression(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-10 rounded-3xl shadow-xl space-y-12 border border-blue-200 bg-white dark:bg-gray-900 dark:border-blue-700">
      <h1 className="text-4xl font-extrabold text-center text-blue-900 dark:text-blue-400">
        Paramètres du compte
      </h1>

      {loading && (
        <p className="text-center text-blue-600 dark:text-blue-400 animate-pulse">Chargement...</p>
      )}
      {error && (
        <p className="text-center text-red-600 dark:text-red-400 font-semibold">{error}</p>
      )}
      {message && (
        <p className="text-center text-green-600 dark:text-green-400 font-semibold">{message}</p>
      )}

      {/* Modifier mot de passe */}
      <form
        onSubmit={handlePasswordSubmit}
        className="space-y-6 bg-blue-50 dark:bg-gray-800 p-8 rounded-2xl shadow-inner border border-blue-100 dark:border-blue-700"
      >
        <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-300 mb-4">
          Modifier le mot de passe
        </h2>

        {["ancienMotDePasse", "nouveauMotDePasse", "confirmationMotDePasse"].map((field) => (
          <input
            key={field}
            type="password"
            name={field}
            value={passwordForm[field]}
            onChange={handlePasswordChange}
            placeholder={
              field === "ancienMotDePasse"
                ? "Ancien mot de passe"
                : field === "nouveauMotDePasse"
                ? "Nouveau mot de passe"
                : "Confirmer le nouveau mot de passe"
            }
            required
            disabled={loading}
            className="w-full rounded-xl border border-blue-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 text-lg shadow-sm focus:ring-4 focus:ring-blue-300 focus:outline-none transition"
          />
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-700 to-blue-900 text-white py-3 rounded-xl font-bold tracking-wide hover:brightness-110 transition disabled:opacity-50"
        >
          Modifier le mot de passe
        </button>
      </form>

      {/* Suppression compte */}
      <div className="bg-red-50 dark:bg-red-900 p-8 rounded-2xl shadow-inner border border-red-200 dark:border-red-700">
        <h2 className="text-2xl font-semibold text-red-700 dark:text-red-400 mb-4">
          Supprimer mon compte
        </h2>

        {!confirmSuppression ? (
          <button
            onClick={() => setConfirmSuppression(true)}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50"
          >
            Supprimer définitivement
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-red-700 dark:text-red-400 font-semibold">
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est{" "}
              <u>irréversible</u>.
            </p>

            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSupprimerCompte}
                disabled={loading}
                className="flex-1 bg-red-700 text-white py-3 rounded-xl font-semibold hover:bg-red-800 transition disabled:opacity-50"
              >
                Oui, supprimer
              </button>
              <button
                onClick={() => setConfirmSuppression(false)}
                disabled={loading}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
