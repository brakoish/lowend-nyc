// Google Analytics 4 Configuration
// Add your GA4 Measurement ID here

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Type for gtag function
type GtagFunction = (
  command: string,
  ...args: (string | number | Record<string, unknown>)[]
) => void;

interface WindowWithGtag {
  gtag?: GtagFunction;
}

// Log page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined') {
    const w = window as unknown as WindowWithGtag;
    if (w.gtag) {
      w.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
      });
    }
  }
};

// Log specific events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined') {
    const w = window as unknown as WindowWithGtag;
    if (w.gtag) {
      w.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }
};

// Track article reads
export const trackArticleRead = (slug: string, title: string) => {
  event({
    action: 'article_read',
    category: 'engagement',
    label: `${slug} - ${title}`,
  });
};

// Track outbound links
export const trackOutboundLink = (url: string, label?: string) => {
  event({
    action: 'click',
    category: 'outbound',
    label: label || url,
  });
};

// Track ticket link clicks
export const trackTicketClick = (venue: string, eventTitle: string) => {
  event({
    action: 'ticket_click',
    category: 'conversion',
    label: `${venue} - ${eventTitle}`,
  });
};
