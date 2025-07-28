import React, { useState, useEffect } from "react";

const heroImages = [
  {
    url: "/public/hero/image1.jpg",
    title: "Trouvez votre emploi idéal",
    subtitle: "Découvrez des centaines d'opportunités adaptées à votre profil.",
  },
  {
    url: "/public/hero/image2.jpg",
    title: "Boostez votre carrière",
    subtitle: "Accédez aux meilleures offres du marché.",
  },
  {
    url: "/public/hero/image3.jpg",
    title: "Les entreprises vous attendent",
    subtitle: "Postulez en quelques clics seulement.",
  },
  {
    url: "/public/hero/image4.jpg",
    title: "Rejoignez des équipes dynamiques",
    subtitle: "Trouvez l'environnement de travail qui vous correspond.",
  },
  {
    url: "/public/hero/image5.jpg",
    title: "Votre avenir commence ici",
    subtitle: "Trouvez le job qui vous fera vibrer.",
  },
  {
    url: "/public/hero/image6.jpg",
    title: "Développez vos compétences",
    subtitle: "Formations et opportunités pour progresser.",
  },
  {
    url: "/public/hero/image7.jpg",
    title: "Recruteurs, trouvez vos talents",
    subtitle: "Publiez vos offres et gérez vos candidatures.",
  },
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i === heroImages.length - 1 ? 0 : i + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fonction pour scroller vers la section offres
  function scrollToOffres() {
    const element = document.getElementById("offres");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <section className="relative h-[600px] overflow-hidden bg-gray-900">
      {/* Images */}
      <div className="absolute inset-0">
        {heroImages.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              i === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            style={{ backgroundImage: `url(${img.url})` }}
          >
            {/* Overlay sombre */}
          </div>
        ))}
      </div>

      {/* Texte & Boutons */}
      <div className="relative z-10 max-w-6xl mx-auto h-full flex flex-col justify-center px-6 text-white">
        <h2 className="text-5xl font-extrabold leading-tight drop-shadow-lg animate-fadeInUp">
          {heroImages[currentIndex].title.split(" ").map((word, idx) => (
            <span
              key={idx}
              className="relative whitespace-nowrap mr-2 inline-block"
            >
              <span className="relative z-10">{word}</span>
              {idx % 2 === 0 && (
                <span className="absolute bottom-0 left-0 w-full h-3 bg-yellow-400/70 z-0 -rotate-1 rounded-sm"></span>
              )}
            </span>
          ))}
        </h2>
        <p className="mt-4 max-w-2xl text-lg drop-shadow-md animate-fadeInUp delay-200">
          {heroImages[currentIndex].subtitle}
        </p>

        {/* Boutons fixes, hors du carousel */}
        <div className="mt-8 flex space-x-4 animate-fadeInUp delay-300">
          <button
            onClick={scrollToOffres}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-300 transition-transform duration-300 hover:scale-[1.05]"
          >
            Explorer les offres
          </button>

          <button
  onClick={() => {
    const section = document.getElementById("comment-ca-marche");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  }}
  className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-black transition-colors duration-300"
>
  Comment ça marche ?
</button>

        </div>

        {/* Indicateurs */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "bg-white w-8" : "bg-white/50"
              }`}
              aria-label={`Aller à l'image ${idx + 1}`}
              type="button"
            />
          ))}
        </div>
      </div>

      {/* Animation fadeInUp CSS (tailwind + keyframes) */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease forwards;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </section>
  );
}
