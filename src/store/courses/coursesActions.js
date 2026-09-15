// Action creators and async thunks for courses

import {
  COURSES_FETCH_START,
  COURSES_FETCH_MORE_START,
  COURSES_FETCH_SUCCESS,
  COURSES_FETCH_MORE_SUCCESS,
  COURSES_FETCH_FAIL,
  COURSES_FETCH_MORE_FAIL,
  COURSES_SET_CATEGORY,
  COURSES_SET_SEARCH,
  CATEGORIES_SET,
  COURSE_DETAIL_START,
  COURSE_DETAIL_SUCCESS,
  COURSE_DETAIL_FAIL,
  SEARCH_RESULTS_START,
  SEARCH_RESULTS_SUCCESS,
  SEARCH_RESULTS_FAIL,
  CUSTOM_COURSES_SET,
} from './coursesActionTypes';
import {
  fetchCourses as apiFetchCourses,
  fetchCourseById as apiFetchCourseById,
  searchCourses as apiSearchCourses,
  fetchCategories as apiFetchCategories,
  adminListCourses,
} from '../../utils/fetchClient';

export const setCategory = (category) => ({ type: COURSES_SET_CATEGORY, payload: category });
export const setSearchQuery = (query) => ({ type: COURSES_SET_SEARCH, payload: query });
export const setCategories = (categories) => ({ type: CATEGORIES_SET, payload: categories });
export const setCustomCourses = (courses) => ({ type: CUSTOM_COURSES_SET, payload: courses });

export const fetchCoursesList = (category = null, skip = 0, limit = 12) => async (dispatch) => {
  const append = skip > 0;
  dispatch({ type: append ? COURSES_FETCH_MORE_START : COURSES_FETCH_START });
  try {
    const data = await apiFetchCourses({ category, skip, limit });
    dispatch({
      type: append ? COURSES_FETCH_MORE_SUCCESS : COURSES_FETCH_SUCCESS,
      payload: data,
    });
    return data;
  } catch (err) {
    dispatch({
      type: append ? COURSES_FETCH_MORE_FAIL : COURSES_FETCH_FAIL,
      payload: err.message || 'Unable to load courses',
    });
    throw err;
  }
};

export const fetchCourseDetail = (id) => async (dispatch) => {
  dispatch({ type: COURSE_DETAIL_START });
  try {
    const { course, related } = await apiFetchCourseById(id);
    dispatch({ type: COURSE_DETAIL_SUCCESS, payload: { course, related } });
    return { course, related };
  } catch (err) {
    dispatch({ type: COURSE_DETAIL_FAIL, payload: err.message || 'Course not found' });
    throw err;
  }
};

export const searchCoursesThunk = (query) => async (dispatch) => {
  if (!query || !query.trim()) {
    dispatch({ type: SEARCH_RESULTS_SUCCESS, payload: [] });
    return [];
  }
  dispatch({ type: SEARCH_RESULTS_START });
  try {
    const { courses } = await apiSearchCourses(query.trim());
    dispatch({ type: SEARCH_RESULTS_SUCCESS, payload: courses });
    return courses;
  } catch (err) {
    dispatch({ type: SEARCH_RESULTS_FAIL, payload: err.message || 'Unable to search courses' });
    throw err;
  }
};

export const fetchCategoriesList = () => async (dispatch) => {
  const { categories } = await apiFetchCategories();
  dispatch(setCategories(categories));
  return categories;
};

export const loadCustomCourses = () => async (dispatch) => {
  const { courses } = await adminListCourses();
  dispatch(setCustomCourses(courses));
  return courses;
};
