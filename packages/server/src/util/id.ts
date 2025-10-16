// ID generation utilities

// Generate a random post ID (alphanumeric)
export function generatePostId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Generate a 6-digit edit ID
export function generateEditId(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate edit ID format (exactly 6 digits)
export function isValidEditId(editId: string): boolean {
  return /^\d{6}$/.test(editId);
}

// Validate post ID format (alphanumeric)
export function isValidPostId(id: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(id);
}
