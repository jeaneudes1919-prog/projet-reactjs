import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Connexion() {
  const [email, setEmail] = useState('');
  const [motdepasse, setMotdepasse] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleConnexion = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // On n'envoie plus de rôle côté front
      const response = await fetch('http://localhost:3000/api/connexion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mot_de_passe: motdepasse }),
      });

      const data = await response.json();

      if (!response.ok) {
        return setError(data.error || 'Identifiants incorrects.');
      }

      if (!data.token) {
        return setError('Erreur de connexion : token manquant.');
      }

      // Sauvegarder token, rôle et userId
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userId', data.id);

      // Redirection selon rôle reçu du backend
      if (data.role === 'entreprise') {
  navigate('/composants/TableauDeBord');
} else if (data.role === 'candidat') {
  navigate('/composant2/DashboardCandidat');
} else if (data.role === 'admin') {
  navigate('/admin/DashboardAdmin'); // 👉 adapte ce chemin selon ta structure
} else {
  setError('Rôle non reconnu.');
}

    } catch (err) {
      console.error(err);
      setError('Erreur de connexion au serveur.');
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
      <div className="relative card-etoile bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/30">
        <h2 className="text-4xl font-bold text-center mb-6 text-white drop-shadow">
          Connexion
        </h2>

        {error && (
          <div className="bg-red-200 text-red-800 border border-red-300 p-3 rounded mb-4 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleConnexion} className="space-y-6 text-white">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-black">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="exemple@mail.com"
              className="w-full px-4 py-2 rounded-lg bg-[#0f172a] border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300 text-white"

            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-black">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={motdepasse}
              onChange={(e) => setMotdepasse(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="********"
              className="w-full px-4 py-2 rounded-lg bg-[#0f172a] border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300 text-white"

            />
          </div>

          {/* Plus besoin du select role côté front */}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Se connecter
          </button>

          <button
            type="button"
            onClick={() => navigate('/InscriptionEmploie')}
            className="w-full bg-white/10 border border-white/30 text-white py-2 rounded-lg hover:bg-white/20 transition"
          >
            S'inscrire
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-blue-200">
          <a href="/mot-de-passe-oublie" className="hover:underline">
            Mot de passe oublié ?
          </a>
        </p>

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
