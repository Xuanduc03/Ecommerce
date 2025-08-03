import axios from 'axios';
import type {
  MockPaymentRequest,
  MockPaymentResponse,
  MockPaymentCallback,
  MockPaymentStatusResponse,
  MockPaymentVerification
} from '../types/payment';

const API_BASE_URL = 'https://localhost:7040/api';

class MockPaymentAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async createPayment(request: MockPaymentRequest): Promise<MockPaymentResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/mockpayment/create`,
        request,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating mock payment:', error);
      throw error;
    }
  }

  async processPayment(transactionId: string): Promise<MockPaymentCallback> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/mockpayment/process/${transactionId}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error processing mock payment:', error);
      throw error;
    }
  }

  async getPaymentStatus(orderId: string): Promise<MockPaymentStatusResponse> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/mockpayment/status/${orderId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  async verifyPayment(transactionId: string): Promise<MockPaymentVerification> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/mockpayment/verify/${transactionId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  async cancelPayment(transactionId: string): Promise<{ message: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/mockpayment/cancel/${transactionId}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error cancelling payment:', error);
      throw error;
    }
  }

  async getAllPayments(): Promise<MockPaymentStatusResponse[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/mockpayment/all`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting all payments:', error);
      throw error;
    }
  }

  async generateTransactionId(): Promise<{ transactionId: string }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/mockpayment/generate-transaction-id`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating transaction ID:', error);
      throw error;
    }
  }

  async createQuickTestPayment(scenario: string = 'success'): Promise<MockPaymentResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/mockpayment/quick-test?scenario=${scenario}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating quick test payment:', error);
      throw error;
    }
  }

  simulateCallback(
    orderId: string,
    transactionId: string,
    success: boolean = true,
    returnUrl?: string
  ): string {
    const params = new URLSearchParams({
      orderId,
      transactionId,
      success: success.toString(),
      ...(returnUrl && { returnUrl })
    });
    
    return `${API_BASE_URL}/mockpayment/simulate-callback?${params.toString()}`;
  }
}

export const mockPaymentAPI = new MockPaymentAPI();