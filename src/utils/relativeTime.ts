// Relative time utility using Intl.RelativeTimeFormat
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (Math.abs(seconds) < 60) {
    return rtf.format(seconds, 'second');
  } else if (Math.abs(minutes) < 60) {
    return rtf.format(minutes, 'minute');
  } else if (Math.abs(hours) < 24) {
    return rtf.format(hours, 'hour');
  } else if (Math.abs(days) < 7) {
    return rtf.format(days, 'day');
  } else {
    // For older posts, show the actual date
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: timestamp < now - 365 * 24 * 60 * 60 * 1000 ? 'numeric' : undefined
    });
  }
}

// Alternative simple format for fallback
export function formatSimpleTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
}
