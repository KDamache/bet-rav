import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { bettingApi } from '../lib/axios';

interface Sport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
}

const sportIcons: { [key: string]: string } = {
  americanfootball: '🏈',
  aussierules: '🏉',
  baseball: '⚾',
  basketball: '🏀',
  boxing: '🥊',
  cricket: '🏏',
  golf: '⛳',
  hockey: '🏑',
  icehockey: '🏒',
  lacrosse: '🥍',
  mma: '🥋',
  politics: '🗳️',
  rugbyleague: '🏉',
  rugbyunion: '🏉',
  soccer: '⚽',
  tennis: '🎾'
};

export default function Sports() {
  const { data: sports, isLoading, error } = useQuery<Sport[]>({
    queryKey: ['sports'],
    queryFn: async () => {
      const response = await bettingApi.get('/odds/sports');
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
        Une erreur est survenue lors du chargement des sports.
      </div>
    );
  }

  const groupedSports = sports?.reduce((acc: { [key: string]: Sport[] }, sport) => {
    if (!acc[sport.group]) {
      acc[sport.group] = [];
    }
    acc[sport.group].push(sport);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Choisissez votre sport</h1>

      {groupedSports && Object.entries(groupedSports).map(([group, sports]) => (
        <div key={group} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            {group.charAt(0).toUpperCase() + group.slice(1)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sports.map((sport) => (
              <Link
                key={sport.key}
                to={`/sports/${sport.key}/matches`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">
                  {sportIcons[sport.key.split('_')[0]] || '🎮'}
                </div>
                <h3 className="text-lg font-semibold mb-2">{sport.title}</h3>
                <p className="text-sm text-gray-600">{sport.description}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}