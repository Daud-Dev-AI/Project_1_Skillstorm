/**
 * Utility for logging user activities to localStorage
 * Maintains a history of recent inventory operations
 */

const MAX_ACTIVITIES = 50; // Keep last 50 activities

/**
 * Log an activity to localStorage
 * @param {Object} activity - Activity details
 * @param {string} activity.type - Type of activity (CREATED, STOCK_ADDED, TRANSFERRED, UPDATED, DELETED)
 * @param {string} activity.itemName - Name of the item
 * @param {string} activity.description - Description of the activity
 * @param {string} activity.warehouse - Warehouse name
 */
export const logActivity = (activity) => {
  try {
    const activities = getRecentActivity();

    const newActivity = {
      ...activity,
      timestamp: new Date().toISOString(),
    };

    // Add to beginning of array (most recent first)
    activities.unshift(newActivity);

    // Keep only the last MAX_ACTIVITIES
    const trimmedActivities = activities.slice(0, MAX_ACTIVITIES);

    localStorage.setItem('recentActivity', JSON.stringify(trimmedActivities));
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

/**
 * Get recent activities from localStorage
 * @returns {Array} Array of recent activities
 */
export const getRecentActivity = () => {
  try {
    const activity = localStorage.getItem('recentActivity');
    return activity ? JSON.parse(activity) : [];
  } catch (error) {
    console.error('Failed to get recent activity:', error);
    return [];
  }
};

/**
 * Clear all activities from localStorage
 */
export const clearActivity = () => {
  try {
    localStorage.removeItem('recentActivity');
  } catch (error) {
    console.error('Failed to clear activity:', error);
  }
};
