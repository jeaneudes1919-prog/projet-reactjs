const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const transporter = require("./mail"); // importe le transporteur


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN,
  credentials: true,
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use((req, res, next) => {
  console.log(`✅ Connexion front réussie : ${req.method} ${req.originalUrl}`);
  next();
});

const pool = require('./db');

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connexion à la base de données réussie !");
    connection.release();
  } catch (error) {
    console.error("❌ Impossible de se connecter à la base de données :", error);
    process.exit(1);
  }
}
testConnection();

app.get('/api/ping', (req, res) => {
  console.log('✅ Ping reçu du front, connexion OK');
  res.json({ message: 'Connexion front-back réussie !' });
});

// Routes
app.use(require("./BackProfilCand"));
app.use(require("./BackFormCv"));
app.use(require("./BackHisto"));
app.use(require("./BackMesCand"));
app.use(require("./BackParaCand"));
app.use(require("./BackProfilEntr"));
app.use(require("./BackRecheroffre"));
app.use(require("./BackSupport"));
app.use(require("./BackVueEnsemble"));
app.use(require("./BackVueEnsCand"));
app.use(require("./BackParametre"));
app.use(require("./supportCandidats"));
app.use(require("./vueEnsembleAdmin"))
app.use(require("./gestionCandidats"))
app.use(require("./gestionEntreprises"))
app.use(require("./gestionOffres"))
app.use(require("./parametreAdmin"))
app.use(require("./profilAdmin"))
app.use(require("./BackModifMotDePasse"));
app.use(require("./global"));


const passwordResetRoutes = require("./passwordResetRoutes")
app.use(passwordResetRoutes)
// Gestion des 404
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// Gestion erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erreur serveur" });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur http://localhost:${PORT}`);
});
