
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Download, Clock, CheckCircle, XCircle } from 'lucide-react';

const mockPayments = [
  {
    id: 1,
    plan: 'Premium',
    amount: '$499',
    method: 'PayPal',
    status: 'completed',
    date: '2024-01-15',
    transactionId: 'PP-12345'
  },
  {
    id: 2,
    plan: 'Standard',
    amount: '$299',
    method: 'USDT',
    status: 'pending',
    date: '2024-01-10',
    transactionId: 'CRYPTO-67890'
  },
  {
    id: 3,
    plan: 'Ultimate',
    amount: '$899',
    method: 'PayPal',
    status: 'failed',
    date: '2024-01-05',
    transactionId: 'PP-54321'
  }
];

const PaymentHistory = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-tech-green" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-tech-green text-tech-dark';
      case 'pending': return 'bg-yellow-500 text-tech-dark';
      case 'failed': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Payment History</h2>
          <p className="text-gray-400">Track your purchases and payment status</p>
        </div>
        <Button className="bg-tech-blue hover:bg-tech-blue/80">
          <CreditCard className="w-4 h-4 mr-2" />
          New Purchase
        </Button>
      </div>

      <div className="grid gap-4">
        {mockPayments.map((payment) => (
          <Card key={payment.id} className="bg-tech-charcoal border-tech-blue/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-tech-blue/20 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-tech-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{payment.plan} Plan</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-400">{payment.amount} via {payment.method}</p>
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(payment.date).toLocaleDateString()} • {payment.transactionId}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {payment.status === 'completed' && (
                    <Button size="sm" variant="outline" className="border-tech-green/30 text-tech-green hover:bg-tech-green/10">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="border-tech-blue/30">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-tech-charcoal border-tech-blue/30">
        <CardHeader>
          <CardTitle className="text-white">Payment Methods</CardTitle>
          <CardDescription className="text-gray-400">
            We accept multiple payment methods for your convenience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-tech-blue/30 rounded-lg">
              <h4 className="font-medium text-white mb-2">PayPal</h4>
              <p className="text-sm text-gray-400">Instant processing with buyer protection</p>
            </div>
            <div className="p-4 border border-tech-blue/30 rounded-lg">
              <h4 className="font-medium text-white mb-2">Cryptocurrency</h4>
              <p className="text-sm text-gray-400">USDT payments on BSC network</p>
            </div>
            <div className="p-4 border border-tech-blue/30 rounded-lg">
              <h4 className="font-medium text-white mb-2">Flutterwave</h4>
              <p className="text-sm text-gray-400">Credit cards and local payment methods</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;
