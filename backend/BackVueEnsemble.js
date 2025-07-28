const express = require("express");
const router = express.Router();
const pool = require("./db"); // ton pool MySQL
const authMiddleware = require("./authMiddleware");

/* ===========================
   ROUTE : STATISTIQUES DASHBOARD ENTREPRISE
   =========================== */
router.get("/api/dashboard/stats", authMiddleware, async (req, res) => {
  const entrepriseId = req.userId; // ID récupéré via le middleware d'authentification

  try {
    // Nombre d'offres publiées
    const [offres] = await pool.query(
      "SELECT COUNT(*) AS total FROM offres WHERE entreprise_id = ?",
      [entrepriseId]
    );

    // Nombre de candidatures reçues (via jointure)
    const [candidatures] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM candidatures ca
       JOIN offres o ON ca.offre_id = o.id
       WHERE o.entreprise_id = ?`,
      [entrepriseId]
    );

    // Nombre de connexions
    const [connexions] = await pool.query(
      "SELECT nb_connexions AS total FROM entreprises WHERE id = ?",
      [entrepriseId]
    );

    res.json({
      offresPubliees: offres[0]?.total || 0,
      candidaturesRecues: candidatures[0]?.total || 0,
      nbConnexions: connexions[0]?.total || 0,
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des statistiques :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* ===========================
   ROUTE : ENREGISTREMENT DES VISITES
   =========================== */
router.post("/api/visite", async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.get("User-Agent") || "N/A";
    const url = req.body.url || "N/A";

    await pool.query(
      "INSERT INTO visites (ip, user_agent, url) VALUES (?, ?, ?)",
      [ip, userAgent, url]
    );

    res.status(201).json({ message: "Visite enregistrée" });
  } catch (err) {
    console.error("Erreur enregistrement visite :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
