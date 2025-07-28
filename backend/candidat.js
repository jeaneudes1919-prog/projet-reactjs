// Fichier : routes/candidats.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

// Configurer Multer pour l'upload du CV
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/cv");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// 1. Inscription d'un candidat
router.post("/api/inscription", upload.single("cv"), async (req, res) => {
  const { nom, email, telephone, motdepasse } = req.body;
  const cv_url = req.file ? `/uploads/cv/${req.file.filename}` : null;

  try {
    const [verif] = await pool.query("SELECT * FROM candidats WHERE email = ?", [email]);
    if (verif.length > 0) return res.status(400).json({ message: "Email déjà utilisé." });

    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    await pool.query(
      "INSERT INTO candidats (nom, email, telephone, motdepasse, cv_url) VALUES (?, ?, ?, ?, ?)",
      [nom, email, telephone, hashedPassword, cv_url]
    );
    res.status(201).json({ message: "Candidat inscrit avec succès." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 2. Connexion du candidat
router.post("/connexion", async (req, res) => {
  const { email, motdepasse } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM candidats WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(400).json({ message: "Email non trouvé." });

    const candidat = rows[0];
    const match = await bcrypt.compare(motdepasse, candidat.motdepasse);
    if (!match) return res.status(401).json({ message: "Mot de passe incorrect." });

    res.json({ message: "Connexion réussie", candidat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 3. Liste des offres disponibles
router.get("/offres", async (req, res) => {
  try {
    const [offres] = await pool.query("SELECT * FROM offres WHERE statut = 'active'");
    res.json(offres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 4. Candidature à une offre
router.post("/postuler", async (req, res) => {
  const { candidat_id, offre_id } = req.body;

  try {
    const [verif] = await pool.query(
      "SELECT * FROM candidatures WHERE candidat_id = ? AND offre_id = ?",
      [candidat_id, offre_id]
    );
    if (verif.length > 0) return res.status(400).json({ message: "Déjà postulé à cette offre." });

    await pool.query(
      "INSERT INTO candidatures (offre_id, candidat_id) VALUES (?, ?)",
      [offre_id, candidat_id]
    );
    res.status(201).json({ message: "Candidature envoyée." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 5. Voir ses candidatures
router.get("/mes-candidatures/:candidat_id", async (req, res) => {
  const { candidat_id } = req.params;
  try {
    const [candidatures] = await pool.query(
      `SELECT c.id, o.titre, o.lieu, c.date_candidature, c.statut
       FROM candidatures c
       JOIN offres o ON o.id = c.offre_id
       WHERE c.candidat_id = ?`,
      [candidat_id]
    );
    res.json(candidatures);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 6. Modifier le profil candidat
router.put("/api/modifier/:id", async (req, res) => {
  const { id } = req.params;
  const { nom, email, telephone } = req.body;
  try {
    await pool.query(
      "UPDATE candidats SET nom = ?, email = ?, telephone = ? WHERE id = ?",
      [nom, email, telephone, id]
    );
    res.json({ message: "Profil mis à jour." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 7. Supprimer son compte
router.delete("/supprimer/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM candidats WHERE id = ?", [id]);
    res.json({ message: "Compte supprimé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 8. Modifier le mot de passe
router.put("/api/modifier-motdepasse/:id", async (req, res) => {
  const { id } = req.params;
  const { ancienMotDePasse, nouveauMotDePasse } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM candidats WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Utilisateur introuvable." });

    const match = await bcrypt.compare(ancienMotDePasse, rows[0].motdepasse);
    if (!match) return res.status(401).json({ message: "Ancien mot de passe incorrect." });

    const hash = await bcrypt.hash(nouveauMotDePasse, 10);
    await pool.query("UPDATE candidats SET motdepasse = ? WHERE id = ?", [hash, id]);
    res.json({ message: "Mot de passe mis à jour." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
