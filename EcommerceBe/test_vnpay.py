#!/usr/bin/env python3
"""
VNPay Integration Test Script
Test các endpoints của VNPay integration
"""

import requests
import json
import urllib.parse

# Configuration
BASE_URL = "https://localhost:7040"
API_BASE = f"{BASE_URL}/api/payment"

def test_create_payment():
    """Test tạo payment URL"""
    print("=== Testing Create Payment ===")
    
    payload = {
        "request": {
            "orderId": "TEST_ORDER_001",
            "amount": 100000,
            "orderInfo": "Test payment for order TEST_ORDER_001",
            "customerName": "Test Customer",
            "customerEmail": "test@example.com",
            "customerPhone": "0123456789"
        }
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/create-payment",
            json=payload,
            headers={"Content-Type": "application/json"},
            verify=False  # Skip SSL verification for localhost
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print(f"✅ Payment URL created: {data.get('paymentUrl')}")
            else:
                print(f"❌ Payment creation failed: {data.get('message')}")
        else:
            print(f"❌ Request failed with status {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {e}")

def test_callback():
    """Test callback endpoint"""
    print("\n=== Testing Callback Endpoint ===")
    
    # Sample callback parameters (these would come from VNPay)
    callback_params = {
        "vnp_Amount": "10000000",
        "vnp_BankCode": "NCB",
        "vnp_BankTranNo": "VNP12345678",
        "vnp_CardType": "ATM",
        "vnp_OrderInfo": "Test payment",
        "vnp_PayDate": "20231201120000",
        "vnp_ResponseCode": "00",
        "vnp_TmnCode": "2QXUI4J4",
        "vnp_TransactionNo": "12345678",
        "vnp_TransactionStatus": "00",
        "vnp_TxnRef": "TEST_ORDER_001",
        "vnp_SecureHash": "abc123"  # This would be the actual hash from VNPay
    }
    
    try:
        # Convert to query string
        query_string = urllib.parse.urlencode(callback_params)
        url = f"{API_BASE}/callback?{query_string}"
        
        print(f"Testing callback URL: {url}")
        
        response = requests.get(url, verify=False)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code in [200, 302]:
            print("✅ Callback endpoint responded")
        else:
            print(f"❌ Callback failed with status {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {e}")

def test_ipn():
    """Test IPN endpoint"""
    print("\n=== Testing IPN Endpoint ===")
    
    # Sample IPN parameters
    ipn_params = {
        "vnp_Amount": "10000000",
        "vnp_BankCode": "NCB",
        "vnp_BankTranNo": "VNP12345678",
        "vnp_CardType": "ATM",
        "vnp_OrderInfo": "Test payment",
        "vnp_PayDate": "20231201120000",
        "vnp_ResponseCode": "00",
        "vnp_TmnCode": "2QXUI4J4",
        "vnp_TransactionNo": "12345678",
        "vnp_TransactionStatus": "00",
        "vnp_TxnRef": "TEST_ORDER_001",
        "vnp_SecureHash": "abc123"
    }
    
    try:
        query_string = urllib.parse.urlencode(ipn_params)
        url = f"{API_BASE}/ipn?{query_string}"
        
        print(f"Testing IPN URL: {url}")
        
        response = requests.post(url, verify=False)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ IPN endpoint responded")
        else:
            print(f"❌ IPN failed with status {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {e}")

def main():
    """Main test function"""
    print("VNPay Integration Test")
    print("=" * 50)
    
    # Test các endpoints
    test_create_payment()
    test_callback()
    test_ipn()
    
    print("\n" + "=" * 50)
    print("Test completed!")

if __name__ == "__main__":
    main()