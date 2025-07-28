// routes/admin.js
const express = require("express");
const router = express.Router();
const pool = require("./db");
const transporter = require("./mail");
require("dotenv").config();


// GET - Liste des candidats
router.get("/candidats", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.nom, u.email, u.telephone, u.statut, c.prenom, c.photoUrl AS photo, u.date_creation
      FROM utilisateurs u
      JOIN candidats c ON u.id = c.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la récupération des candidats" });
  }
});

// GET - Détails candidat + CV
router.get("/candidats/:id", async (req, res) => {
  const candidatId = req.params.id;
  try {
    const [[info]] = await pool.query(`
      SELECT u.id, u.nom, u.email, u.telephone, u.statut, c.prenom, c.photoUrl, u.date_creation
      FROM utilisateurs u
      JOIN candidats c ON u.id = c.id
      WHERE u.id = ?
    `, [candidatId]);

    const [cv] = await pool.query(`
  SELECT id, resume, postes, diplomes, experience, competences, langues, date_naissance
  FROM cv
  WHERE candidat_id = ?
`, [candidatId]);


    res.json({ ...info, cv });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la récupération des détails" });
  }
});

// PUT - Suspendre un candidat
router.put("/candidats/:id/suspendre", async (req, res) => {
  const id = req.params.id;
  const { raison } = req.body;

  try {
    await pool.query("UPDATE utilisateurs SET statut = 'suspendu' WHERE id = ?", [id]);

    const [[user]] = await pool.query(`
      SELECT u.email, u.nom, c.prenom
      FROM utilisateurs u
      JOIN candidats c ON u.id = c.id
      WHERE u.id = ?
    `, [id]);
    console.log("📧 Envoi du mail à :", user.email);
    console.log("✉️ Contenu :", {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Suspension de votre compte",
      text: `Bonjour ${user.prenom} ${user.nom},\n\nVotre compte a été suspendu pour la raison suivante :\n"${raison}".\n\nMerci de contacter l’administration si besoin.`,
    });


    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Suspension de votre compte",
      text: `Bonjour ${user.prenom} ${user.nom},\n\nVotre compte a été suspendu pour la raison suivante :\n"${raison}".\n\nMerci de contacter l’administration si besoin.`,
    });

    res.json({ message: "Candidat suspendu avec succès et mail envoyé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suspension" });
  }
});

// PUT - Réactiver un candidat
router.put("/candidats/:id/reactiver", async (req, res) => {
  const id = req.params.id;
  const { raison } = req.body;

  try {
    await pool.query("UPDATE utilisateurs SET statut = 'actif' WHERE id = ?", [id]);

    const [[user]] = await pool.query(`
      SELECT u.email, u.nom, c.prenom
      FROM utilisateurs u
      JOIN candidats c ON u.id = c.id
      WHERE u.id = ?
    `, [id]);
    console.log("📧 Envoi du mail à :", user.email);
    console.log("✉️ Contenu :", {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Suspension de votre compte",
      text: `Bonjour ${user.prenom} ${user.nom},\n\nVotre compte a été suspendu pour la raison suivante :\n"${raison}".\n\nMerci de contacter l’administration si besoin.`,
    });


    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Réactivation de votre compte",
      text: `Bonjour ${user.prenom} ${user.nom},\n\nVotre compte a été réactivé.\n\nMessage de l'administration :\n"${raison}"`,
    });

    res.json({ message: "Candidat réactivé avec succès et mail envoyé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la réactivation" });
  }
});


module.exports = router