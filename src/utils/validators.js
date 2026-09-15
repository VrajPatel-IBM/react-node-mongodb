const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^\d{10}$/;
const ZIP_REGEX = /^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/;

export function isRequired(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidEmail(value) {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidMobile(value) {
  return MOBILE_REGEX.test(value.trim());
}

export function isValidZip(value) {
  return ZIP_REGEX.test(value.trim());
}
