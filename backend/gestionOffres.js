const express = require("express");
const router = express.Router();
const pool = require("./db");
const nodemailer = require("nodemailer");
// Route pour récupérer tous les candidats liés à une offre
router.get("/offres/:id/candidats", async (req, res) => {
  const offreId = req.params.id;
  try {
    const [candidats] = await pool.query(`
      SELECT 
        c.id, 
        c.prenom, 
        u.nom, 
        u.email, 
        c.photoUrl, 
        cd.date AS date_postulation,
        cd.poste
      FROM candidats c
      JOIN utilisateurs u ON c.id = u.id
      JOIN candidatures cd ON c.id = cd.candidat_id
      WHERE cd.offre_id = ?
    `, [offreId]);

    res.json(candidats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la récupération des candidats" });
  }
});



// Route pour supprimer une offre par id
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

router.delete("/offres/:id", async (req, res) => {
  const offreId = req.params.id;
  const { raison } = req.body;

  if (!raison) {
    return res.status(400).json({ message: "La raison de la suppression est requise." });
  }

  try {
    // 1. Récupérer les infos de l’entreprise liée à l’offre
    const [[offre]] = await pool.query(
      `SELECT o.titre, u.email, u.nom AS nom_entreprise
       FROM offres o
       JOIN entreprises e ON o.entreprise_id = e.id
       JOIN utilisateurs u ON e.id = u.id
       WHERE o.id = ?`,
      [offreId]
    );

    if (!offre) {
      return res.status(404).json({ message: "Offre non trouvée." });
    }

    // 2. Supprimer les candidatures liées
    await pool.query("DELETE FROM candidatures WHERE offre_id = ?", [offreId]);

    // 3. Supprimer l’offre
    await pool.query("DELETE FROM offres WHERE id = ?", [offreId]);

    // 4. Envoyer un mail à l’entreprise
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: offre.email,
      subject: `Suppression de votre offre "${offre.titre}"`,
      html: `
        <p>Bonjour ${offre.nom_entreprise},</p>
        <p>Nous vous informons que votre offre <strong>"${offre.titre}"</strong> a été supprimée par l'administrateur.</p>
        <p><strong>Motif :</strong> ${raison}</p>
        <p>Pour plus d’informations, veuillez contacter notre support.</p>
        <br/>
        <p>Cordialement,<br/>L’équipe Recrutement</p>
      `,
    });

    res.json({ message: "Offre supprimée et entreprise notifiée." });
  } catch (err) {
    console.error("Erreur suppression offre :", err);
    res.status(500).json({ message: "Erreur lors de la suppression de l'offre." });
  }
});


module.exports=router