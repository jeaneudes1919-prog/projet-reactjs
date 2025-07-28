
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user:process.env.GMAIL_USER,
    pass:process.env.GMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Échec de la connexion au serveur SMTP :", error);
  } else {
    console.log("Connexion SMTP réussie, prêt à envoyer des mails !");
  }
});


module.exports = transporter;
