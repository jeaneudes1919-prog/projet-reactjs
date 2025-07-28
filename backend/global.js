const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const pool = require("./db");
const jwt = require("jsonwebtoken");


const router = express.Router();


/*===========================*/
/*     AUTH : Inscription   */
/*===========================*/
router.post("/api/inscription", async (req, res) => {
  const { nom, prenom, email, mot_de_passe, adresse, telephone } = req.body;

  try {
    const hashed = await bcrypt.hash(mot_de_passe, 10);

    // 1. Insérer dans utilisateurs
    const [result] = await pool.query(
      "INSERT INTO utilisateurs (nom, email, telephone, mot_de_passe, role) VALUES (?, ?, ?, ?, 'candidat')",
      [nom, email, telephone, hashed]
    );
    const userId = result.insertId;

    // 2. Insérer dans candidats
    await pool.query(
      "INSERT INTO candidats (id, prenom, adresse) VALUES (?, ?, ?)",
      [userId, prenom, adresse]
    );

    res.status(201).json({ message: "Inscription réussie", id: userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
});


/*===========================*/
/*     AUTH : Connexion     */
/*===========================*/


// Connexion candidat (comme pour entreprise)
/*router.post("/api/connexion-candidats", async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    // Chercher dans utilisateurs
    const [users] = await pool.query(
      "SELECT * FROM utilisateurs WHERE email = ? AND role = 'candidat'",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    const user = users[0];

    const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!match) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    const token = jwt.sign({ id: user.id, role: "candidat" }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // Mise à jour nb_connexions dans candidats
    await pool.query("UPDATE candidats SET nb_connexions = nb_connexions + 1 WHERE id = ?", [user.id]);

    res.json({ role: "candidat", id: user.id, token });
  } catch (err) {
    console.error("Erreur connexion candidat :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

*/

router.post("/api/connexion", async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const [users] = await pool.query("SELECT * FROM utilisateurs WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: "Identifiants incorrects." });
    }

    const user = users[0];

    // Vérifier si le compte est suspendu
    if (user.statut === "suspendu") {
      return res.status(403).json({ error: "Erreur : votre compte a été suspendu. Veuillez contacter l'administration." });
    }

    const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!match) {
      return res.status(401).json({ error: "Identifiants incorrects." });
    }

    // Générer le token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // Incrémenter les connexions selon le rôle
    if (user.role === "candidat") {
      await pool.query("UPDATE candidats SET nb_connexions = nb_connexions + 1 WHERE id = ?", [user.id]);
    } else if (user.role === "entreprise") {
      await pool.query("UPDATE entreprises SET nb_connexions = nb_connexions + 1 WHERE id = ?", [user.id]);
    }

    res.json({ role: user.role, id: user.id, token });
  } catch (err) {
    console.error("Erreur lors de la connexion :", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});




/*===========================*/
/*     AUTH : Inscription entreprises   */
/*===========================*/
router.post("/api/inscription-entreprises", async (req, res) => {
  const {
    nom,
    email,
    mot_de_passe,
    telephone,
    adresse,
    secteur,
    description,
  } = req.body;

  try {
    const hashed = await bcrypt.hash(mot_de_passe, 10);

    // 1. Insérer dans utilisateurs avec role 'entreprise'
    const [result] = await pool.query(
      "INSERT INTO utilisateurs (nom, email, telephone, mot_de_passe, role) VALUES (?, ?, ?, ?, 'entreprise')",
      [nom, email, telephone, hashed]
    );
    const userId = result.insertId;

    // 2. Insérer dans entreprises avec le FK id = userId
    await pool.query(
      "INSERT INTO entreprises (id, adresse, description, secteur) VALUES (?, ?, ?, ?)",
      [userId, adresse, description, secteur]
    );

    res.status(201).json({ message: "Inscription entreprises réussie", id: userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
});


/*===========================*/
/*     AUTH : Connexion entreprises   */
/*===========================*/

/*router.post("/api/connexion-entreprises", async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    // Chercher dans utilisateurs où role = 'entreprise'
    const [users] = await pool.query(
      "SELECT * FROM utilisateurs WHERE email = ? AND role = 'entreprise'",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    const user = users[0];

    // Comparer mot de passe
    const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!match) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, role: "entreprise" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Mise à jour nb_connexions dans entreprises
    await pool.query("UPDATE entreprises SET nb_connexions = nb_connexions + 1 WHERE id = ?", [user.id]);

    res.json({ role: "entreprise", id: user.id, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
*/
//publier une offre 
router.post("/api/offres/publier", async (req, res) => {
  const { titre, description, lieu, type_contrat, salaire, dateLimite, entreprise_id } = req.body;

  if (!entreprise_id) {
    return res.status(400).json({ error: "Identifiant entreprise manquant." });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO offres (titre, description, lieu, type_contrat, salaire, dateLimite, entreprise_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titre, description, lieu, type_contrat, salaire, dateLimite, entreprise_id]
    );
    res.status(201).json({ message: "Offre publiée avec succès", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la publication de l'offre" });
  }
});

//supprimer offres

router.delete("/api/offres/:id", async (req, res) => {
  const offreId = req.params.id;

  try {
    // Vérifier si l'offre existe
    const [[offre]] = await pool.query("SELECT id FROM offres WHERE id = ?", [offreId]);
    if (!offre) {
      return res.status(404).json({ message: "Offre non trouvée." });
    }

    // Supprimer les candidatures liées
    await pool.query("DELETE FROM candidatures WHERE offre_id = ?", [offreId]);

    // Supprimer l'offre
    await pool.query("DELETE FROM offres WHERE id = ?", [offreId]);

    res.json({ message: "Offre supprimée avec succès." });
  } catch (err) {
    console.error("Erreur lors de la suppression :", err);
    res.status(500).json({ message: "Erreur interne." });
  }
});



router.get("/api/candidats-offres", async (req, res) => {
  try {
    const sql = `
      SELECT 
  c.id AS candidat_id,
  u.nom, u.email, u.telephone,
  c.prenom, c.photoUrl,
  cand.statut,
  o.id AS offre_id, o.titre, o.lieu, o.description, o.datePublication
FROM candidats c
JOIN utilisateurs u ON c.id = u.id
JOIN candidatures cand ON c.id = cand.candidat_id
JOIN offres o ON cand.offre_id = o.id
WHERE cand.statut = 'acceptée'
ORDER BY u.nom;

    `;

    const [rows] = await pool.query(sql);

    const candidats = rows.map((row) => ({
      id: row.candidat_id,
      nom: row.nom,
      prenom: row.prenom,
      email: row.email,
      telephone: row.telephone,
      photoUrl: row.photoUrl || "/uploads/user_unknown.png",
      statut: row.statut,

      offre: {
        id: row.offre_id,
        titre: row.titre,
        lieu: row.lieu,
        description: row.description,
        datePublication: row.datePublication,
      },
    }));

    res.json(candidats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération" });
  }
});
router.get("/api/notifications/:candidatId", async (req, res) => {
  const candidatId = parseInt(req.params.candidatId, 10);
  if (isNaN(candidatId)) return res.status(400).json({ message: "ID invalide" });

  try {
   const [notifications] = await pool.query(
  "SELECT id, message, lu, date FROM notifications WHERE candidat_id = ? ORDER BY date DESC",
  [candidatId]
);

    res.json(notifications);
  } catch (error) {
    console.error("Erreur récupération notifications :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

router.put("/api/notifications/:notifId/lu", async (req, res) => {
  const notifId = parseInt(req.params.notifId, 10);
  if (isNaN(notifId)) return res.status(400).json({ message: "ID invalide" });

  try {
    const [result] = await pool.query(
      "UPDATE notifications SET lu = true WHERE id = ?",
      [notifId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }

    res.json({ message: "Notification marquée comme lue" });
  } catch (error) {
    console.error("Erreur mise à jour notification :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});



module.exports = router;
