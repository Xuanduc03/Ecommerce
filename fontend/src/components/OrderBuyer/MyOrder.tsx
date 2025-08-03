import React, { useState } from 'react';
import './MyOrder.scss';

interface Order {
  id: string;
  shopName: string;
  status: string;
  productName: string;
  productVariant: string;
  quantity: number;
  originalPrice: number;
  discountedPrice: number;
  totalAmount: number;
}

const MyOrder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sample order data
  const orders: Order[] = [
    {
      id: 'DH123456',
      shopName: 'ANTHAO STORE',
      status: 'completed',
      productName: 'Ghế Văn Phòng Gấp Gọn Ghế Gấp Decor Phòng Ghế Đệm Tựa Lưng Bọc Da Êm Ái Khung Thép',
      productVariant: 'Sơn Tĩnh Điện - Caro',
      quantity: 1,
      originalPrice: 4150000,
      discountedPrice: 4142000,
      totalAmount: 4141800
    },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && order.status === activeTab;
  });

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="order-status-container">
      <h1>Đơn hàng của tôi</h1>
      
      <div className="tabs">
        <button 
          className={activeTab === 'all' ? 'active' : ''} 
          onClick={() => setActiveTab('all')}
        >
          Tất cả
        </button>
        <button 
          className={activeTab === 'pending_payment' ? 'active' : ''} 
          onClick={() => setActiveTab('pending_payment')}
        >
          Chờ thanh toán
        </button>
        <button 
          className={activeTab === 'shipping' ? 'active' : ''} 
          onClick={() => setActiveTab('shipping')}
        >
          Vận chuyển
        </button>
        <button 
          className={activeTab === 'pending_delivery' ? 'active' : ''} 
          onClick={() => setActiveTab('pending_delivery')}
        >
          Chờ giao hàng
        </button>
        <button 
          className={activeTab === 'completed' ? 'active' : ''} 
          onClick={() => setActiveTab('completed')}
        >
          Hoàn thành
        </button>
        <button 
          className={activeTab === 'cancelled' ? 'active' : ''} 
          onClick={() => setActiveTab('cancelled')}
        >
          Đã hủy
        </button>
        <button 
          className={activeTab === 'refund' ? 'active' : ''} 
          onClick={() => setActiveTab('refund')}
        >
          Trả hàng/Hoàn tiền
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <p className="no-orders">Không có đơn hàng nào</p>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>{order.shopName}</h3>
                <div className="order-actions">
                  <button className="chat-btn">Chat</button>
                  <button className="view-shop-btn">Xem Shop</button>
                </div>
              </div>

              <div className="order-status">
                <span className={`status-badge ${order.status}`}>
                  {order.status === 'completed' ? 'Giao hàng thành công' : ''}
                  {order.status === 'completed' && <span className="status-completed">HOÀN THÀNH</span>}
                </span>
              </div>

              <div className="order-product">
                <h4>{order.productName}</h4>
                <p>{order.productVariant}</p>
                <p className="quantity">x{order.quantity}</p>
              </div>

              <div className="order-prices">
                {order.discountedPrice < order.originalPrice && (
                  <span className="original-price">{formatPrice(order.originalPrice)}₫</span>
                )}
                <span className="discounted-price">{formatPrice(order.discountedPrice)}₫</span>
              </div>

              <div className="order-total">
                <span>Thành tiền:</span>
                <span className="total-amount">{formatPrice(order.totalAmount)}₫</span>
              </div>

              <div className="order-footer">
                <button className="reorder-btn">Mua Lại</button>
                <button className="contact-seller-btn">Liên Hệ Người Bán</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrder;