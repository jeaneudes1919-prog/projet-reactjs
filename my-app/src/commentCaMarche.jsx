import React from "react";
import { BriefcaseIcon, UserIcon } from "@heroicons/react/24/outline";

export default function CommentCaMarche() {
  return (
    <section id="comment-ca-marche"  className="py-16 px-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 max-w-7xl mx-auto rounded-lg shadow-md mb-12">
      <h2 className="text-3xl font-bold text-center mb-10">Comment ça marche ?</h2>
      <div className="flex flex-col md:flex-row justify-around gap-10">
        {/* Pour les entreprises */}
        <div className="flex flex-col items-center text-center max-w-sm">
          <BriefcaseIcon className="w-16 h-16 text-blue-600 dark:text-blue-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Pour les entreprises</h3>
          <p>
            Publiez vos offres d’emploi, gérez vos candidatures et trouvez les talents
            qui correspondent parfaitement à vos besoins.
          </p>
        </div>

        {/* Pour les candidats */}
        <div className="flex flex-col items-center text-center max-w-sm">
          <UserIcon className="w-16 h-16 text-green-600 dark:text-green-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Pour les candidats</h3>
          <p>
            Recherchez parmi des milliers d’offres, postulez facilement et
            suivez l’avancement de vos candidatures.
          </p>
        </div>
      </div>
    </section>
  );
}
