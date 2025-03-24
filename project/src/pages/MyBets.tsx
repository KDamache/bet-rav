import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bettingApi } from '../lib/axios';
import { useAuthStore } from '../stores/authStore';

interface Bet {
  _id: string;
  matchId: string;
  amount: number;
  odds: number;
  selectedTeam: string;
  status: 'pending' | 'won' | 'lost';
  potentialWinnings: number;
  createdAt: string;
  matchData: {
    homeTeam: string;
    awayTeam: string;
    startTime: string;
    sport: string;
  };
}

export default function MyBets() {
  const queryClient = useQueryClient();
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const updateBalance = useAuthStore(state => state.updateBalance);

  const { data: bets, isLoading } = useQuery<{ bets: Bet[] }>({
    queryKey: ['bets', selectedStatuses],
    queryFn: async () => {
      const statusQuery = selectedStatuses.length > 0
        ? `?status=${selectedStatuses.join(',')}`
        : '';
      const response = await bettingApi.get(`/betting/history${statusQuery}`);
      return response.data;
    },
  });

  const finishBetMutation = useMutation({
    mutationFn: async (betId: string) => {
      const response = await bettingApi.post(`/betting/finish/${betId}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      updateBalance(data.newBalance);
    },
  });

  const handleStatusChange = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const finishAllPendingBets = async () => {
    const pendingBets = bets?.bets.filter(bet => bet.status === 'pending') || [];
    for (const bet of pendingBets) {
      await finishBetMutation.mutateAsync(bet._id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes Paris</h1>
        <button
          onClick={finishAllPendingBets}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Simuler un Time Skip
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {['pending', 'won', 'lost'].map(status => (
          <label key={status} className="inline-flex items-center">
            <input
              type="checkbox"
              checked={selectedStatuses.includes(status)}
              onChange={() => handleStatusChange(status)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 capitalize">{status}</span>
          </label>
        ))}
      </div>

      <div className="grid gap-6">
        {bets?.bets.map((bet) => (
          <div key={bet._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {bet.matchData.homeTeam} vs {bet.matchData.awayTeam}
                </h2>
                <p className="text-gray-600">
                  {new Date(bet.matchData.startTime).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  bet.status === 'won' ? 'bg-green-100 text-green-800' :
                  bet.status === 'lost' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {bet.status === 'pending' ? 'En cours' :
                   bet.status === 'won' ? 'Gagné' : 'Perdu'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Équipe sélectionnée</p>
                <p className="font-medium">{bet.selectedTeam}</p>
              </div>
              <div>
                <p className="text-gray-600">Cote</p>
                <p className="font-medium">{bet.odds}</p>
              </div>
              <div>
                <p className="text-gray-600">Montant parié</p>
                <p className="font-medium">{bet.amount}€</p>
              </div>
              <div>
                <p className="text-gray-600">Gains potentiels</p>
                <p className="font-medium">{bet.potentialWinnings}€</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}