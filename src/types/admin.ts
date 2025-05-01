export interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  currency: 'USD';
  status: 'pending' | 'verified' | 'rejected';
  paymentMethod: 'paypal';
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  transactionId: string;
  planId: string;
}

export interface PageVisit {
  id: string;
  path: string;
  timestamp: string;
  userAgent: string;
  referrer?: string;
  ip?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin';
  lastLogin: string;
}