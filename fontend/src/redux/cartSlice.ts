import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type CartItem, type CartItemPayload, type CartState, type UpdateQuantityPayload } from "../types/cart";

const loadCartFromStorage = (): CartItem[] => {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
};

const saveCartToStorage = (cart: CartItem[]) : void => {
    localStorage.setItem("cart", JSON.stringify(cart));
};

const cartSlice  = createSlice({
    name : "cart",
    initialState: {
        items: loadCartFromStorage(),
    },
    reducers : {
        // reducer function xử lý thêm vào giỏ hàng
        addToCart : (state: CartState, action : PayloadAction<CartItemPayload>) => {
            const {_id, productName, size, color, category, price, quantity = 1, images} = action.payload;
            const existingItem = state.items.find((item) => item._id === _id);

            if(existingItem){
                existingItem.quantity += quantity;
            }else {
                state.items.push({_id, productName, category, color, size, price, quantity, images});
            }

            saveCartToStorage(state.items);
        },
        //reducer function tăng sản phẩm trong cart
        increaseQuantity: (state : CartState, action : PayloadAction<UpdateQuantityPayload>) => {
            const {_id, size, color} = action.payload;
            const item = state.items.find((item) => item._id === _id && item.size === size && item.color === color);
            if(item){
                item.quantity += 1;
                saveCartToStorage(state.items);
            } 
        },
        decreaseQuantity : (state: CartState, action: PayloadAction<UpdateQuantityPayload>) => {
            const {_id, size, color} = action.payload;
            const item = state.items.find((item) => item._id === _id && item.size === size && item.color === color);
            if(item){
                if(item.quantity > 1){
                    item.quantity -= 1;
                }else {
                    state.items.filter((i) => !(i._id === _id && i.size === size && i.color === color))
                }
                saveCartToStorage(state.items);
            } 
        },
        removeFromCart: (state : CartState, action : PayloadAction<string>) => {
            state.items = state.items.filter((item) => item._id !== action.payload);
            saveCartToStorage(state.items)
        },
        clearCart: (state: CartState) => {
            state.items = [];
            saveCartToStorage(state.items);
        }
    }
});

export const {addToCart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity} = cartSlice.actions;
export default cartSlice.reducer;
export type { CartState, CartItem };