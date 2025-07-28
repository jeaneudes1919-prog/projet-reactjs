import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ThemeProvider from "./ThemeProvider"; // <-- Ajout

import Accueil from "./Accueil";
import Connexion from "./Connexion";
import InscriptionEmploi from "./InscriptionEmploie";
import ResetMotDePasse from "./mot-de-passe-oublie";
import TableauDeBord from "./composants/TableauDeBord";
import DashboardCandidat from "./composant2/DashboardCandidat";
import CvCandidat from "./composants/CvCandidat";
import ListeCandidats from "./composants/ListeCandidats";
import Messages from "./composants/Messages";
import RouteProtegee from "./RouteProtegee";
import DashboardAdmin from "./admin/DashboardAdmin";

function MessagesWrapper() {
  const navigate = useNavigate();
  const revenirDashboard = () => navigate("/composants/TableauDeBord");
  return <Messages revenirDashboard={revenirDashboard} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/Connexion" element={<Connexion />} />
        <Route path="/InscriptionEmploie" element={<InscriptionEmploi />} />
        <Route path="/mot-de-passe-oublie" element={<ResetMotDePasse />} />
        <Route
          path="/admin/*"
          element={<RouteProtegee><DashboardAdmin /></RouteProtegee>}
        />
        <Route
          path="/composants/TableauDeBord"
          element={<RouteProtegee><TableauDeBord /></RouteProtegee>}
        />
        <Route
          path="/composant2/DashboardCandidat"
          element={<RouteProtegee><DashboardCandidat /></RouteProtegee>}
        />
        <Route
          path="/cv/:id"
          element={<RouteProtegee><CvCandidat /></RouteProtegee>}
        />
        <Route
          path="/liste-candidats"
          element={<RouteProtegee><ListeCandidats /></RouteProtegee>}
        />
        <Route
          path="/composants/Messages"
          element={<RouteProtegee><MessagesWrapper /></RouteProtegee>}
        />
      </Routes>
    </ThemeProvider>
  );
}
