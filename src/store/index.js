// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cart/cartSlice';
import coursesReducer from './courses/coursesSlice';
import authReducer from './auth/authSlice';
import enrollmentsReducer from './enrollments/enrollmentsSlice';

export function createStore(preloadedState) {
  return configureStore({
    reducer: {
      cart: cartReducer,
      courses: coursesReducer,
      auth: authReducer,
      enrollments: enrollmentsReducer,
    },
    preloadedState,
  });
}

export const store = createStore();
