import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function VueEnsemble() {
  const [stats, setStats] = useState({
    offresPubliees: 0,
    candidaturesRecues: 0,
    connexions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:3000/api/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          let message = "Erreur lors de la récupération des statistiques";
          try {
            const data = await res.json();
            message = data.message || message;
          } catch {}
          throw new Error(message);
        }

        const data = await res.json();

        setStats({
          offresPubliees: Number(data.offresPubliees) || 0,
          candidaturesRecues: Number(data.candidaturesRecues) || 0,
          connexions: Number(data.nbConnexions) || 0,
        });
      } catch (err) {
        console.error("❌ Erreur fetchStats :", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen flex justify-center items-center bg-gradient-to-r from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <p className="text-indigo-600 dark:text-indigo-300 text-xl font-semibold animate-pulse">
          Chargement des statistiques...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen flex justify-center items-center bg-gradient-to-r from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <p className="text-red-500 dark:text-red-400 text-xl font-semibold">{error}</p>
      </section>
    );
  }

  // Données à afficher dans le pie chart
  const pieData = [
    { name: "Offres publiées", value: stats.offresPubliees },
    { name: "Candidatures reçues", value: stats.candidaturesRecues },
  ];

  const COLORS = ["#6366f1", "#4ade80"]; // Indigo + vert clair

  return (
    <section className="min-h-screen bg-gradient-to-r from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-6">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-16 tracking-tight">
        Tableau de bord — Vue d’ensemble
      </h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
        <StatCard label="Offres publiées" value={stats.offresPubliees} />
        <StatCard label="Candidatures reçues" value={stats.candidaturesRecues} />
        <StatCard label="Nombre de connexions" value={stats.connexions} />
      </div>

      <div className="mt-20 max-w-5xl mx-auto rounded-xl p-8 bg-white dark:bg-gray-800 shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-8 text-center">
          Répartition Offres publiées / Candidatures reçues
        </h2>

        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              label={({ percent }) =>
                `${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => value.toLocaleString()}
              contentStyle={{
                backgroundColor: "#1f2937",
                borderRadius: 10,
                border: "none",
                color: "#e0e7ff",
                fontWeight: "600",
                fontSize: 14,
                padding: "8px 12px",
              }}
              itemStyle={{ color: "#e0e7ff" }}
            />

            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ marginTop: 20 }}
              formatter={(value) => (
                <span className="text-gray-800 dark:text-gray-200 font-semibold">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="flex items-center space-x-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="p-4 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
        <svg
          className="w-10 h-10 text-indigo-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7h18M3 12h18M3 17h18" />
        </svg>
      </div>
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
