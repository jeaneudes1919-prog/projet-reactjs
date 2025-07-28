
const express = require("express");
const router = express.Router();
const pool = require("./db");
const transporter = require("./mail");

// GET - Liste des entreprises (avec détails de base)
router.get("/entreprises", async (req, res) => {
  try {
    const [entreprises] = await pool.query(`
      SELECT u.id, u.nom, u.email, u.telephone, u.statut, e.secteur, e.adresse, e.logoUrl AS logo, e.description, e.nb_connexions, u.date_creation
      FROM utilisateurs u
      JOIN entreprises e ON u.id = e.id
    `);
    res.json(entreprises);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la récupération des entreprises" });
  }
});

// GET - détails entreprise + nombre offres
router.get("/entreprises/:id", async (req, res) => {
  const entrepriseId = req.params.id;
  try {
    const [[info]] = await pool.query(`
      SELECT u.id, u.nom, u.email, u.telephone, u.statut, e.secteur, e.adresse, e.logoUrl, e.description, e.nb_connexions, u.date_creation
      FROM utilisateurs u
      JOIN entreprises e ON u.id = e.id
      WHERE u.id = ?
    `, [entrepriseId]);

    const [[{ offresCount }]] = await pool.query(`
      SELECT COUNT(*) AS offresCount FROM offres WHERE entreprise_id = ?
    `, [entrepriseId]);

    res.json({ ...info, offresCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la récupération des détails entreprise" });
  }
});

// PUT - Suspendre une entreprise
router.put("/entreprises/:id/suspendre", async (req, res) => {
  const id = req.params.id;
  const { raison } = req.body;

  try {
    await pool.query("UPDATE utilisateurs SET statut = 'suspendu' WHERE id = ?", [id]);

    const [[user]] = await pool.query(`
      SELECT u.email, u.nom, e.secteur
      FROM utilisateurs u
      JOIN entreprises e ON u.id = e.id
      WHERE u.id = ?
    `, [id]);

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Suspension de votre compte entreprise",
      text: `Bonjour ${user.nom},\n\nVotre entreprise dans le secteur "${user.secteur}" a été suspendue pour la raison suivante :\n"${raison}".\n\nMerci de contacter l’administration si besoin.`,
    });

    res.json({ message: "Entreprise suspendue et mail envoyé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suspension de l'entreprise" });
  }
});


// PUT - Réactiver une entreprise
router.put("/entreprises/:id/reactiver", async (req, res) => {
  const id = req.params.id;
  const { raison } = req.body;

  try {
    await pool.query("UPDATE utilisateurs SET statut = 'actif' WHERE id = ?", [id]);

    const [[user]] = await pool.query(`
      SELECT u.email, u.nom, e.secteur
      FROM utilisateurs u
      JOIN entreprises e ON u.id = e.id
      WHERE u.id = ?
    `, [id]);

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Réactivation de votre compte entreprise",
      text: `Bonjour ${user.nom},\n\nVotre entreprise a été réactivée avec le message suivant :\n"${raison}".\n\nMerci pour votre confiance.`,
    });

    res.json({ message: "Entreprise réactivée et mail envoyé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la réactivation de l'entreprise" });
  }
});



module.exports=router