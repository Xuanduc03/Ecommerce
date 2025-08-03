import axios from 'axios';

const API_BASE_URL = 'https://localhost:7040/api';

export interface MockPaymentRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface MockPaymentResponse {
  success: boolean;
  paymentUrl: string;
  message: string;
  orderId: string;
  transactionId?: string;
  status?: string;
}

export interface MockPaymentStatus {
  orderId: string;
  transactionId: string;
  status: string;
  amount: number;
  createdAt: string;
  completedAt?: string;
  paymentMethod: string;
  bankCode: string;
  orderInfo: string;
}

export interface PaymentCallback {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

class MockPaymentApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async createMockPayment(request: MockPaymentRequest): Promise<MockPaymentResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/mock-payment/create`,
        request,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating mock payment:', error);
      throw error;
    }
  }

  async getPaymentStatus(orderId: string): Promise<MockPaymentStatus> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/mock-payment/status/${orderId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  async processMockCallback(orderId: string, status: 'success' | 'failed'): Promise<PaymentCallback> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/mock-payment/callback/${orderId}?status=${status}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error processing mock callback:', error);
      throw error;
    }
  }

  async validateMockPayment(orderId: string, transactionId: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/mock-payment/validate/${orderId}?transactionId=${transactionId}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.status === 200;
    } catch (error) {
      console.error('Error validating mock payment:', error);
      return false;
    }
  }

  getMockPaymentSimulationUrl(orderId: string): string {
    return `${API_BASE_URL}/mock-payment/simulate/${orderId}`;
  }

  // Helper method to simulate payment flow
  async simulatePaymentFlow(request: MockPaymentRequest, simulateSuccess: boolean = true): Promise<{
    success: boolean;
    transactionId?: string;
    callback?: PaymentCallback;
  }> {
    try {
      // Step 1: Create mock payment
      const createResponse = await this.createMockPayment(request);
      
      if (!createResponse.success) {
        return { success: false };
      }

      // Step 2: Simulate callback
      const status = simulateSuccess ? 'success' : 'failed';
      const callback = await this.processMockCallback(request.orderId, status);

      return {
        success: simulateSuccess,
        transactionId: callback.vnp_TransactionNo,
        callback
      };
    } catch (error) {
      console.error('Error in payment flow simulation:', error);
      return { success: false };
    }
  }
}

export const mockPaymentApi = new MockPaymentApi();
export default mockPaymentApi;