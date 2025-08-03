const express = require("express");
const router = express.Router();
const pool = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const LOGO_PAR_DEFAUT = "/uploads/entreprise_logo.jpg";


const logosDir = path.join(__dirname, "uploads", "logos");
if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, logosDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.body.id || req.query.id;
    cb(null, `entreprise_${userId}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

router.get("/api/entreprise/profil", async (req, res) => {
  const id = req.query.id;

  if (!id) return res.status(400).json({ message: "ID manquant" });

  try {
    const [rows] = await pool.query(
      `SELECT 
         u.nom, u.email, u.telephone,
         e.secteur, e.adresse, e.description, e.logoUrl
       FROM entreprises e
       JOIN utilisateurs u ON e.id = u.id
       WHERE e.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Profil non trouvé" });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.put("/api/entreprise/profil", async (req, res) => {
  const { id, nom, secteur, adresse, telephone, email, description } = req.body;
  if (!id) return res.status(400).json({ message: "ID manquant" });
  if (!nom || !email) return res.status(400).json({ message: "Nom et email obligatoires" });

  try {
    await pool.query(
      "UPDATE utilisateurs SET nom = ?, email = ?, telephone = ? WHERE id = ?",
      [nom, email, telephone || null, id]
    );

    await pool.query(
      "UPDATE entreprises SET secteur = ?, adresse = ?, description = ? WHERE id = ?",
      [secteur || null, adresse || null, description || null, id]
    );

    res.json({ message: "Profil mis à jour avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur mise à jour" });
  }
});

router.post("/api/entreprise/upload-logoUrl", upload.single("logoUrl"), async (req, res) => {
  const userId = req.body.id;
  if (!userId) return res.status(400).json({ message: "ID manquant" });
  if (!req.file) return res.status(400).json({ message: "Fichier logoUrl manquant" });

  try {
    const [rows] = await pool.query("SELECT logoUrl FROM entreprises WHERE id = ?", [userId]);
    if (rows.length > 0 && rows[0].logoUrl && rows[0].logoUrl !== LOGO_PAR_DEFAUT) {
  const ancienLogoPath = path.resolve(__dirname, '.' + rows[0].logoUrl);
  fs.unlink(ancienLogoPath, (err) => {
    if (err) console.warn("Erreur suppression ancien logo :", err);
    else console.log("Ancien logo supprimé :", ancienLogoPath);
  });
}


    const logoUrl = `/uploads/logos/${req.file.filename}`;
    await pool.query("UPDATE entreprises SET logoUrl = ? WHERE id = ?", [logoUrl, userId]);

    res.json({ logoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur enregistrement logoUrl" });
  }
});

module.exports = router;
