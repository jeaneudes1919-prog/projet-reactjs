const pool = require('./db');

const cleanJsonString = (str) => {
  if (!str || typeof str !== "string") return "[]";
  try {
    // Essaye direct JSON.parse
    return JSON.stringify(JSON.parse(str));
  } catch {
    // Remplace les simples quotes par doubles quotes (approx)
    const corrected = str.replace(/'/g, '"');
    try {
      return JSON.stringify(JSON.parse(corrected));
    } catch (err) {
      console.error("Impossible de parser même après correction:", str);
      return "[]";
    }
  }
};


(async () => {
  try {
    const [rows] = await pool.query("SELECT id, postes, diplomes, competences, langues FROM cv");
    for (const row of rows) {
      const postesClean = cleanJsonString(row.postes);
      const diplomesClean = cleanJsonString(row.diplomes);
      const competencesClean = cleanJsonString(row.competences);
      const languesClean = cleanJsonString(row.langues);

      await pool.query(
        "UPDATE cv SET postes = ?, diplomes = ?, competences = ?, langues = ? WHERE id = ?",
        [postesClean, diplomesClean, competencesClean, languesClean, row.id]
      );
      console.log(`CV id=${row.id} nettoyé`);
    }
    console.log("Nettoyage terminé");
    process.exit(0);
  } catch (err) {
    console.error("Erreur nettoyage :", err);
    process.exit(1);
  }
})();
