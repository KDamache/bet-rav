import { Link } from 'react-router-dom';
import { Home, Settings } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import BalanceDisplay from './BalanceDisplay';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/bet-rav-logo.png" alt="BetRav Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">BetRav</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 hover:text-blue-200">
              <Home className="h-5 w-5" />
              <span>Accueil</span>
            </Link>
            <Link to="/sports" className="hover:text-blue-200">Sports</Link>
            <Link to="/my-bets" className="hover:text-blue-200">Mes Paris</Link>
            <BalanceDisplay />
            <Link
              to="/settings"
              className="flex items-center space-x-1 hover:text-blue-200"
            >
              <Settings className="h-5 w-5" />
              <span>Paramètres</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}