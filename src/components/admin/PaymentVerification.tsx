import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { getPendingPayments, verifyPayment, rejectPayment, PaymentRequest } from '@/lib/paypal';

export const PaymentVerification: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);

  useEffect(() => {
    // Load initial payments
    setPayments(getPendingPayments());

    // Set up periodic refresh
    const interval = setInterval(() => {
      setPayments(getPendingPayments());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleVerify = async (paymentId: string) => {
    try {
      verifyPayment(paymentId);
      setPayments(getPendingPayments());
      toast.success('Payment verified successfully');
    } catch (error) {
      toast.error('Failed to verify payment');
      console.error(error);
    }
  };

  const handleReject = async (paymentId: string) => {
    try {
      rejectPayment(paymentId);
      setPayments(getPendingPayments());
      toast.success('Payment rejected');
    } catch (error) {
      toast.error('Failed to reject payment');
      console.error(error);
    }
  };

  return (
    <div>
      <div className="rounded-md border border-tech-blue/20">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{new Date(payment.timestamp).toLocaleDateString()}</TableCell>
                <TableCell className="capitalize">{payment.plan.name}</TableCell>
                <TableCell>${payment.plan.price}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    payment.status === 'verified' ? 'bg-green-100 text-green-800' :
                    payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status}
                  </span>
                </TableCell>
                <TableCell className="font-mono">{payment.id}</TableCell>
                <TableCell>
                  {payment.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleVerify(payment.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(payment.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};