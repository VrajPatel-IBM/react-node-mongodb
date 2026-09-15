// All selector functions for the cart slice

export const selectCartItems = (state) => state.cart.items;

export const selectCartItemCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

export const selectCartItemById = (id, tier) => (state) =>
  state.cart.items.find((item) => item.id === id && (tier === undefined || item.tier === tier));
