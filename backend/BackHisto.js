const express = require("express");
const router = express.Router();
const pool = require("./db");
const authMiddleware = require("./authMiddleware");

const parseJSON = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return value;
  }
};

router.get("/api/offres", authMiddleware, async (req, res) => {
  try {
    const entrepriseId = req.userId; // vérifier que authMiddleware fait bien ça
    if (!entrepriseId) return res.status(401).json({ message: "Non authentifié" });

    const [offres] = await pool.query(
      "SELECT * FROM offres WHERE entreprise_id = ?",
      [entrepriseId]
    );

    const offresAvecCandidats = await Promise.all(
      offres.map(async (offre) => {
        const [candidats] = await pool.query(
          `SELECT 
  c.id,
  u.nom, u.email, u.telephone,
  c.prenom, c.experience, c.photoUrl,
  ca.statut,
  cv.id AS cv_id, cv.resume AS cv_resume, 
  cv.postes AS cv_postes, cv.diplomes AS cv_diplomes, 
  cv.experience AS cv_experience, cv.competences AS cv_competences, cv.langues AS cv_langues
FROM candidats c
JOIN utilisateurs u ON c.id = u.id
JOIN candidatures ca ON c.id = ca.candidat_id
LEFT JOIN cv ON cv.candidat_id = c.id
WHERE ca.offre_id = ?;
`,
          [offre.id]
        );

        const candidatsParsed = candidats.map((c) => ({
          ...c,
          cv_postes: parseJSON(c.cv_postes),
          cv_diplomes: parseJSON(c.cv_diplomes),
          cv_competences: parseJSON(c.cv_competences),
          cv_langues: parseJSON(c.cv_langues),
        }));

        return { ...offre, candidats: candidatsParsed };
      })
    );

    res.json(offresAvecCandidats);
  } catch (error) {
    console.error("Erreur dans /api/offres :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des offres",
      error: error.message,
    });
  }
});


router.post(
  "/api/offres/:offreId/candidats/:candidatId/statut",
  async (req, res) => {
    const offreId = parseInt(req.params.offreId, 10);
    const candidatId = parseInt(req.params.candidatId, 10);
    let { statut } = req.body;

    if (isNaN(offreId) || isNaN(candidatId))
      return res.status(400).json({ message: "ID invalide" });

    if (!statut) {
      return res.status(400).json({ message: "Le statut est obligatoire" });
    }

    statut = statut.toLowerCase();

    // Statuts valides
    const statutsValides = ["acceptée", "en attente", "refusée"];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    try {
      // Vérifier que l'offre existe
      const [offreCheck] = await pool.query(
        "SELECT * FROM offres WHERE id = ?",
        [offreId]
      );
      if (offreCheck.length === 0) {
        return res.status(404).json({ message: "Offre non trouvée" });
      }

      // Vérifier que la candidature existe
      const [result] = await pool.query(
        "SELECT * FROM candidatures WHERE candidat_id = ? AND offre_id = ?",
        [candidatId, offreId]
      );
      if (result.length === 0) {
        return res.status(404).json({ message: "Candidature non trouvée" });
      }

      // Mise à jour du statut
      await pool.query(
        "UPDATE candidatures SET statut = ? WHERE candidat_id = ? AND offre_id = ?",
        [statut, candidatId, offreId]
      );

      // Créer une notification automatique si statut = acceptée
      if (statut === "acceptée") {
        const [[offreInfo]] = await pool.query(
          `SELECT o.titre, u.nom, u.email, u.telephone
           FROM offres o
           JOIN entreprises e ON o.entreprise_id = e.id
           JOIN utilisateurs u ON e.id = u.id
           WHERE o.id = ?`,
          [offreId]
        );

        const message = `🎉 Salut, vous avez été sélectionné par **${offreInfo.nom}** pour le poste de **${offreInfo.titre}**.
📞 Contact : ${offreInfo.telephone} | 📧 Email : ${offreInfo.email}
Veuillez les contacter pour les prochaines étapes.`;

        await pool.query(
          "INSERT INTO notifications (candidat_id, message, lu) VALUES (?, ?, false)",
          [candidatId, message]
        );
      }

      res.json({ message: "Statut mis à jour avec succès" });
    } catch (error) {
      console.error("Erreur mise à jour statut :", error);
      res.status(500).json({
        message: "Erreur serveur lors de la mise à jour du statut",
        error: error.message,
      });
    }
  }
);





module.exports = router;
