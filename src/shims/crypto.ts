export default globalThis.crypto
export const randomUUID = () => globalThis.crypto.randomUUID()
export const getRandomValues = (arr: any) => globalThis.crypto.getRandomValues(arr)
