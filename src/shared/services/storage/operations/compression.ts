// Compression utilities for storage
// Single Responsibility: Data compression and decompression

export class CompressionUtils {
  async compress(data: string): Promise<string> {
    // Simple compression using browser's built-in compression
    try {
      const stream = new CompressionStream("gzip");
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(new TextEncoder().encode(data));
      writer.close();

      const compressed = await reader.read();
      return btoa(String.fromCharCode(...new Uint8Array(compressed.value!)));
    } catch {
      // Fallback: return original data if compression fails
      return data;
    }
  }

  async tryDecompress(data: string): Promise<string> {
    try {
      // Try to decompress first
      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const stream = new DecompressionStream("gzip");
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(bytes);
      writer.close();

      const decompressed = await reader.read();
      return new TextDecoder().decode(decompressed.value!);
    } catch {
      // If decompression fails, return original data
      return data;
    }
  }
}
