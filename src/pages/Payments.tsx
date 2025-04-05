import React from 'react';
import { usePayments } from '../hooks/usePayments';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const Payments: React.FC = () => {
  const { payments, loading, error, markAsPaid } = usePayments();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'overdue':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Payments</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#1a1a1a]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">Member ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">Sport</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">Quote</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#FFD700] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.memberId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.sportId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.quoteId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payment.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.dueDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    {getStatusIcon(payment.status)}
                    <span className="ml-2 capitalize">{payment.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.status === 'pending' && (
                    <button
                      onClick={() => markAsPaid(payment.id)}
                      className="text-sm bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
                    >
                      Mark as Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;