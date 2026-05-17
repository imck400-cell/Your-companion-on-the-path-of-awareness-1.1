import { localDb } from './localDb';

export const trackEvent = async (type: string, metadata: any = {}) => {
  try {
    const visitorId = localStorage.getItem('visitorId') || Math.random().toString(36).substring(7);
    localStorage.setItem('visitorId', visitorId);

    localDb.addDoc('analytics', {
      visitorId,
      type,
      timestamp: new Date().toISOString(),
      pageId: window.location.pathname,
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer,
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
  }
};
