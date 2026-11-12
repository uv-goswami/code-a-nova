// Host allow-lists for submission links (spec: PPT = Drive/OneDrive, video = YouTube/Drive).
// The prototype link is intentionally unrestricted (GitHub, Figma or any live demo).
export const PPT_HOSTS = ['drive.google.com', 'docs.google.com', 'onedrive.live.com', '1drv.ms', 'sharepoint.com'];
export const VIDEO_HOSTS = ['youtube.com', 'youtu.be', 'drive.google.com'];

// true when hostname equals an allowed host or is a subdomain of it.
function hostAllowed(url: string, allowedHosts: string[]): boolean {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  return allowedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

export const isPptLink = (url: string): boolean => hostAllowed(url, PPT_HOSTS);
export const isVideoLink = (url: string): boolean => hostAllowed(url, VIDEO_HOSTS);
