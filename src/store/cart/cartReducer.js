// Reducer for cart slice with localStorage persistence support

import {
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_INCREMENT_QTY,
  CART_DECREMENT_QTY,
  CART_UPDATE_QTY,
  CART_CLEAR,
  CART_SET_ITEMS,
} from './cartActionTypes';

const CART_STORAGE_KEY = 'learnhub_cart';

export function readStoredCart() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((item) => ({
      ...item,
      price: Number(item.price),
      quantity: Number(item.quantity),
    }));
  } catch {
    return [];
  }
}

function syncToStorage(items) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Could not save cart to localStorage', err);
  }
}

export const cartInitialState = {
  items: readStoredCart(),
};

export function cartReducer(state = cartInitialState, action) {
  let nextItems;

  switch (action.type) {
    case CART_ADD_ITEM: {
      const { course, qty = 1, options = {} } = action.payload;
      const tier = options.tier || course.priceTiers?.[0]?.name || 'Self-Paced';
      const tierPrice =
        course.priceTiers?.find((t) => t.name === tier)?.price ?? Number(course.price) ?? 0;

      const existing = state.items.find((i) => i.id === course.id && i.tier === tier);
      if (existing) {
        nextItems = state.items.map((item) =>
          item.id === course.id && item.tier === tier
            ? { ...item, quantity: item.quantity + Number(qty) }
            : item
        );
      } else {
        nextItems = [
          ...state.items,
          {
            id: course.id,
            title: course.title,
            thumbnail: course.thumbnail || '',
            tier,
            price: Number(tierPrice),
            quantity: Number(qty),
          },
        ];
      }
      syncToStorage(nextItems);
      return { ...state, items: nextItems };
    }

    case CART_REMOVE_ITEM: {
      const { id, tier } = action.payload;
      nextItems = state.items.filter((i) => !(i.id === id && i.tier === tier));
      syncToStorage(nextItems);
      return { ...state, items: nextItems };
    }

    case CART_INCREMENT_QTY: {
      const { id, tier } = action.payload;
      nextItems = state.items.map((i) => (i.id === id && i.tier === tier ? { ...i, quantity: i.quantity + 1 } : i));
      syncToStorage(nextItems);
      return { ...state, items: nextItems };
    }

    case CART_DECREMENT_QTY: {
      const { id, tier } = action.payload;
      const item = state.items.find((i) => i.id === id && i.tier === tier);
      if (!item) return state;
      nextItems =
        item.quantity <= 1
          ? state.items.filter((i) => !(i.id === id && i.tier === tier))
          : state.items.map((i) => (i.id === id && i.tier === tier ? { ...i, quantity: i.quantity - 1 } : i));
      syncToStorage(nextItems);
      return { ...state, items: nextItems };
    }

    case CART_UPDATE_QTY: {
      const { id, tier, quantity } = action.payload;
      const numQty = Number(quantity);
      nextItems =
        numQty <= 0
          ? state.items.filter((i) => !(i.id === id && i.tier === tier))
          : state.items.map((i) => (i.id === id && i.tier === tier ? { ...i, quantity: numQty } : i));
      syncToStorage(nextItems);
      return { ...state, items: nextItems };
    }

    case CART_CLEAR:
      syncToStorage([]);
      return { ...state, items: [] };

    case CART_SET_ITEMS:
      syncToStorage(action.payload);
      return { ...state, items: action.payload };

    default:
      return state;
  }
}
