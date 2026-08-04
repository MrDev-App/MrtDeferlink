export async function getClockSkewMs(apiUrl: string): Promise<number> {
  try {
    const localBefore = Date.now();
    const response = await fetch(apiUrl, { method: 'HEAD' });
    const localAfter = Date.now();
    const serverDateHeader = response.headers.get('date');
    console.log('[MrtDeferlink] serverDateHeader:', serverDateHeader);
    if (!serverDateHeader) return 0;
    const serverTime = new Date(serverDateHeader).getTime();
    console.log('[MrtDeferlink] serverTime:', serverTime);
    const localMidpoint = (localBefore + localAfter) / 2;
    console.log('[MrtDeferlink] localMidpoint:', localMidpoint);
    const diff = Math.round(localMidpoint - serverTime);
    console.log('[MrtDeferlink] diff:', diff);
    return diff;
  } catch (error) {
    console.warn('[MrtDeferlink] Clock skew fetch failed:', error);
    return 0;
  }
}
