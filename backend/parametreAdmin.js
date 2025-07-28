const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const pool = require("./db");
const authMiddleware = require("./authMiddleware");


router.put("/api/admin/modifier-motdepasse", authMiddleware, async (req, res) => {
  const { ancienMotDePasse, nouveauMotDePasse } = req.body;
  const userId = req.userId;

  if (!ancienMotDePasse || !nouveauMotDePasse) {
    return res.status(400).json({ message: "Champs requis manquants" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT mot_de_passe FROM utilisateurs WHERE id = ? AND role = 'admin'",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }

    const valid = await bcrypt.compare(ancienMotDePasse, rows[0].mot_de_passe);
    if (!valid) {
      return res.status(401).json({ message: "Ancien mot de passe incorrect" });
    }

    const hash = await bcrypt.hash(nouveauMotDePasse, 10);
    await pool.query(
      "UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ? AND role = 'admin'",
      [hash, userId]
    );

    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (err) {
    console.error("Erreur modification mot de passe admin :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router