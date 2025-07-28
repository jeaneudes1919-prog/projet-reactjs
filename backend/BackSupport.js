const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("./db");
const nodemailer = require("nodemailer");
const authMiddleware = require("./authMiddleware");
require("dotenv").config();

const router = express.Router();

// 📂 Dossier uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// 🗂️ Config Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

/**
 * ✅ ROUTE POST - Envoi de message de support
 */
router.post("/api/support/envoyer", authMiddleware, upload.single("fichier"), async (req, res) => {
  try {
    const { nom, email, categorie, message } = req.body;
    const fichier = req.file;
    const userId = req.userId;

    if (!nom || !email || !categorie || !message) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
    }

    const fichierUrl = fichier ? `/uploads/${fichier.filename}` : null;

    await pool.query(
      `INSERT INTO support (nom, email, categorie, message, fichier_url, entreprise_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom, email, categorie, message, fichierUrl, userId]
    );

    // ✉️ Envoi de mail à l’admin
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Support Utilisateur" <${email}>`,
      to:process.env.GMAIL_USER,
      subject: `🆘 Nouveau message - ${categorie}`,
      html: `
        <h2>Nouveau message de support</h2>
        <p><strong>Nom :</strong> ${nom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Catégorie :</strong> ${categorie}</p>
        <p><strong>Message :</strong><br>${message}</p>
        ${fichierUrl ? `<p><strong>Fichier :</strong> ${fichierUrl}</p>` : ""}
      `,
      attachments: fichier
        ? [
            {
              filename: fichier.originalname,
              path: fichier.path,
            },
          ]
        : [],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Message envoyé avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'envoi du support :", error);
    res.status(500).json({ message: "Erreur serveur lors de l’envoi." });
  }
});

/**
 * ✅ ROUTE GET - Liste des messages utilisateur
 */
router.get("/api/support/messages", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const [result] = await pool.query(
      `SELECT * FROM support WHERE entreprise_id = ? ORDER BY date_envoi DESC`,
      [userId]
    );

    res.json(result);
  } catch (err) {
    console.error("Erreur récupération des messages :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📁 Route statique pour les fichiers
router.use("/uploads", express.static(uploadDir));

module.exports = router;
