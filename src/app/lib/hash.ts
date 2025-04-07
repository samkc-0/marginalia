export async function hash(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await window.crypto.subtle.digest('sha-1', buffer)
  const decoder = new TextDecoder('utf-8')
  const hashText = decoder.decode(hashBuffer)
  console.log(hashText)
  return hashText
}
