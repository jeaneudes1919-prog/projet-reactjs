const express = require("express");
const pool = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const PHOTO_PAR_DEFAUT = "/uploads/logo_candidat.png";


const router = express.Router();

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.body.id || "unknown";
    cb(null, `user_${userId}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

function supprimerFichier(filePath) {
  if (!filePath) return;
  const fullPath = path.join(__dirname, filePath);
  fs.unlink(fullPath, (err) => {
    if (err) console.warn("Erreur suppression fichier:", err);
    else console.log("Fichier supprimé:", fullPath);
  });
}

// GET profil
router.get("/api/candidats/profil", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ message: "ID manquant" });

  try {
    const [rows] = await pool.query(`
      SELECT u.nom, u.email, u.telephone, c.prenom, c.adresse, c.photoUrl
      FROM candidats c
      JOIN utilisateurs u ON c.id = u.id
      WHERE c.id = ?
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ message: "Profil non trouvé" });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// PUT profil
router.put("/api/candidats/profil", async (req, res) => {
  const { id, nom, prenom, email, telephone, adresse, photoUrl } = req.body;

  if (!id || !nom || !prenom || !email) {
    return res.status(400).json({ message: "Champs obligatoires manquants" });
  }

  try {
    // Mise à jour dans utilisateurs (nom, email, telephone)
    await pool.query(
      "UPDATE utilisateurs SET nom = ?, email = ?, telephone = ? WHERE id = ?",
      [nom, email, telephone || null, id]
    );

    // Mise à jour dans candidats (prenom, adresse, photoUrl)
    await pool.query(
      "UPDATE candidats SET prenom = ?, adresse = ?, photoUrl = ? WHERE id = ?",
      [prenom, adresse || null, photoUrl || null, id]
    );

    res.json({ message: "Profil mis à jour avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
});



// POST upload photo
router.post("/api/candidats/upload-photo", upload.single("photo"), async (req, res) => {
  const id = req.body.id;
  if (!req.file || !id) return res.status(400).json({ message: "Photo ou ID manquant" });

  try {
    const [rows] = await pool.query("SELECT photoUrl FROM candidats WHERE id = ?", [id]);
    if (rows.length > 0 && rows[0].photoUrl && rows[0].photoUrl !== PHOTO_PAR_DEFAUT) {
  supprimerFichier(rows[0].photoUrl);
}


    const photoUrl = `/uploads/${req.file.filename}`;
    await pool.query("UPDATE candidats SET photoUrl = ? WHERE id = ?", [photoUrl, id]);
    res.json({ photoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur upload photo" });
  }
});

router.use("/uploads", express.static(path.join(__dirname, "uploads")));


module.exports = router;
