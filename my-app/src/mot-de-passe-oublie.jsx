import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetMotDePasse() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(5 * 60); // 5 minutes
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2 && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [step, timer]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email) {
      setError("Veuillez renseigner votre email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Erreur lors de l'envoi de l'OTP.");
      } else {
        setMessage("OTP envoyé. Vérifiez votre email.");
        setStep(2);
        setTimer(5 * 60);
      }
    } catch (err) {
      setError("Erreur serveur, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp || !nouveauMotDePasse || !confirmation) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (nouveauMotDePasse !== confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (timer === 0) {
      setError("Le délai pour saisir l'OTP est dépassé. Veuillez recommencer.");
      setStep(1);
      setOtp("");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp, // ✅ correspond bien au backend
          mot_de_passe: nouveauMotDePasse,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Erreur lors de la réinitialisation.");
      } else {
        setMessage("Mot de passe réinitialisé avec succès. Redirection...");
        setTimeout(() => {
          navigate("/connexion");
        }, 2000);
      }
    } catch (err) {
      setError("Erreur serveur, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: "url('/public/hero/image7.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative card-etoile bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
        <h2 className="text-4xl font-bold text-center mb-6 text-white drop-shadow">Réinitialiser le mot de passe</h2>

        {error && (
          <div className="bg-red-200 text-red-800 border border-red-300 p-3 rounded mb-4 text-center text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-200 text-green-800 border border-green-300 p-3 rounded mb-4 text-center text-sm">
            {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4 text-white">
            <label className="block">
              <span className="block font-semibold mb-1">Email :</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim().toLowerCase())} // 🧹 nettoyage email
                required
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg bg-[#0f172a] border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300 text-white"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 rounded-lg font-semibold mt-4 transition ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
              }`}
            >
              {loading ? "Envoi de l'OTP..." : "Envoyer l'OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <>
            <p className="text-center mb-4 text-white">
              Un code OTP a été envoyé à <b>{email}</b>. <br />
              Vous avez <b>{formatTime(timer)}</b> pour le saisir.
              {timer === 0 && (
                <span className="text-yellow-300">Le délai est écoulé. Veuillez recommencer.</span>
              )}
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4 text-white">
              <label className="block">
                <span className="block font-semibold mb-1">Code OTP :</span>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={loading || timer === 0}
                  maxLength={6}
                  pattern="\d{6}"
                  className="w-full px-4 py-2 rounded-lg bg-[#0f172a] border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300 text-white"
                  placeholder="6 chiffres"
                />
              </label>

              <label className="block">
                <span className="block font-semibold mb-1">Nouveau mot de passe :</span>
                <input
                  type="password"
                  value={nouveauMotDePasse}
                  onChange={(e) => setNouveauMotDePasse(e.target.value)}
                  required
                  disabled={loading || timer === 0}
                  className="w-full px-4 py-2 rounded-lg bg-[#0f172a] border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300 text-white"
                />
              </label>

              <label className="block">
                <span className="block font-semibold mb-1">Confirmer mot de passe :</span>
                <input
                  type="password"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  required
                  disabled={loading || timer === 0}
                  className="w-full px-4 py-2 rounded-lg bg-[#0f172a] border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300 text-white"
                />
              </label>

              <button
                type="submit"
                disabled={loading || timer === 0}
                className={`w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 rounded-lg font-semibold mt-4 transition ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                }`}
              >
                {loading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
              </button>
            </form>
          </>
        )}

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
