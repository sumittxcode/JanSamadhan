import { useState, useEffect } from 'react';

/**
 * Returns a time-of-day greeting based on the user's local clock:
 * 05:00 - 11:59: "Good morning"
 * 12:00 - 16:59: "Good afternoon"
 * 17:00 - 04:59: "Good evening"
 */
export const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
};

/**
 * Extracts a sensible display name from the user object.
 * Returns first name if available, otherwise full name, or fallback.
 */
export const getUserDisplayName = (user, fallback = 'Citizen') => {
  if (!user || !user.fullName) return fallback;
  const trimmed = user.fullName.trim();
  if (!trimmed) return fallback;
  const parts = trimmed.split(/\s+/);
  return parts[0] || trimmed;
};

/**
 * React hook that returns the current time-of-day greeting
 * and dynamically updates if the period rolls over while the page is open.
 */
export const useTimeGreeting = () => {
  const [greeting, setGreeting] = useState(getTimeGreeting);

  useEffect(() => {
    // Check every 60 seconds if greeting period changed
    const interval = setInterval(() => {
      const current = getTimeGreeting();
      setGreeting((prev) => (prev !== current ? current : prev));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return greeting;
};
