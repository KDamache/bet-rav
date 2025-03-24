import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bettingApi } from '../lib/axios';
import { useAuthStore } from '../stores/authStore';

export default function PlaceBet() {
  const { sport, matchId } = useParams<{ sport: string; matchId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateBalance = useAuthStore(state => state.updateBalance);

  const team = searchParams.get('team');
  const odds = searchParams.get('odds');

  const [amount, setAmount] = useState('10');
  const [error, setError] = useState('');

  const placeBetMutation = useMutation({
    mutationFn: async (data: { matchId: string; amount: number; selectedTeam: string; sport: string }) => {
      const response = await bettingApi.post('/betting/place', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      updateBalance(data.newBalance);
      navigate('/my-bets');
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'Une erreur est survenue');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sport || !matchId || !team) return;

    placeBetMutation.mutate({
      matchId,
      amount: Number(amount),
      selectedTeam: team,
      sport,
    });
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-8">Placer un pari</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Détails du pari</h2>
          <p className="text-gray-600">Équipe sélectionnée : {team}</p>
          <p className="text-gray-600">Cote : {odds}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Montant du pari (€)
            </label>
            <input
              type="number"
              id="amount"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600">
              Gains potentiels : {(Number(amount) * Number(odds)).toFixed(2)}€
            </p>
          </div>

          <button
            type="submit"
            disabled={placeBetMutation.isPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {placeBetMutation.isPending ? 'Placement du pari...' : 'Placer le pari'}
          </button>
        </form>
      </div>
    </div>
  );
}