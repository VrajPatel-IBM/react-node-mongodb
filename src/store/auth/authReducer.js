// Reducer for authentication slice

import {
  AUTH_LOGIN_START,
  AUTH_LOGIN_SUCCESS,
  AUTH_LOGIN_FAIL,
  AUTH_SIGNUP_START,
  AUTH_SIGNUP_SUCCESS,
  AUTH_SIGNUP_FAIL,
  AUTH_LOGOUT,
  AUTH_PROFILE_UPDATE_START,
  AUTH_PROFILE_UPDATE_SUCCESS,
  AUTH_PROFILE_UPDATE_FAIL,
  AUTH_CLEAR_ERROR,
} from './authActionTypes';

const USER_STORAGE_KEY = 'learnhub_auth_user';

function getInitialUser() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export const authInitialState = {
  user: getInitialUser(),
  loading: false,
  error: null,
};

export function authReducer(state = authInitialState, action) {
  switch (action.type) {
    case AUTH_LOGIN_START:
    case AUTH_SIGNUP_START:
    case AUTH_PROFILE_UPDATE_START:
      return { ...state, loading: true, error: null };

    case AUTH_LOGIN_SUCCESS:
    case AUTH_SIGNUP_SUCCESS:
    case AUTH_PROFILE_UPDATE_SUCCESS:
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(action.payload));
        } catch (err) {
          console.warn('Failed to save user in localStorage', err);
        }
      }
      return { ...state, loading: false, user: action.payload, error: null };

    case AUTH_LOGIN_FAIL:
    case AUTH_SIGNUP_FAIL:
    case AUTH_PROFILE_UPDATE_FAIL:
      return { ...state, loading: false, error: action.payload };

    case AUTH_LOGOUT:
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem(USER_STORAGE_KEY);
        } catch (err) {
          console.warn('Failed to remove user from localStorage', err);
        }
      }
      return { ...state, user: null, loading: false, error: null };

    case AUTH_CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
}
