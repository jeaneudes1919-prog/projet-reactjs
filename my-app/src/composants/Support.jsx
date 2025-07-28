import React, { useState } from "react";

export default function Support() {
  const [form, setForm] = useState({
    nom: "",
    email: "",
    categorie: "",
    message: "",
    fichier: null,
  });

  const [envoye, setEnvoye] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [afficherMessages, setAfficherMessages] = useState(false);

  const categories = [
    "Problème technique",
    "Erreur sur une page",
    "Demande d’assistance",
    "Problème de connexion",
    "Autre",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, fichier: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("nom", form.nom);
      formData.append("email", form.email);
      formData.append("categorie", form.categorie);
      formData.append("message", form.message);
      if (form.fichier) {
        formData.append("fichier", form.fichier);
      }

      const res = await fetch("/api/support/envoyer", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de l'envoi du message");
      }

      setEnvoye(true);
      setForm({ nom: "", email: "", categorie: "", message: "", fichier: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/support/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data);
      setAfficherMessages(!afficherMessages);
    } catch (err) {
      console.error("Erreur lors du chargement des messages :", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 rounded-3xl shadow-lg border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-800 dark:text-blue-400 mb-10">
        🛠️ Centre de Support
      </h1>

      <div className="text-right mb-6">
        <button
          onClick={fetchMessages}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          {afficherMessages ? "Masquer les messages" : "📬 Voir mes messages"}
        </button>
      </div>

      {afficherMessages && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-10 max-h-72 overflow-y-auto shadow-inner">
          {messages.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-sm">Aucun message trouvé.</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="mb-5 border-b border-gray-200 dark:border-gray-700 pb-3">
                <p className="font-semibold text-blue-700 dark:text-blue-400">{msg.categorie}</p>
                <p className="text-sm text-gray-800 dark:text-gray-300">{msg.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  Envoyé le {new Date(msg.date_envoi).toLocaleString()}
                </p>
                {msg.fichier_url && (
                  <a
                    href={msg.fichier_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 underline"
                  >
                    📎 Voir la pièce jointe
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {loading && (
        <p className="text-center text-blue-600 dark:text-blue-400 font-semibold mb-4">⏳ Envoi en cours...</p>
      )}
      {error && (
        <p className="text-center text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
      )}

      {!envoye ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { label: "Nom complet", type: "text", name: "nom", placeholder: "Jean Dupont" },
            { label: "Adresse email", type: "email", name: "email", placeholder: "exemple@email.com" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required
                disabled={loading}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          ))}

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie</label>
            <select
              name="categorie"
              value={form.categorie}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">-- Sélectionner --</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              required
              disabled={loading}
              placeholder="Décrivez votre problème..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Fichier (facultatif)</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              onChange={handleFileChange}
              disabled={loading}
              className="block w-full text-sm text-gray-600 dark:text-gray-400"
            />
            {form.fichier && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                📎 <strong>{form.fichier.name}</strong> sélectionné
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-800 text-white text-lg font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            🚀 Envoyer la demande
          </button>
        </form>
      ) : (
        <div className="text-center text-green-700 dark:text-green-400 font-semibold text-lg bg-green-50 dark:bg-green-900 p-6 rounded-xl border border-green-300 dark:border-green-700 shadow">
          ✅ Votre message a bien été envoyé. Nous vous contacterons sous peu.
        </div>
      )}
    </div>
  );
}
