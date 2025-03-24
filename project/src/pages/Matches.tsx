import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { bettingApi } from '../lib/axios';

interface Match {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    markets: Array<{
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

export default function Matches() {
  const { sport } = useParams<{ sport: string }>();

  const { data: matches, isLoading, error } = useQuery<Match[]>({
    queryKey: ['matches', sport],
    queryFn: async () => {
      const response = await bettingApi.get(`/odds/matches/${sport}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Une erreur est survenue lors du chargement des matches.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Matches disponibles</h1>

      <div className="grid gap-6">
        {matches?.map((match) => {
          const odds = match.bookmakers[0]?.markets[0]?.outcomes || [];
          const matchDate = new Date(match.commence_time);

          return (
            <div key={match.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {match.home_team} vs {match.away_team}
                  </h2>
                  <p className="text-gray-600">
                    {matchDate.toLocaleDateString()} à {matchDate.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                {odds.map((outcome) => (
                  <Link
                    key={outcome.name}
                    to={`/place-bet/${sport}/${match.id}?team=${outcome.name}&odds=${outcome.price}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <span className="font-medium">{outcome.name}</span>
                    <span className="text-blue-600 font-semibold">
                      {outcome.price.toFixed(2)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}