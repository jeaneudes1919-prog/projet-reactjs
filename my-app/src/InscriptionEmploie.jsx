import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const secteursDisponibles = [
  "Informatique / Télécoms / NTIC",
  "Agriculture",
  "BTP / Construction",
  "Banque / Finance",
  "Éducation",
  "Commerce / Distribution",
  "Hôtellerie / Restauration",
  "Transports / Logistique",
  "Santé / Médical",
  "Marketing / Communication",
  "Industrie / Production",
  "Artisanat",
  "Environnement / Développement durable",
  "Entrepreneuriat / Startups",
  "Import / Export",
  "Sciences / Recherche",
];

export default function InscriptionEmploi() {
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    mot_de_passe: "",
    nom: "",
    prenom: "",
    secteur: [],
    adresse: "",
    telephone: "",
    description: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const card = document.querySelector('.card-etoile');
    if (!card) return;

    const createStars = () => {
      for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.top = Math.random() * card.clientHeight + 'px';
        star.style.left = Math.random() * card.clientWidth + 'px';
        card.appendChild(star);
        setTimeout(() => star.remove(), 10000);
      }
    };

    createStars();
    const loop = setInterval(createStars, 5000);
    return () => clearInterval(loop);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!role) {
      alert("Veuillez sélectionner un rôle");
      return;
    }

    if (role === "candidat") {
      if (
        !formData.nom ||
        !formData.prenom ||
        !formData.email ||
        !formData.mot_de_passe ||
        !formData.adresse ||
        !formData.telephone
      ) {
        setError("Tous les champs sont obligatoires pour le candidat.");
        return;
      }
    } else if (role === "entreprises") {
      if (
        !formData.nom ||
        formData.secteur.length === 0 ||
        !formData.email ||
        !formData.mot_de_passe
      ) {
        setError("Tous les champs sont obligatoires pour les entreprises.");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint =
        role === "candidat"
          ? "http://localhost:3000/api/inscription"
          : "http://localhost:3000/api/inscription-entreprises";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          secteur: formData.secteur.join(", "), // transforme le tableau en chaîne
        }),

      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erreur lors de l'inscription");
        return;
      }

      localStorage.setItem("role", role);
      localStorage.setItem("email", formData.email);

      if (role === "entreprises") {
        navigate("/composants/TableauDeBord");
      } else {
        navigate("/composant2/DashboardCandidat");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur serveur, veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: "url('/public/hero/image7.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >

      <div className="relative card-etoile bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
        <h2 className="text-4xl font-bold text-center mb-6 text-white drop-shadow">Inscription</h2>

        {error && (
          <div className="bg-red-200 text-red-800 border border-red-300 p-3 rounded mb-4 text-center text-sm">
            {error}
          </div>
        )}

        <label className="block mb-4 text-black">
          <span className="block font-semibold mb-1">Je suis :</span>
          <select
            className="w-full px-4 py-2 rounded-lg bg-black border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Sélectionnez votre rôle --</option>
            <option value="candidat">Je cherche un emploi</option>
            <option value="entreprises">Je recrute</option>
          </select>
        </label>

        <form onSubmit={handleSubmit} className="space-y-4 text-white">
          {role === "candidat" && (
            <>
              <Input name="nom" label="Nom" value={formData.nom} onChange={handleChange} disabled={loading} />
              <Input name="prenom" label="Prénoms" value={formData.prenom} onChange={handleChange} disabled={loading} />
              <Input type="email" name="email" label="Email" value={formData.email} onChange={handleChange} disabled={loading} />
              <Input type="password" name="mot_de_passe" label="Mot de passe" value={formData.mot_de_passe} onChange={handleChange} disabled={loading} />
              <Input name="adresse" label="Adresse" value={formData.adresse} onChange={handleChange} disabled={loading} />
              <Input type="tel" name="telephone" label="Téléphone" value={formData.telephone} onChange={handleChange} disabled={loading} />
            </>
          )}

          {role === "entreprises" && (
            <>
              <Input name="nom" label="Nom de l'Entreprise" value={formData.nom} onChange={handleChange} disabled={loading} />
              <SecteurSelector
                selectedSecteurs={formData.secteur}
                setSelectedSecteurs={(secteurs) =>
                  setFormData((prev) => ({ ...prev, secteur: secteurs }))
                }
                disabled={loading}
              />
              <Input type="email" name="email" label="Email" value={formData.email} onChange={handleChange} disabled={loading} />
              <Input type="password" name="mot_de_passe" label="Mot de passe" value={formData.mot_de_passe} onChange={handleChange} disabled={loading} />
              <Input name="description" label="Description" value={formData.description} onChange={handleChange} disabled={loading} />
              <Input name="adresse" label="Adresse" value={formData.adresse} onChange={handleChange} disabled={loading} />
              <Input type="tel" name="telephone" label="Téléphone" value={formData.telephone} onChange={handleChange} disabled={loading} />

            </>
          )}

          {role && (
            <button
              type="submit"
              className={`w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 rounded-lg font-semibold mt-4 transition ${loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                }`}
              disabled={loading}
            >
              {loading ? "Inscription en cours..." : "M'inscrire"}
            </button>
          )}
        </form>

        <style>{`
          

          .card-etoile {
            position: relative;
            overflow: hidden;
          }

          .star {
            position: absolute;
            width: 3px;
            height: 3px;
            background: white;
            border-radius: 50%;
            opacity: 0.8;
            animation: twinkle 4s linear forwards;
          }

          @keyframes twinkle {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.5); opacity: 0.2; }
            100% { transform: scale(1); opacity: 0.8; }
          }
        `}</style>
      </div>
    </div>
  );
}

function Input({ name, label, type = "text", value, onChange, disabled }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1 text-black">{label} :</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        disabled={disabled}
        className="w-full px-4 py-2 rounded-lg bg-[#0f172a] border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300 text-white"

      />
    </label>
  );
}

function SecteurSelector({ selectedSecteurs, setSelectedSecteurs, disabled }) {
  const [input, setInput] = useState("");
  const [filtered, setFiltered] = useState([]);

  const onInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    if (val.length === 0) {
      setFiltered([]);
      return;
    }

    const filt = secteursDisponibles.filter(
      (s) =>
        s.toLowerCase().includes(val.toLowerCase()) &&
        !selectedSecteurs.includes(s)
    );
    setFiltered(filt);
  };

  const addSecteur = (secteur) => {
    setSelectedSecteurs([...selectedSecteurs, secteur]);
    setInput("");
    setFiltered([]);
  };

  const removeSecteur = (secteur) => {
    setSelectedSecteurs(selectedSecteurs.filter((s) => s !== secteur));
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2 text-black" >Secteurs d'activité :</label>
      <input
        type="text"
        value={input}
        onChange={onInputChange}
        placeholder="Commencez à taper un secteur"
        disabled={disabled}
        className="w-full px-4 py-2 rounded-lg bg-[#0f172a] border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300 text-white"

        autoComplete="off"
      />

      {filtered.length > 0 && !disabled && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded-md w-full max-h-48 overflow-auto mt-1 text-black">
          {filtered.map((secteur) => (
            <li
              key={secteur}
              className="p-2 cursor-pointer hover:bg-blue-100"
              onClick={() => addSecteur(secteur)}
            >
              {secteur}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {selectedSecteurs.map((secteur) => (
          <span
            key={secteur}
            className="bg-blue-600 text-white rounded-full px-4 py-1 flex items-center gap-2 text-sm"
          >
            {secteur}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeSecteur(secteur)}
                className="text-white font-bold hover:text-gray-200 focus:outline-none"
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
