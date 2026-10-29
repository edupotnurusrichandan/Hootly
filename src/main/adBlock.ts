const BLOCKED_HOSTS = new Set([
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com', 'adnxs.com', 'adsrvr.org',
  'adform.net', 'taboola.com', 'outbrain.com', 'criteo.com', 'scorecardresearch.com',
  'hotjar.com', 'clarity.ms', 'quantserve.com', 'moatads.com', 'serving-sys.com',
  'rubiconproject.com', 'pubmatic.com', 'openx.net', 'casalemedia.com', 'adsafeprotected.com',
  'demdex.net', 'omtrdc.net', 'mixpanel.com', 'segment.io', 'amplitude.com'
]);

export function isBlockedRequestUrl(value: string): boolean {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return [...BLOCKED_HOSTS].some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}
