const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const pool = require("./db"); // ta config mysql2/promise
const router = express.Router();
require("dotenv").config();
// Configure ton SMTP ici
const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

// Stockage OTP en mémoire (en prod, utiliser Redis ou base de données)
const otpStore = new Map(); // clé = `${email}-${role}`, valeur = { otp, expiresAt }

// Générer un OTP 6 chiffres
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Envoi réel de l’OTP par mail
async function sendEmail(email, otp) {
  const mailOptions = {
    from: '"Ton Site" <no-reply@tonsite.com>',
    to: email,
    subject: "Votre code OTP pour la réinitialisation du mot de passe",
    html: `
      <p>Bonjour,</p>
      <p>Voici votre code OTP pour réinitialiser votre mot de passe :</p>
      <h2>${otp}</h2>
      <p>Ce code est valide pendant 5 minutes.</p>
      <p>Si vous n'avez pas demandé ce code, ignorez ce message.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email OTP envoyé à ${email}`);
}

// Vérifier que l’email existe dans la table selon rôle
async function emailExists(email, role) {
  const table = role === "candidat" ? "candidats" : "entreprises";
  const [rows] = await pool.query(`SELECT id FROM ${table} WHERE email = ?`, [email]);
  return rows.length > 0;
}

// POST /api/password-reset/send-otp
router.post("/api/password-reset/send-otp", async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role || !["candidat", "entreprises"].includes(role)) {
    return res.status(400).json({ message: "Données invalides." });
  }

  try {
    
    const exists = await emailExists(email, role);
if (!exists) {
  return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet email." });
}


    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(`${email}-${role}`, { otp, expiresAt });

    await sendEmail(email, otp);

    return res.status(200).json({ message: "OTP envoyé." /* Ne PAS renvoyer otp ici en prod */ });
  } catch (err) {
    console.error("Erreur send-otp:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

// POST /api/password-reset/reset
router.post("/api/password-reset/reset", async (req, res) => {
  const { email, role, mot_de_passe, tokenOtp } = req.body;
  if (!email || !role || !mot_de_passe || !tokenOtp || !["candidat", "entreprises"].includes(role)) {
    return res.status(400).json({ message: "Données invalides." });
  }

  const key = `${email}-${role}`;
  const otpData = otpStore.get(key);

  if (!otpData) {
    return res.status(400).json({ message: "OTP non envoyé ou expiré." });
  }

  if (otpData.expiresAt < Date.now()) {
    otpStore.delete(key);
    return res.status(400).json({ message: "OTP expiré." });
  }

  if (otpData.otp !== tokenOtp) {
    return res.status(400).json({ message: "OTP invalide." });
  }

  try {
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const table = role === "candidat" ? "candidats" : "entreprises";

    const [result] = await pool.query(
      `UPDATE ${table} SET mot_de_passe = ? WHERE email = ?`,
      [hashedPassword, email]
    );

    otpStore.delete(key);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    return res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (err) {
    console.error("Erreur reset:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
