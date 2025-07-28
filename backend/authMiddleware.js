// authMiddleware.js
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Token manquant" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token manquant" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token invalide" });

    req.userId = decoded.id;  // Injection de l'id utilisateur
    next();
  });
}

module.exports = authMiddleware;
