const express = require("express");
const router = express.Router();
const pool = require('./db');
const jwt = require("jsonwebtoken");

// Middleware d'authentification candidat
function verifierTokenCandidat(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "candidat") {
      return res.status(403).json({ message: "Accès interdit" });
    }
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("Erreur de token:", err);
    res.status(401).json({ message: "Token invalide" });
  }
}

// ROUTE PUBLIQUE : récupérer toutes les offres
router.get("/offres", async (req, res) => {
  try {
    const [rows] = await pool.query(`
     SELECT o.*, 
       u.nom AS entreprise, 
       e.logoUrl AS logo, 
       e.adresse,
       e.secteur,
       COUNT(c.id) AS candidatures
FROM offres o
JOIN entreprises e ON o.entreprise_id = e.id
JOIN utilisateurs u ON e.id = u.id
LEFT JOIN candidatures c ON o.id = c.offre_id
GROUP BY o.id
ORDER BY o.dateLimite DESC

    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ROUTE PROTÉGÉE : postuler à une offre
router.post("/candidatures", verifierTokenCandidat, async (req, res) => {
  const { offre_id, poste } = req.body;
  const candidat_id = req.userId;

  if (!offre_id || !poste) {
    return res.status(400).json({ message: "offre_id et poste requis" });
  }

  try {
    // Vérifie si l'offre existe
    const [offreRows] = await pool.query("SELECT id FROM offres WHERE id = ?", [offre_id]);
    if (offreRows.length === 0) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    // Vérifie si le candidat a déjà postulé
    const [candidatureExist] = await pool.query(
      "SELECT id FROM candidatures WHERE candidat_id = ? AND offre_id = ?",
      [candidat_id, offre_id]
    );

    if (candidatureExist.length > 0) {
      return res.status(409).json({ message: "Vous avez déjà postulé à cette offre." });
    }

    // Insère la candidature (la date sera automatique si ta table est configurée)
    await pool.query(
      "INSERT INTO candidatures (candidat_id, offre_id, poste) VALUES (?, ?, ?)",
      [candidat_id, offre_id, poste]
    );

    res.json({ message: "Candidature envoyée avec succès" });
  } catch (err) {
    console.error("Erreur lors de la candidature :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
