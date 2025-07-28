const express = require("express");
const router = express.Router();
const pool = require("./db"); // ou ton instance MySQL

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const [[{ totalCandidats }]] = await pool.query("SELECT COUNT(*) AS totalCandidats FROM candidats");
    const [[{ totalEntreprises }]] = await pool.query("SELECT COUNT(*) AS totalEntreprises FROM entreprises");
    const [[{ totalOffres }]] = await pool.query("SELECT COUNT(*) AS totalOffres FROM offres");

    res.json({
      candidats: totalCandidats,
      entreprises: totalEntreprises,
      offres: totalOffres,
    });
  } catch (err) {
    console.error("Erreur récupération des stats :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
