import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../lib/axios';

export default function Settings() {
  const navigate = useNavigate();
  const { logout, username, updateUsername } = useAuthStore();
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (username) {
      setNewUsername(username);
    }
  }, [username]);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.put('/profile', { username: newUsername });
      updateUsername(newUsername);
      setSuccess('Nom d\'utilisateur mis à jour avec succès');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
      setSuccess('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    try {
      await authApi.delete('/account');
      logout();
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de la suppression du compte');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Paramètres</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Modifier le profil</h2>
        <form onSubmit={handleUpdateUsername} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Nouveau nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder={username || 'Entrez votre nom d\'utilisateur'}
              minLength={3}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Mettre à jour
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Déconnexion</h2>
        <p className="text-gray-600 mb-4">
          Vous serez déconnecté de votre compte et redirigé vers la page de connexion.
        </p>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Se déconnecter
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Supprimer le compte</h2>
        <p className="text-gray-600 mb-4">
          Attention : Cette action est irréversible. Toutes vos données seront définitivement supprimées.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Supprimer mon compte
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-red-600 font-medium">
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action ne peut pas être annulée.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Oui, supprimer
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}