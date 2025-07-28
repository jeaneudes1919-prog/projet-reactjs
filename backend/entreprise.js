const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");

// Multer config pour logo entreprise
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/logos";
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

/* 🔵 1. Inscription entreprise */
router.post("/inscription", upload.single("logo"), async (req, res) => {
  const { nom, adresse, telephone, email, description } = req.body;
  const logo_url = req.file ? `/uploads/logos/${req.file.filename}` : null;

  try {
    await db.query(
      "INSERT INTO entreprises (nom, adresse, telephone, email, description, logo_url) VALUES (?, ?, ?, ?, ?, ?)",
      [nom, adresse, telephone, email, description, logo_url]
    );
    res.status(201).json({ message: "Entreprise inscrite avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

/* 🔵 2. Connexion entreprise (simple sans mot de passe) */
const bcrypt = require("bcryptjs"); // n'oublie pas d'importer bcrypt

router.post("/connexion", async (req, res) => {
  const { email, motdepasse } = req.body;

  if (!email || !motdepasse) {
    return res.status(400).json({ message: "Email et mot de passe sont requis." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM entreprises WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Entreprise non trouvée." });
    }

    const entreprise = rows[0];
    const match = await bcrypt.compare(motdepasse, entreprise.motdepasse);
    if (!match) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    // Optionnel : ne pas renvoyer le mot de passe dans la réponse
    delete entreprise.motdepasse;

    res.json({ message: "Connexion réussie", entreprise });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});


/* 🔵 3. Modifier profil entreprise */
router.put("/modifier-profil/:id", upload.single("logo"), async (req, res) => {
  const id = req.params.id;
  const { nom, adresse, telephone, email, description } = req.body;
  const logo_url = req.file ? `/uploads/logos/${req.file.filename}` : null;

  try {
    const query =
      "UPDATE entreprises SET nom=?, adresse=?, telephone=?, email=?, description=?" +
      (logo_url ? ", logo_url=?" : "") +
      " WHERE id=?";
    const params = logo_url
      ? [nom, adresse, telephone, email, description, logo_url, id]
      : [nom, adresse, telephone, email, description, id];

    await db.query(query, params);
    res.json({ message: "Profil mis à jour avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

/* 🔵 4. Supprimer une entreprise */
router.delete("/supprimer/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await db.query("DELETE FROM entreprises WHERE id = ?", [id]);
    res.json({ message: "Compte supprimé." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

module.exports = router;
