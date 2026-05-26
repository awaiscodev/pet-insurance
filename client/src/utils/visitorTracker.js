import api from "../api";

let trackingPromise = null;

const getDeviceType = () => {
  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad/.test(ua)) return "Tablet";
  if (/mobile|iphone|android/.test(ua)) return "Mobile";
  return "Desktop";
};

const getOS = () => {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "MacOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Linux")) return "Linux";
  return "Unknown";
};

const getBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown";
};

export const collectVisitorData = () => ({
  referrer: document.referrer || "",
  deviceType: getDeviceType(),
  os: getOS(),
  browser: getBrowser(),
  userSystemTime: new Date().toLocaleString(),
  userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
  tzOffsetMin: new Date().getTimezoneOffset(),
  userAgent: navigator.userAgent,
  language: navigator.language,
  platform: navigator.platform,
  screen: `${window.screen.width}x${window.screen.height}`,
  availableScreen: `${window.screen.availWidth}x${window.screen.availHeight}`,
  colorDepth: window.screen.colorDepth,
  pixelDepth: window.screen.pixelDepth,
  page: window.location.href,
});

export const trackVisitorOnce = async () => {
  if (trackingPromise) return trackingPromise;

  trackingPromise = api.post("/track-visitor", collectVisitorData()).then((res) => {
    localStorage.setItem("visitorData", JSON.stringify(res.data.visitorData));
    return res.data.visitorData;
  });

  return trackingPromise;
};

export const getVisitorDataForLead = async () => {
  const saved = localStorage.getItem("visitorData");

  if (saved) {
    return JSON.parse(saved);
  }

  return await trackVisitorOnce();
};