import { useEffect } from 'react';
import { Coins } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function BalanceDisplay() {
  const { balance, fetchBalance } = useAuthStore();

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow">
      <Coins className="h-5 w-5 text-yellow-500" />
      <span className="font-semibold text-gray-900">{balance.toFixed(2)}€</span>
    </div>
  );
}