const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("./db");
const nodemailer = require("nodemailer");
const authMiddleware = require("./authMiddleware");
require("dotenv").config();

const router = express.Router();

// 📂 Dossier uploads candidats
const uploadDir = path.join(__dirname, "uploads", "candidats");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

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
 * ✅ ROUTE POST - Envoi de message de support candidat
 */
router.post("/api/support-candidat/envoyer", authMiddleware, upload.single("fichier"), async (req, res) => {
  try {
    const { nom, email, categorie, message } = req.body;
    const fichier = req.file;
    const candidatId = req.userId; // ID du candidat connecté

    if (!nom || !email || !categorie || !message) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
    }

    const fichierUrl = fichier ? `/uploads/candidats/${fichier.filename}` : null;

    await pool.query(
      `INSERT INTO support_candidats (nom, email, categorie, message, fichier_url, candidat_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom, email, categorie, message, fichierUrl, candidatId]
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
      from: `"Support Candidat" <${email}>`,
      to: "jeaneudesatindehou@gmail.com",
      subject: `🆘 Nouveau message candidat - ${categorie}`,
      html: `
        <h2>Nouveau message de support candidat</h2>
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
    console.error("Erreur lors de l'envoi du support candidat :", error);
    res.status(500).json({ message: "Erreur serveur lors de l’envoi." });
  }
});

/**
 * ✅ ROUTE GET - Liste des messages support candidat
 */
router.get("/api/support-candidat/messages", authMiddleware, async (req, res) => {
  try {
    const candidatId = req.userId;

    const [result] = await pool.query(
      `SELECT * FROM support_candidats WHERE candidat_id = ? ORDER BY date_envoi DESC`,
      [candidatId]
    );

    res.json(result);
  } catch (err) {
    console.error("Erreur récupération des messages candidat :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📁 Route statique pour fichiers candidats
router.use("/uploads/candidats", express.static(uploadDir));

module.exports = router;
