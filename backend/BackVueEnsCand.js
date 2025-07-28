const express = require("express");
const router = express.Router();
const pool = require("./db"); // Ton pool MySQL

// Route pour les statistiques d'un candidat
router.get("/api/candidat/stats", async (req, res) => {
  try {
    const userId = Number(req.query.id);
    if (!userId) return res.status(400).json({ message: "ID du candidat invalide" });

    // 1. Nombre de candidatures envoyées
    const [candidaturesEnvoyees] = await pool.query(
      "SELECT COUNT(*) AS count FROM candidatures WHERE candidat_id = ?",
      [userId]
    );

    // 2. Nombre de candidatures acceptées
    const [candidaturesAcceptees] = await pool.query(
      "SELECT COUNT(*) AS count FROM candidatures WHERE candidat_id = ? AND statut = 'acceptée'",
      [userId]
    );

    // 3. Récupérer le compteur de connexions
    const [connexionsResult] = await pool.query(
      "SELECT nb_connexions FROM candidats WHERE id = ?",
      [userId]
    );

    // Réponse finale
    res.json({
      candidaturesEnvoyees: candidaturesEnvoyees[0]?.count || 0,
      candidaturesAcceptees: candidaturesAcceptees[0]?.count || 0,
      nbConnexions: connexionsResult[0]?.nb_connexions || 0,
    });
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
