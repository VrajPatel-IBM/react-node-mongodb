// Action creators and async thunks for the enrollments feature — persisted in MongoDB

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
import { createEnrollment, getEnrollmentByNumber, fetchEnrollmentsForEmail } from '../../utils/fetchClient';

export const enrollmentsFetchStartAction = () => ({ type: ENROLLMENTS_FETCH_START });
export const enrollmentsFetchSuccessAction = (enrollments) => ({ type: ENROLLMENTS_FETCH_SUCCESS, payload: enrollments });
export const enrollmentsFetchFailAction = (error) => ({ type: ENROLLMENTS_FETCH_FAIL, payload: error });

export const enrollmentsPlaceStartAction = () => ({ type: ENROLLMENTS_PLACE_START });
export const enrollmentsPlaceSuccessAction = (enrollment) => ({ type: ENROLLMENTS_PLACE_SUCCESS, payload: enrollment });
export const enrollmentsPlaceFailAction = (error) => ({ type: ENROLLMENTS_PLACE_FAIL, payload: error });

export const setCurrentEnrollmentAction = (enrollment) => ({ type: ENROLLMENTS_SET_CURRENT, payload: enrollment });
export const clearCurrentEnrollmentAction = () => ({ type: ENROLLMENTS_CLEAR_CURRENT });

export const placeEnrollment = (enrollment) => async (dispatch) => {
  dispatch(enrollmentsPlaceStartAction());
  try {
    const { enrollment: saved } = await createEnrollment(enrollment);
    dispatch(enrollmentsPlaceSuccessAction(saved));
    dispatch(setCurrentEnrollmentAction(saved));
    return { success: true, enrollment: saved };
  } catch (err) {
    dispatch(enrollmentsPlaceFailAction(err.message));
    return { success: false, error: err.message };
  }
};

export const lookupEnrollmentByNumber = (enrollmentNumber) => async () => {
  const result = await getEnrollmentByNumber(enrollmentNumber);
  return result ? result.enrollment : null;
};

export const fetchEnrollmentsForAccount = (email) => async (dispatch) => {
  if (!email) {
    dispatch(enrollmentsFetchSuccessAction([]));
    return [];
  }
  dispatch(enrollmentsFetchStartAction());
  try {
    const { enrollments } = await fetchEnrollmentsForEmail(email);
    dispatch(enrollmentsFetchSuccessAction(enrollments));
    return enrollments;
  } catch (err) {
    dispatch(enrollmentsFetchFailAction(err.message));
    return [];
  }
};
