// Action creator functions for the cart feature

import {
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_INCREMENT_QTY,
  CART_DECREMENT_QTY,
  CART_UPDATE_QTY,
  CART_CLEAR,
  CART_SET_ITEMS,
} from './cartActionTypes';

/** Add a course seat to the cart with a chosen tier and quantity */
export const addToCart = (course, qty = 1, options = {}) => ({
  type: CART_ADD_ITEM,
  payload: { course, qty, options },
});

export const removeFromCart = (id, tier) => ({
  type: CART_REMOVE_ITEM,
  payload: { id, tier },
});

export const increaseQuantity = (id, tier) => ({
  type: CART_INCREMENT_QTY,
  payload: { id, tier },
});

export const decreaseQuantity = (id, tier) => ({
  type: CART_DECREMENT_QTY,
  payload: { id, tier },
});

export const updateQuantity = (id, tier, quantity) => ({
  type: CART_UPDATE_QTY,
  payload: { id, tier, quantity },
});

export const clearCart = () => ({
  type: CART_CLEAR,
});

export const setCartItems = (items) => ({
  type: CART_SET_ITEMS,
  payload: items,
});
