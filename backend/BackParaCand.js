const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const pool = require("./db");

// Modifier mot de passe
// Modifier mot de passe
router.put("/api/candidats/password", async (req, res) => {
  const { ancienMotDePasse, nouveauMotDePasse } = req.body;
  const candidatId = req.query.id;

  if (!candidatId) {
    return res.status(400).json({ message: "Utilisateur non identifié" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT mot_de_passe FROM utilisateurs WHERE id = ? AND role = 'candidat'",
      [candidatId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const hash = rows[0].mot_de_passe;

    const match = await bcrypt.compare(ancienMotDePasse, hash);
    if (!match) {
      return res.status(400).json({ message: "Ancien mot de passe incorrect" });
    }

    const nouveauHash = await bcrypt.hash(nouveauMotDePasse, 10);

    await pool.query(
      "UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ? AND role = 'candidat'",
      [nouveauHash, candidatId]
    );

    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (err) {
    console.error("Erreur changement mot de passe:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Supprimer compte
router.delete("/api/candidats/supprimer-compte", async (req, res) => {
  const candidatId = req.query.id;
  if (!candidatId) {
    return res.status(400).json({ message: "Utilisateur non identifié" });
  }

  try {
    await pool.query(
      "DELETE FROM utilisateurs WHERE id = ? AND role = 'candidat'",
      [candidatId]
    );
    res.json({ message: "Compte supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la suppression" });
  }
});


module.exports = router;
