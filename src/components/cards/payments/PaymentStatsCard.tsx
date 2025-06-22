import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import type { Payment } from '../../../types';

interface PaymentStatsCardProps {
  payments: Payment[];
}

export const PaymentStatsCard: React.FC<PaymentStatsCardProps> = ({ payments }) => {

  const stats = React.useMemo(() => {
    const totalPositive = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalNegative = payments
      .filter(p => p.status === 'pending' || p.status === 'overdue' || p.status === 'partial')
      .reduce((sum, p) => {
        if (p.status === 'partial') {
          const paidAmount = p.partialPayments?.reduce((sum, pp) => sum + pp.amount, 0) || 0;
          return sum + (p.amount - paidAmount);
        }
        return sum + p.amount;
      }, 0);

    const overdueCount = payments.filter(p => p.status === 'overdue').length;
    const pendingCount = payments.filter(p => p.status === 'pending').length;

    const sportPayments = payments.filter(p => p.type === 'sport');
    const societaryPayments = payments.filter(p => p.type === 'societary');

    const sportTotal = sportPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const societaryTotal = societaryPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalPositive,
      totalNegative,
      balance: totalPositive - totalNegative,
      overdueCount,
      pendingCount,
      sportTotal,
      societaryTotal
    };
  }, [payments]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
    
    {/* Ingresos por Tipo */}
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Ingresos por Tipo</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Cuotas Deportivas</span>
          <span className="font-medium text-gray-900">{formatCurrency(stats.sportTotal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Cuotas Societarias</span>
          <span className="font-medium text-gray-900">{formatCurrency(stats.societaryTotal)}</span>
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between items-center font-medium">
            <span className="text-gray-900">Total</span>
            <span className="text-[#FFD700]">{formatCurrency(stats.sportTotal + stats.societaryTotal)}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Balance cards en formato 2x2 */}
    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Total Positive */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Ingresos</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalPositive)}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Total Negative */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Deudas</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalNegative)}
            </p>
          </div>
          <div className="p-3 bg-red-100 rounded-full">
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Balance</p>
            <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(stats.balance))}
            </p>
          </div>
          <div className={`p-3 rounded-full ${stats.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            <DollarSign className={`h-6 w-6 ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Alertas</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.overdueCount + stats.pendingCount}
            </p>
            <p className="text-xs text-gray-500">
              {stats.overdueCount} vencidas, {stats.pendingCount} pendientes
            </p>
          </div>
          <div className="p-3 bg-orange-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

};