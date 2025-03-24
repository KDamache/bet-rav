import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function Home() {
  const username = useAuthStore((state) => state.username);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <img 
          src="/bet-rav-logo.png" 
          alt="BetRav Logo" 
          className="mx-auto h-16 w-16"
        />
        <h1 className="mt-4 text-4xl font-bold text-gray-900">
          Bienvenue {username ? `${username}` : ''} sur BetRav
        </h1>
        <p className="mt-2 text-xl text-gray-600">
          La plateforme de paris sportifs qui vous fait vivre le sport autrement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Paris Sportifs</h2>
          <p className="text-gray-600 mb-4">
            Pariez sur vos équipes favorites dans différents sports et multipliez vos gains !
          </p>
          <Link
            to="/sports"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            Commencer à parier
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Mes Paris</h2>
          <p className="text-gray-600 mb-4">
            Suivez vos paris en cours et consultez l'historique de vos gains.
          </p>
          <Link
            to="/my-bets"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            Voir mes paris
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 p-8 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xl font-semibold mb-2">1. Choisissez</div>
            <p className="text-gray-600">
              Sélectionnez votre sport favori et le match qui vous intéresse.
            </p>
          </div>
          <div>
            <div className="text-xl font-semibold mb-2">2. Pariez</div>
            <p className="text-gray-600">
              Placez votre pari sur l'équipe de votre choix avec le montant souhaité.
            </p>
          </div>
          <div>
            <div className="text-xl font-semibold mb-2">3. Gagnez</div>
            <p className="text-gray-600">
              Suivez le match et récupérez vos gains en cas de victoire !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}