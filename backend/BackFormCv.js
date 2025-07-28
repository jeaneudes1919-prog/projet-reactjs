const express = require("express");
const router = express.Router();
const pool = require("./db");

// Fonction de parse sécurisée des champs JSON
const safeParseJson = (val) => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch (err) {
      return [];
    }
  } else if (Array.isArray(val)) {
    return val;
  } else {
    return [];
  }
};

// ==========================
// GET : récupérer le CV complet d’un candidat
// ==========================
router.get("/api/cv/:candidatId", async (req, res) => {
  const candidatId = parseInt(req.params.candidatId);
  if (!candidatId) return res.status(400).json({ message: "ID candidat invalide." });

  try {
    const [rows] = await pool.query(
      `
      SELECT cv.*, c.prenom
      FROM cv
      JOIN candidats c ON cv.candidat_id = c.id
      WHERE cv.candidat_id = ?
      `,
      [candidatId]
    );

    if (rows.length === 0) return res.status(404).json({ message: "CV non trouvé." });

    const cv = rows[0];

    res.json({
      ...cv,
      prenom: cv.prenom,
      date_naissance: cv.date_naissance,
      postes: safeParseJson(cv.postes),
      diplomes: safeParseJson(cv.diplomes),
      competences: safeParseJson(cv.competences),
      langues: safeParseJson(cv.langues),
    });
  } catch (err) {
    console.error("Erreur récupération CV:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// ==========================
// PUT : mettre à jour ou créer un CV
// ==========================
router.put("/api/cv/:candidatId", async (req, res) => {
  const candidatId = parseInt(req.params.candidatId);
  if (!candidatId) return res.status(400).json({ message: "ID candidat invalide." });

  const {
    postes = [],
    diplomes = [],
    experience = "",
    competences = [],
    langues = [],
    resume = "",
    date_naissance = null,
  } = req.body;

  try {
    const [rows] = await pool.query("SELECT id FROM cv WHERE candidat_id = ?", [candidatId]);

    if (rows.length === 0) {
      // Création
      await pool.query(
        `
        INSERT INTO cv (postes, diplomes, experience, competences, langues, resume, date_naissance, candidat_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          JSON.stringify(postes),
          JSON.stringify(diplomes),
          experience,
          JSON.stringify(competences),
          JSON.stringify(langues),
          resume,
          date_naissance,
          candidatId,
        ]
      );
    } else {
      // Mise à jour
      await pool.query(
        `
        UPDATE cv 
        SET postes = ?, diplomes = ?, experience = ?, competences = ?, langues = ?, resume = ?, date_naissance = ?
        WHERE candidat_id = ?
        `,
        [
          JSON.stringify(postes),
          JSON.stringify(diplomes),
          experience,
          JSON.stringify(competences),
          JSON.stringify(langues),
          resume,
          date_naissance,
          candidatId,
        ]
      );
    }

    res.json({ message: "✅ CV mis à jour avec succès." });
  } catch (err) {
    console.error("Erreur mise à jour CV:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
