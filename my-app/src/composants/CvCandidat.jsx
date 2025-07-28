import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CvCandidat() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    async function fetchCV() {
      try {
        const res = await axios.get(`http://localhost:3000/api/cv/${id}`);
        setCv(res.data);
        setLoading(false);
      } catch (err) {
        setErreur("Impossible de charger le CV");
        setLoading(false);
      }
    }

    fetchCV();
  }, [id]);

  // Fonction pour accepter le candidat
  const accepterCandidat = async () => {
    setAccepting(true);
    try {
      // Ici il faut adapter l'URL selon ton API pour accepter le candidat
      // Exemple : POST /api/candidats/:id/statut avec { statut: "Accepté" }
      await axios.post(`http://localhost:3000/api/candidats/${id}/statut`, {
        statut: "Accepté",
      });
      alert("Candidat accepté !");
      setAccepting(false);
      navigate("/offres"); // Redirige vers la liste des offres après acceptation
    } catch (err) {
      alert("Erreur lors de l'acceptation du candidat.");
      setAccepting(false);
    }
  };

  if (loading) return <p className="text-center text-blue-600">Chargement...</p>;
  if (erreur) return <p className="text-center text-red-600">{erreur}</p>;
  if (!cv) return <p className="text-center text-gray-500">CV non disponible.</p>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      {/* Bouton Retour */}
      <button
        onClick={() => navigate(-1)} // Navigue à la page précédente
        className="mb-6 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded inline-flex items-center"
      >
        ← Retour à la liste des offres
      </button>

      <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">
        CV de {cv.nom}
      </h1>

      <p><strong>Email :</strong> {cv.email}</p>
      <p><strong>Téléphone :</strong> {cv.telephone}</p>
      <p><strong>Titre :</strong> {cv.titre}</p>
      <p><strong>Résumé :</strong> {cv.resume}</p>
      <p><strong>Expérience :</strong> {cv.experience}</p>

      <div className="mt-4">
        <h2 className="text-xl font-semibold text-blue-700 mb-2">Diplômes</h2>
        <ul className="list-disc pl-5">
          {cv.diplomes && JSON.parse(cv.diplomes).map((diplome, i) => (
            <li key={i}>{diplome}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-semibold text-blue-700 mb-2">Postes précédents</h2>
        <ul className="list-disc pl-5">
          {cv.postes && JSON.parse(cv.postes).map((poste, i) => (
            <li key={i}>{poste}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-semibold text-blue-700 mb-2">Compétences</h2>
        <ul className="list-disc pl-5">
          {cv.competences && JSON.parse(cv.competences).map((comp, i) => (
            <li key={i}>{comp}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-semibold text-blue-700 mb-2">Langues</h2>
        <ul className="list-disc pl-5">
          {cv.langues && JSON.parse(cv.langues).map((langue, i) => (
            <li key={i}>{langue}</li>
          ))}
        </ul>
      </div>

      {/* Bouton Accepter */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={accepterCandidat}
          disabled={accepting}
          className="bg-green-600 hover:bg-green-700 text-white rounded-md px-6 py-3 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {accepting ? "Acceptation en cours..." : "Accepter ce candidat"}
        </button>
      </div>
    </div>
  );
}
