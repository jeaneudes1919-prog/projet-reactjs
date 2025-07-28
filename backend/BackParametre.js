// routesUtilisateur.js
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const pool = require("./db");
const authMiddleware = require("./authMiddleware");

router.put("/api/utilisateur/modifier-motdepasse", authMiddleware, async (req, res) => {
  const { ancienMotDePasse, nouveauMotDePasse } = req.body;
  const userId = req.userId;

  if (!ancienMotDePasse || !nouveauMotDePasse) {
    return res.status(400).json({ message: "Champs requis manquants" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT mot_de_passe FROM utilisateurs WHERE id = ? AND role = 'entreprise'",
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const valid = await bcrypt.compare(ancienMotDePasse, rows[0].mot_de_passe);
    if (!valid) {
      return res.status(401).json({ message: "Ancien mot de passe incorrect" });
    }

    const hash = await bcrypt.hash(nouveauMotDePasse, 10);
    await pool.query(
      "UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ? AND role = 'entreprise'",
      [hash, userId]
    );

    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.delete("/api/utilisateur/suppression", authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    await pool.query("DELETE FROM support WHERE entreprise_id = ?", [userId]);
    await pool.query("DELETE FROM utilisateurs WHERE id = ? AND role = 'entreprise'", [userId]);

    res.json({ message: "Compte et messages supprimés définitivement" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la suppression" });
  }
});

module.exports = router;
