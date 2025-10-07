
// See: https://developers.google.com/analytics/devguides/collection/gtagjs/events

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Log the page view with a specific URL
export const pageview = (url: string) => {
    if (!gaMeasurementId) return;
    window.gtag("event", "page_view", {
        page_path: url,
    });
};

// Log a specific event
export const event = (action: string, { ...params }: Gtag.CustomParams | Gtag.ControlParams | Gtag.EventParams) => {
    if (!gaMeasurementId) return;
    window.gtag("event", action, params);
};
