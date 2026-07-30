export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const randomVal = (Math.random() * 16) | 0;
    const hexVal = char === 'x' ? randomVal : (randomVal & 0x3) | 0x8;
    return hexVal.toString(16);
  });
}
