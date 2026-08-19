/**
 * Utility functions for AstroSync prototype
 */

export function encodeBase64Data<T>(data: T): string {
  try {
    const jsonString = JSON.stringify(data);
    // Safe UTF-8 to Base64 encoding
    return btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (_, p1) => 
      String.fromCharCode(parseInt(p1, 16))
    ));
  } catch (err) {
    console.error('Base64 encoding error:', err);
    return '';
  }
}

export function decodeBase64Data<T>(encoded: string): T | null {
  try {
    // Safe Base64 to UTF-8 decoding
    const decodedJson = decodeURIComponent(
      Array.prototype.map.call(atob(encoded), (c: string) => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
    return JSON.parse(decodedJson) as T;
  } catch (err) {
    console.error('Base64 decoding error:', err);
    return null;
  }
}
