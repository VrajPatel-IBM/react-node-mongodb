// All selector functions for the courses slice

export const selectCourses = (state) => state.courses.items;
export const selectCoursesTotal = (state) => state.courses.total;
export const selectCoursesLoading = (state) => state.courses.loading;
export const selectCoursesLoadingMore = (state) => state.courses.loadingMore;
export const selectCoursesError = (state) => state.courses.error;
export const selectCoursesMoreError = (state) => state.courses.moreError;
export const selectCategory = (state) => state.courses.category;
export const selectSearchQuery = (state) => state.courses.searchQuery;
export const selectCategories = (state) => state.courses.categories;

// Detail selectors
export const selectCourseDetail = (state) => state.courses.detailCourse;
export const selectRelatedCourses = (state) => state.courses.relatedCourses;
export const selectDetailLoading = (state) => state.courses.detailLoading;
export const selectDetailError = (state) => state.courses.detailError;

// Search selectors
export const selectSearchResults = (state) => state.courses.searchResults;
export const selectSearchLoading = (state) => state.courses.searchLoading;
export const selectSearchError = (state) => state.courses.searchError;

// Custom courses (admin-added)
export const selectCustomCourses = (state) => state.courses.customCourses;
