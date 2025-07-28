const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");
const pool = require("./db");

// 📥 Récupérer les infos de l'admin connecté
router.get("/infos", authMiddleware, async (req, res) => {
  const userId = req.userId;
  try {
    const [result] = await pool.query("SELECT nom, email FROM utilisateurs WHERE id = ? AND role = 'admin'", [userId]);
    if (result.length === 0) return res.status(404).json({ message: "Admin non trouvé" });
    res.json(result[0]);
  } catch (err) {
    console.error("Erreur GET /admin/infos :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✏️ Modifier les infos de l'admin connecté
router.put("/modifier-infos", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { nom, email } = req.body;

  if (!nom || !email) return res.status(400).json({ message: "Champs requis manquants" });

  try {
    await pool.query("UPDATE utilisateurs SET nom = ?, email = ? WHERE id = ? AND role = 'admin'", [
      nom,
      email,
      userId,
    ]);
    res.json({ message: "Informations mises à jour avec succès" });
  } catch (err) {
    console.error("Erreur PUT /admin/modifier-infos :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
