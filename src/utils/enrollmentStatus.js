export const ENROLLMENT_STATUSES = ['Enrolled', 'Access Granted', 'Cohort Started', 'Completed'];

const DAY_MS = 24 * 60 * 60 * 1000;

export function getEnrollmentStatusIndex(enrollment) {
  const elapsedMs = Date.now() - new Date(enrollment.placedAt).getTime();
  if (elapsedMs >= 3 * DAY_MS) return 3;
  if (elapsedMs >= 2 * DAY_MS) return 2;
  if (elapsedMs >= 1 * DAY_MS) return 1;
  return 0;
}

export function getEnrollmentStatus(enrollment) {
  return ENROLLMENT_STATUSES[getEnrollmentStatusIndex(enrollment)];
}
