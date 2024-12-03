import { TextEncoder, TextDecoder } from 'util'

const COMPRESSION_THRESHOLD = 1024 * 10 // 10KB

export class CompressionUtil {
  static shouldCompress(data: any): boolean {
    const size = new TextEncoder().encode(JSON.stringify(data)).length
    return size > COMPRESSION_THRESHOLD
  }

  static async compress(data: any): Promise<Uint8Array> {
    const jsonString = JSON.stringify(data)
    const textEncoder = new TextEncoder()
    const byteArray = textEncoder.encode(jsonString)
    
    // Use built-in compression stream if available
    if (typeof CompressionStream !== 'undefined') {
      const cs = new CompressionStream('gzip')
      const writer = cs.writable.getWriter()
      writer.write(byteArray)
      writer.close()
      
      const reader = cs.readable.getReader()
      const chunks: Uint8Array[] = []
      
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        chunks.push(value)
      }
      
      // Combine chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const result = new Uint8Array(totalLength)
      let offset = 0
      for (const chunk of chunks) {
        result.set(chunk, offset)
        offset += chunk.length
      }
      
      return result
    }
    
    // Fallback: return uncompressed data
    return byteArray
  }

  static async decompress(compressed: Uint8Array): Promise<any> {
    // Use built-in decompression stream if available
    if (typeof DecompressionStream !== 'undefined') {
      const ds = new DecompressionStream('gzip')
      const writer = ds.writable.getWriter()
      writer.write(compressed)
      writer.close()
      
      const reader = ds.readable.getReader()
      const chunks: Uint8Array[] = []
      
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        chunks.push(value)
      }
      
      // Combine chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const result = new Uint8Array(totalLength)
      let offset = 0
      for (const chunk of chunks) {
        result.set(chunk, offset)
        offset += chunk.length
      }
      
      const textDecoder = new TextDecoder()
      const jsonString = textDecoder.decode(result)
      return JSON.parse(jsonString)
    }
    
    // Fallback: assume uncompressed data
    const textDecoder = new TextDecoder()
    const jsonString = textDecoder.decode(compressed)
    return JSON.parse(jsonString)
  }

  static async compressIfNeeded<T>(data: T): Promise<{ compressed: boolean; data: T | Uint8Array }> {
    if (this.shouldCompress(data)) {
      return {
        compressed: true,
        data: await this.compress(data)
      }
    }
    return {
      compressed: false,
      data
    }
  }

  static async decompressIfNeeded<T>(
    result: { compressed: boolean; data: T | Uint8Array }
  ): Promise<T> {
    if (result.compressed) {
      return this.decompress(result.data as Uint8Array)
    }
    return result.data as T
  }
}
