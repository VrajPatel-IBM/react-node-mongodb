// Selectors for enrollments state

export const selectEnrollmentsList = (state) => state.enrollments.items;
export const selectCurrentEnrollment = (state) => state.enrollments.currentEnrollment;
export const selectEnrollmentsLoading = (state) => state.enrollments.loading;
export const selectEnrollmentsError = (state) => state.enrollments.error;
