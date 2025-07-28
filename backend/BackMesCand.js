const express = require("express");
const router = express.Router();
const pool = require("./db");

// ✅ Route GET candidatures (tri par date décroissante + entreprise)
router.get("/api/candidatures/:candidatId", async (req, res) => {
  const candidatId = parseInt(req.params.candidatId);
  if (isNaN(candidatId)) return res.status(400).json({ message: "ID candidat invalide" });

  try {
    const [rows] = await pool.query(
      `
      SELECT 
  c.id, c.date, c.statut, c.offre_id, c.candidat_id,
  o.titre AS poste,
  u.nom AS entreprise_nom,
  e.logoUrl AS entreprise_logo
FROM candidatures c
JOIN offres o ON c.offre_id = o.id
JOIN entreprises e ON o.entreprise_id = e.id
JOIN utilisateurs u ON e.id = u.id  -- <-- jointure vers utilisateurs
WHERE c.candidat_id = ?
ORDER BY c.date DESC

      `,
      [candidatId]
    );

    const candidatures = rows.map((row) => ({
      ...row,
      entreprise: {
        nom: row.entreprise_nom,
        logoUrl: row.entreprise_logo
          ? `http://localhost:3000${row.entreprise_logo}`
          : `http://localhost:3000/uploads/logo_entreprise.jpg`,
      },
    }));

    res.json(candidatures);
  } catch (err) {
    console.error("Erreur chargement candidatures:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ Route GET offres (tri par date limite)
router.get("/api/offres", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM offres ORDER BY dateLimite ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ Route GET offre par ID avec info entreprise
router.get("/api/offres/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID offre invalide" });

  try {
    const [rows] = await pool.query(`
      SELECT o.*, 
             e.nom AS entreprise, 
             e.logoUrl AS logo
      FROM offres o
      JOIN entreprises e ON o.entreprise_id = e.id
      WHERE o.id = ?
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ message: "Offre non trouvée" });

    const offre = rows[0];
    offre.logo = offre.logo ? `http://localhost:3000${offre.logo}` : null;

    res.json(offre);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ DELETE candidature avec protection si statut = "acceptée"
router.delete("/api/candidatures/:id", async (req, res) => {
  const candidatureId = parseInt(req.params.id);
  if (!candidatureId) {
    return res.status(400).json({ message: "ID de la candidature invalide" });
  }

  try {
    // Vérifier le statut
    const [rows] = await pool.query("SELECT statut FROM candidatures WHERE id = ?", [candidatureId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Candidature introuvable" });
    }

    const statut = rows[0].statut?.toLowerCase();
    if (statut === "acceptée") {
      return res.status(403).json({ message: "Impossible d'annuler une candidature acceptée." });
    }

    // Supprimer la candidature
    await pool.query("DELETE FROM candidatures WHERE id = ?", [candidatureId]);
    res.json({ message: "Candidature annulée avec succès." });
  } catch (err) {
    console.error("Erreur suppression candidature:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
