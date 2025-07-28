import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

export default function TableauDeBordCandidat() {
  const [stats, setStats] = useState({
    candidaturesEnvoyees: 0,
    candidaturesApprouvees: 0,
    connexions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("Utilisateur non connecté");

        const res = await fetch(`http://localhost:3000/api/candidat/stats?id=${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Erreur lors de la récupération");
        }

        const data = await res.json();

        setStats({
          candidaturesEnvoyees: Number(data.candidaturesEnvoyees) || 0,
          candidaturesApprouvees: Number(data.candidaturesAcceptees) || 0,
          connexions: Number(data.nbConnexions) || 0,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-20 text-indigo-600 dark:text-indigo-400 animate-pulse">
        Chargement...
      </p>
    );

  if (error)
    return (
      <p className="text-center mt-20 text-red-600 dark:text-red-400">{error}</p>
    );

  return (
    <section className="min-h-screen py-12 px-6 bg-transparent dark:bg-transparent">
      <h1 className="text-4xl font-extrabold text-center mb-16 text-gray-900 dark:text-gray-100 tracking-tight">
        Tableau de bord candidat
      </h1>

      {/* Cartes de stats */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 mb-20">
        <StatCard
          label="Candidatures envoyées"
          value={stats.candidaturesEnvoyees}
          icon={
            <svg
              className="w-10 h-10 text-indigo-500 dark:text-indigo-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          }
        />
        <StatCard
          label="Candidatures approuvées"
          value={stats.candidaturesApprouvees}
          icon={
            <svg
              className="w-10 h-10 text-green-500 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          }
        />
        <StatCard
          label="Nombre de connexions"
          value={stats.connexions}
          icon={
            <svg
              className="w-10 h-10 text-yellow-500 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 4v16m8-8H4" />
            </svg>
          }
        />
      </div>

      {/* Graphique */}
      <div className="max-w-5xl mx-auto rounded-xl p-8 bg-white dark:bg-gray-900 shadow-md dark:shadow-lg">
        <h2 className="text-2xl font-semibold mb-8 text-center text-gray-800 dark:text-gray-100">
          Répartition des candidatures
        </h2>

        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={[
                { name: "Envoyées", value: stats.candidaturesEnvoyees },
                { name: "Approuvées", value: stats.candidaturesApprouvees },
              ]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              label
            >
              <Cell key="cell-0" fill="#4338ca" />
              <Cell key="cell-1" fill="#22c55e" />
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="flex items-center space-x-6 bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="p-4 bg-indigo-100 dark:bg-indigo-700 rounded-lg">{icon}</div>
      <div>
        <p className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-300 tabular-nums">
          {value.toString().padStart(3, "0")}
        </p>
        <p className="text-gray-600 dark:text-gray-300 font-semibold tracking-wide mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}
