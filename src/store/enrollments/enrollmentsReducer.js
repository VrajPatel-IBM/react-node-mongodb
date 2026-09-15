// Reducer for enrollments slice

import {
  ENROLLMENTS_FETCH_START,
  ENROLLMENTS_FETCH_SUCCESS,
  ENROLLMENTS_FETCH_FAIL,
  ENROLLMENTS_PLACE_START,
  ENROLLMENTS_PLACE_SUCCESS,
  ENROLLMENTS_PLACE_FAIL,
  ENROLLMENTS_SET_CURRENT,
  ENROLLMENTS_CLEAR_CURRENT,
} from './enrollmentsActionTypes';

export const enrollmentsInitialState = {
  items: [],
  currentEnrollment: null,
  loading: false,
  error: null,
};

export function enrollmentsReducer(state = enrollmentsInitialState, action) {
  switch (action.type) {
    case ENROLLMENTS_FETCH_START:
    case ENROLLMENTS_PLACE_START:
      return { ...state, loading: true, error: null };

    case ENROLLMENTS_FETCH_SUCCESS:
      return { ...state, loading: false, items: action.payload, error: null };

    case ENROLLMENTS_FETCH_FAIL:
      return { ...state, loading: false, error: action.payload };

    case ENROLLMENTS_PLACE_SUCCESS:
      return {
        ...state,
        loading: false,
        items: [action.payload, ...state.items],
        currentEnrollment: action.payload,
        error: null,
      };

    case ENROLLMENTS_PLACE_FAIL:
      return { ...state, loading: false, error: action.payload };

    case ENROLLMENTS_SET_CURRENT:
      return { ...state, currentEnrollment: action.payload };

    case ENROLLMENTS_CLEAR_CURRENT:
      return { ...state, currentEnrollment: null };

    default:
      return state;
  }
}
