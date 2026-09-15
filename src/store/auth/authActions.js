// Plain action creators and async thunk creators for authentication.
// Persists real users in MongoDB via the server's /data/auth routes.

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
import { isRequired, isValidEmail, isValidMobile } from '../../utils/validators';
import { loginRequest, signupRequest, updateProfileRequest } from '../../utils/fetchClient';

export const loginStartAction = () => ({ type: AUTH_LOGIN_START });
export const loginSuccessAction = (user) => ({ type: AUTH_LOGIN_SUCCESS, payload: user });
export const loginFailAction = (error) => ({ type: AUTH_LOGIN_FAIL, payload: error });

export const signupStartAction = () => ({ type: AUTH_SIGNUP_START });
export const signupSuccessAction = (user) => ({ type: AUTH_SIGNUP_SUCCESS, payload: user });
export const signupFailAction = (error) => ({ type: AUTH_SIGNUP_FAIL, payload: error });

export const logoutAction = () => ({ type: AUTH_LOGOUT });

export const updateProfileStartAction = () => ({ type: AUTH_PROFILE_UPDATE_START });
export const updateProfileSuccessAction = (user) => ({ type: AUTH_PROFILE_UPDATE_SUCCESS, payload: user });
export const updateProfileFailAction = (error) => ({ type: AUTH_PROFILE_UPDATE_FAIL, payload: error });

export const clearAuthErrorAction = () => ({ type: AUTH_CLEAR_ERROR });

export const loginUser = (email, password) => async (dispatch) => {
  if (!isValidEmail(email || '')) {
    dispatch(loginFailAction('Enter a valid email address'));
    return { error: 'Enter a valid email address' };
  }
  if (!isRequired(password)) {
    dispatch(loginFailAction('Password is required'));
    return { error: 'Password is required' };
  }

  dispatch(loginStartAction());
  try {
    const { user } = await loginRequest(email.trim(), password);
    dispatch(loginSuccessAction(user));
    return { user };
  } catch (err) {
    dispatch(loginFailAction(err.message));
    return { error: err.message };
  }
};

export const signupUser = (name, email, mobile, password) => async (dispatch) => {
  if (!isRequired(name)) {
    dispatch(signupFailAction('Name is required'));
    return { error: 'Name is required' };
  }
  if (!isValidEmail(email || '')) {
    dispatch(signupFailAction('Enter a valid email address'));
    return { error: 'Enter a valid email address' };
  }
  if (!isValidMobile(mobile || '')) {
    dispatch(signupFailAction('Enter a valid 10-digit mobile number'));
    return { error: 'Enter a valid 10-digit mobile number' };
  }
  if (!isRequired(password) || password.length < 6) {
    dispatch(signupFailAction('Password must be at least 6 characters'));
    return { error: 'Password must be at least 6 characters' };
  }

  dispatch(signupStartAction());
  try {
    const { user } = await signupRequest(name.trim(), email.trim(), mobile, password);
    dispatch(signupSuccessAction(user));
    return { user };
  } catch (err) {
    dispatch(signupFailAction(err.message));
    return { error: err.message };
  }
};

export const updateProfileUser = (fields) => async (dispatch, getState) => {
  const { user } = getState().auth;
  if (!user) {
    dispatch(updateProfileFailAction('Not logged in'));
    return { error: 'Not logged in' };
  }

  dispatch(updateProfileStartAction());
  try {
    const { user: updatedUser } = await updateProfileRequest(user.id, fields);
    dispatch(updateProfileSuccessAction(updatedUser));
    return { user: updatedUser };
  } catch (err) {
    dispatch(updateProfileFailAction(err.message));
    return { error: err.message };
  }
};
