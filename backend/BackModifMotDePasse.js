// routes/passwordReset.js
const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const pool = require("./db");
const bcrypt = require("bcrypt");

const router = express.Router();

// Configurer l'envoi d'e-mail avec Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// POST /api/password-reset/send-otp
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email requis." });

  const emailClean = email.trim().toLowerCase();
  console.log("Email reçu :", emailClean);

  try {
    const [users] = await pool.query("SELECT id, statut FROM utilisateurs WHERE email = ?", [emailClean]);

    if (users.length === 0) {
      return res.status(400).json({ message: "Utilisateur introuvable." });
    }

    const user = users[0];
    if (user.statut === "suspendu") {
      return res.status(403).json({ message: "Compte suspendu. Contactez l'administrateur." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await pool.query(
      `CREATE TABLE IF NOT EXISTS reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        INDEX(email),
        INDEX(otp)
      )`
    );

    await pool.query("DELETE FROM reset_tokens WHERE email = ?", [emailClean]);
    await pool.query("INSERT INTO reset_tokens (email, otp, expires_at) VALUES (?, ?, ?)", [emailClean, otp, expires]);

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: emailClean,
      subject: "Code OTP pour la réinitialisation de mot de passe",
      html: `<p>Votre code de réinitialisation est : <b>${otp}</b>. Il expire dans 5 minutes.</p>`
    });

    res.status(200).json({ message: "OTP envoyé par email." });
  } catch (err) {
    console.error("Erreur envoi OTP:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});


// POST /api/password-reset/reset
router.post("/reset", async (req, res) => {
  const { email, otp, mot_de_passe } = req.body;

  if (!email || !otp || !mot_de_passe) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM reset_tokens WHERE email = ? AND otp = ? AND expires_at > NOW()",
      [email, otp]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "OTP invalide ou expiré." });
    }

    const hashed = await bcrypt.hash(mot_de_passe, 10);
    await pool.query("UPDATE utilisateurs SET mot_de_passe = ? WHERE email = ?", [hashed, email]);
    await pool.query("DELETE FROM reset_tokens WHERE email = ?", [email]);

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (err) {
    console.error("Erreur reset password:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;

