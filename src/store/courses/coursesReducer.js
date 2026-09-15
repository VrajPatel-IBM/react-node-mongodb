// Reducer for courses feature

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

export const coursesInitialState = {
  items: [],
  total: 0,
  loading: false,
  loadingMore: false,
  error: null,
  moreError: null,
  category: null,
  searchQuery: '',
  categories: [],
  // Detail
  detailCourse: null,
  relatedCourses: [],
  detailLoading: false,
  detailError: null,
  // Search
  searchResults: [],
  searchLoading: false,
  searchError: null,
  // Admin custom courses
  customCourses: [],
};

export function coursesReducer(state = coursesInitialState, action) {
  switch (action.type) {
    case COURSES_FETCH_START:
      return { ...state, loading: true, error: null, items: [] };

    case COURSES_FETCH_MORE_START:
      return { ...state, loadingMore: true, moreError: null };

    case COURSES_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        items: action.payload.courses ?? [],
        total: action.payload.total ?? 0,
        error: null,
      };

    case COURSES_FETCH_MORE_SUCCESS:
      return {
        ...state,
        loadingMore: false,
        items: [...state.items, ...(action.payload.courses ?? [])],
        total: action.payload.total ?? state.total,
        moreError: null,
      };

    case COURSES_FETCH_FAIL:
      return { ...state, loading: false, error: action.payload };

    case COURSES_FETCH_MORE_FAIL:
      return { ...state, loadingMore: false, moreError: action.payload };

    case COURSES_SET_CATEGORY:
      return { ...state, category: action.payload };

    case COURSES_SET_SEARCH:
      return { ...state, searchQuery: action.payload };

    case CATEGORIES_SET:
      return { ...state, categories: action.payload };

    case COURSE_DETAIL_START:
      return { ...state, detailLoading: true, detailError: null, detailCourse: null, relatedCourses: [] };

    case COURSE_DETAIL_SUCCESS:
      return {
        ...state,
        detailLoading: false,
        detailCourse: action.payload.course,
        relatedCourses: action.payload.related,
        detailError: null,
      };

    case COURSE_DETAIL_FAIL:
      return { ...state, detailLoading: false, detailError: action.payload };

    case SEARCH_RESULTS_START:
      return { ...state, searchLoading: true, searchError: null };

    case SEARCH_RESULTS_SUCCESS:
      return { ...state, searchLoading: false, searchResults: action.payload, searchError: null };

    case SEARCH_RESULTS_FAIL:
      return { ...state, searchLoading: false, searchError: action.payload };

    case CUSTOM_COURSES_SET:
      return { ...state, customCourses: action.payload };

    default:
      return state;
  }
}
