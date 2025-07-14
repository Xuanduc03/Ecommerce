// Types for cart items
export interface CartItem {
  _id: string;
  productName: string;
  category: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  images: string;
}

// Type for cart state
export interface CartState {
  items: CartItem[];
}

// Type for action payloads
export interface CartItemPayload {
  _id: string;
  productName: string;
  category: string;
  color: string;
  size: string;
  price: number;
  quantity?: number;
  images: string;
}

export interface UpdateQuantityPayload {
  _id: string;
  size: string;
  color: string;
}