// Selectors for auth state

export const selectAuthUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.user !== null;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
