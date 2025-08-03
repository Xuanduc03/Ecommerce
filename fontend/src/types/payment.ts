export interface MockPaymentSimulation {
  shouldSucceed: boolean;
  delaySeconds: number;
  failureReason?: string;
  bankCode?: string;
  transactionRef?: string;
}

export interface MockPaymentRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  simulation?: MockPaymentSimulation;
}

export interface MockPaymentResponse {
  success: boolean;
  paymentUrl: string;
  message: string;
  orderId: string;
  transactionId: string;
  paymentMethod: string;
  status: MockPaymentStatus;
  processedAt: string;
}

export interface MockPaymentCallback {
  orderId: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  status: MockPaymentStatus;
  responseCode: string;
  message: string;
  paymentDate: string;
  bankCode?: string;
  bankTransactionRef?: string;
}

export interface MockPaymentStatusResponse {
  orderId: string;
  transactionId: string;
  status: MockPaymentStatus;
  message: string;
  lastUpdated: string;
}

export interface MockPaymentVerification {
  orderId: string;
  transactionId: string;
  isValid: boolean;
  status: MockPaymentStatus;
  message: string;
}

export const MockPaymentStatus = {
  Pending: 0,
  Processing: 1,
  Success: 2,
  Failed: 3,
  Cancelled: 4,
  Expired: 5
} as const;

export type MockPaymentStatus = typeof MockPaymentStatus[keyof typeof MockPaymentStatus];

export const getPaymentStatusName = (status: MockPaymentStatus): string => {
  switch (status) {
    case MockPaymentStatus.Pending: return 'Pending';
    case MockPaymentStatus.Processing: return 'Processing';
    case MockPaymentStatus.Success: return 'Success';
    case MockPaymentStatus.Failed: return 'Failed';
    case MockPaymentStatus.Cancelled: return 'Cancelled';
    case MockPaymentStatus.Expired: return 'Expired';
    default: return 'Unknown';
  }
};

export interface PaymentMethodOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface PaymentFormData {
  orderId: string;
  amount: number;
  orderInfo: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  simulationSettings: {
    shouldSucceed: boolean;
    delaySeconds: number;
    failureReason: string;
    bankCode: string;
  };
}

export interface PaymentScenario {
  id: string;
  name: string;
  description: string;
  simulation: MockPaymentSimulation;
}