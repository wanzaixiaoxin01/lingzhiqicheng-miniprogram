export function decodeQueryValue(value = "") {
  const normalized = String(value);
  try {
    return decodeURIComponent(normalized);
  } catch (error) {
    return normalized;
  }
}
