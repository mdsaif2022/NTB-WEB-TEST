// Firebase Realtime Database Services
import { ref, set, get, remove, onValue, off, push, update, query, orderByChild, equalTo } from 'firebase/database';
import { realtimeDb } from './firebaseConfig';
import { safeFilter, isValidArray, safeGet } from './safeJsonParse';

// Database paths
const DB_PATHS = {
  TOURS: 'tours',
  BLOGS: 'blogs',
  BOOKINGS: 'bookings',
  NOTIFICATIONS: 'notifications',
  USERS: 'users',
  SETTINGS: 'settings'
};

// Tour Services
export const tourService = {
  // Get all tours
  async getAllTours() {
    console.log('tourService.getAllTours: Starting...');
    if (!realtimeDb) {
      console.warn('tourService.getAllTours: Firebase Realtime Database not available');
      return [];
    }
    
    try {
      console.log('tourService.getAllTours: Getting tours from Firebase...');
      const toursRef = ref(realtimeDb, DB_PATHS.TOURS);
      const snapshot = await get(toursRef);
      
      if (!snapshot.exists()) {
        console.log('tourService.getAllTours: No tours found in Firebase');
        return [];
      }

      const rawData = snapshot.val();
      console.log('tourService.getAllTours: Raw Firebase data:', rawData);

      // Safely extract tours from Firebase data
      const tours = isValidArray(rawData) 
        ? rawData 
        : Object.values(rawData || {});

      // Validate and filter out invalid tour objects
      const validTours = safeFilter(tours, (tour: any) => {
        return tour && 
               typeof tour === 'object' && 
               safeGet(tour, 'name', '') !== '' &&
               safeGet(tour, 'location', '') !== '';
      });

      console.log('tourService.getAllTours: Retrieved valid tours:', validTours.length);
      return validTours;
    } catch (error) {
      console.error('tourService.getAllTours: Error fetching tours:', error);
      return [];
    }
  },

  // Get tour by ID
  async getTourById(id: string) {
    if (!realtimeDb) return null;
    
    try {
      const tourRef = ref(realtimeDb, `${DB_PATHS.TOURS}/${id}`);
      const snapshot = await get(tourRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error fetching tour:', error);
      return null;
    }
  },

  // Add new tour
  async addTour(tourData: any) {
    if (!realtimeDb) return null;
    
    try {
      const toursRef = ref(realtimeDb, DB_PATHS.TOURS);
      const newTourRef = push(toursRef);
      const tourId = newTourRef.key;
      
      const tour = {
        id: tourId,
        ...tourData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await set(newTourRef, tour);
      return tour;
    } catch (error) {
      console.error('Error adding tour:', error);
      return null;
    }
  },

  // Update tour
  async updateTour(id: string, tourData: any) {
    if (!realtimeDb) return false;
    
    try {
      const tourRef = ref(realtimeDb, `${DB_PATHS.TOURS}/${id}`);
      const updates = {
        ...tourData,
        updatedAt: new Date().toISOString()
      };
      
      await update(tourRef, updates);
      return true;
    } catch (error) {
      console.error('Error updating tour:', error);
      return false;
    }
  },

  // Delete tour
  async deleteTour(id: string) {
    if (!realtimeDb) return false;
    
    try {
      const tourRef = ref(realtimeDb, `${DB_PATHS.TOURS}/${id}`);
      await remove(tourRef);
      return true;
    } catch (error) {
      console.error('Error deleting tour:', error);
      return false;
    }
  },

  // Listen to tours changes
  onToursChange(callback: (tours: any[]) => void) {
    if (!realtimeDb) return () => {};
    
    const toursRef = ref(realtimeDb, DB_PATHS.TOURS);
    const unsubscribe = onValue(toursRef, (snapshot) => {
      const tours = snapshot.exists() ? Object.values(snapshot.val()) : [];
      callback(tours);
    });
    
    return () => off(toursRef, 'value', unsubscribe);
  }
};

// Blog Services
export const blogService = {
  // Get all blogs
  async getAllBlogs() {
    console.log('blogService.getAllBlogs: Starting...');
    if (!realtimeDb) {
      console.warn('blogService.getAllBlogs: Firebase Realtime Database not available');
      return [];
    }
    
    try {
      console.log('blogService.getAllBlogs: Getting blogs from Firebase...');
      const blogsRef = ref(realtimeDb, DB_PATHS.BLOGS);
      const snapshot = await get(blogsRef);
      
      if (!snapshot.exists()) {
        console.log('blogService.getAllBlogs: No blogs found in Firebase');
        return [];
      }

      const rawData = snapshot.val();
      console.log('blogService.getAllBlogs: Raw Firebase data:', rawData);

      // Safely extract blogs from Firebase data
      const blogs = isValidArray(rawData) 
        ? rawData 
        : Object.values(rawData || {});

      // Validate and filter out invalid blog objects
      const validBlogs = safeFilter(blogs, (blog: any) => {
        return blog && 
               typeof blog === 'object' && 
               safeGet(blog, 'title', '') !== '' &&
               safeGet(blog, 'author.name', '') !== '';
      });

      console.log('blogService.getAllBlogs: Valid blogs found:', validBlogs.length);
      return validBlogs;
    } catch (error) {
      console.error('blogService.getAllBlogs: Error fetching blogs:', error);
      return [];
    }
  },

  // Get blog by ID
  async getBlogById(id: string) {
    if (!realtimeDb) return null;
    
    try {
      const blogRef = ref(realtimeDb, `${DB_PATHS.BLOGS}/${id}`);
      const snapshot = await get(blogRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error fetching blog:', error);
      return null;
    }
  },

  // Add new blog
  async addBlog(blogData: any) {
    if (!realtimeDb) return null;
    
    try {
      const blogsRef = ref(realtimeDb, DB_PATHS.BLOGS);
      const newBlogRef = push(blogsRef);
      const blogId = newBlogRef.key;
      
      const blog = {
        id: blogId,
        ...blogData,
        status: 'pending', // Default status
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await set(newBlogRef, blog);
      return blog;
    } catch (error) {
      console.error('Error adding blog:', error);
      return null;
    }
  },

  // Update blog
  async updateBlog(id: string, blogData: any) {
    if (!realtimeDb) return false;
    
    try {
      const blogRef = ref(realtimeDb, `${DB_PATHS.BLOGS}/${id}`);
      const updates = {
        ...blogData,
        updatedAt: new Date().toISOString()
      };
      
      await update(blogRef, updates);
      return true;
    } catch (error) {
      console.error('Error updating blog:', error);
      return false;
    }
  },

  // Delete blog
  async deleteBlog(id: string) {
    if (!realtimeDb) return false;
    
    try {
      const blogRef = ref(realtimeDb, `${DB_PATHS.BLOGS}/${id}`);
      await remove(blogRef);
      return true;
    } catch (error) {
      console.error('Error deleting blog:', error);
      return false;
    }
  },

  // Approve blog
  async approveBlog(id: string) {
    return this.updateBlog(id, { status: 'approved' });
  },

  // Reject blog
  async rejectBlog(id: string) {
    return this.updateBlog(id, { status: 'rejected' });
  },

  // Listen to blogs changes
  onBlogsChange(callback: (blogs: any[]) => void) {
    if (!realtimeDb) return () => {};
    
    const blogsRef = ref(realtimeDb, DB_PATHS.BLOGS);
    const unsubscribe = onValue(blogsRef, (snapshot) => {
      const blogs = snapshot.exists() ? Object.values(snapshot.val()) : [];
      callback(blogs);
    });
    
    return () => off(blogsRef, 'value', unsubscribe);
  }
};

// Booking Services
export const bookingService = {
  // Get all bookings
  async getAllBookings() {
    if (!realtimeDb) return [];
    
    try {
      const bookingsRef = ref(realtimeDb, DB_PATHS.BOOKINGS);
      const snapshot = await get(bookingsRef);
      return snapshot.exists() ? Object.values(snapshot.val()) : [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  },

  // Get booking by ID
  async getBookingById(id: string) {
    if (!realtimeDb) return null;
    
    try {
      const bookingRef = ref(realtimeDb, `${DB_PATHS.BOOKINGS}/${id}`);
      const snapshot = await get(bookingRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error fetching booking:', error);
      return null;
    }
  },

  // Helper function to remove undefined values from an object
  removeUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefinedValues(item));
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.removeUndefinedValues(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  },

  // Add new booking
  async addBooking(bookingData: any) {
    if (!realtimeDb) {
      console.error('bookingService.addBooking: Firebase Realtime Database not available');
      return null;
    }
    
    try {
      console.log('bookingService.addBooking: Starting to add booking...');
      console.log('bookingService.addBooking: Booking data:', bookingData);
      
      const bookingsRef = ref(realtimeDb, DB_PATHS.BOOKINGS);
      const newBookingRef = push(bookingsRef);
      const bookingId = newBookingRef.key;
      
      const booking = {
        id: bookingId,
        ...bookingData,
        status: 'pending', // Default status
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Remove undefined values to prevent Firebase errors
      const cleanedBooking = this.removeUndefinedValues(booking);
      
      console.log('bookingService.addBooking: Attempting to write booking:', cleanedBooking);
      await set(newBookingRef, cleanedBooking);
      console.log('bookingService.addBooking: Booking added successfully');
      return cleanedBooking;
    } catch (error) {
      console.error('bookingService.addBooking: Error adding booking:', error);
      console.error('bookingService.addBooking: Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      return null;
    }
  },

  // Update booking
  async updateBooking(id: string, bookingData: any) {
    if (!realtimeDb) return false;
    
    try {
      const bookingRef = ref(realtimeDb, `${DB_PATHS.BOOKINGS}/${id}`);
      const updates = {
        ...bookingData,
        updatedAt: new Date().toISOString()
      };
      
      // Remove undefined values to prevent Firebase errors
      const cleanedUpdates = this.removeUndefinedValues(updates);
      
      await update(bookingRef, cleanedUpdates);
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      return false;
    }
  },

  // Delete booking
  async deleteBooking(id: string) {
    if (!realtimeDb) return false;
    
    try {
      const bookingRef = ref(realtimeDb, `${DB_PATHS.BOOKINGS}/${id}`);
      await remove(bookingRef);
      return true;
    } catch (error) {
      console.error('Error deleting booking:', error);
      return false;
    }
  },

  // Approve booking
  async approveBooking(id: string) {
    return this.updateBooking(id, { status: 'approved' });
  },

  // Reject booking
  async rejectBooking(id: string) {
    return this.updateBooking(id, { status: 'rejected' });
  },

  // Listen to bookings changes
  onBookingsChange(callback: (bookings: any[]) => void) {
    if (!realtimeDb) return () => {};
    
    const bookingsRef = ref(realtimeDb, DB_PATHS.BOOKINGS);
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const bookings = snapshot.exists() ? Object.values(snapshot.val()) : [];
      callback(bookings);
    });
    
    return () => off(bookingsRef, 'value', unsubscribe);
  }
};

// Notification Services
export const notificationService = {
  // Get all notifications
  async getAllNotifications() {
    if (!realtimeDb) return [];
    
    try {
      const notificationsRef = ref(realtimeDb, DB_PATHS.NOTIFICATIONS);
      const snapshot = await get(notificationsRef);
      return snapshot.exists() ? Object.values(snapshot.val()) : [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Get notifications for user
  async getUserNotifications(userId: string) {
    if (!realtimeDb) return [];
    
    try {
      const notificationsRef = ref(realtimeDb, DB_PATHS.NOTIFICATIONS);
      
      // Try indexed query first
      try {
        const userNotificationsQuery = query(notificationsRef, orderByChild('userId'), equalTo(userId));
        const snapshot = await get(userNotificationsQuery);
        return snapshot.exists() ? Object.values(snapshot.val()) : [];
      } catch (indexError) {
        console.warn('Indexed query failed, falling back to full fetch:', indexError);
        
        // Fallback: fetch all notifications and filter client-side
        const snapshot = await get(notificationsRef);
        if (snapshot.exists()) {
          const allNotifications = Object.values(snapshot.val());
          return allNotifications.filter((notification: any) => notification.userId === userId);
        }
        return [];
      }
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  },

  // Add notification
  async addNotification(notificationData: any) {
    if (!realtimeDb) return null;
    
    try {
      const notificationsRef = ref(realtimeDb, DB_PATHS.NOTIFICATIONS);
      const newNotificationRef = push(notificationsRef);
      const notificationId = newNotificationRef.key;
      
      const notification = {
        id: notificationId,
        ...notificationData,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      await set(newNotificationRef, notification);
      return notification;
    } catch (error) {
      console.error('Error adding notification:', error);
      return null;
    }
  },

  // Mark notification as read
  async markAsRead(id: string) {
    if (!realtimeDb) return false;
    
    try {
      const notificationRef = ref(realtimeDb, `${DB_PATHS.NOTIFICATIONS}/${id}`);
      await update(notificationRef, { read: true });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  // Delete notification
  async deleteNotification(id: string) {
    if (!realtimeDb) return false;
    
    try {
      const notificationRef = ref(realtimeDb, `${DB_PATHS.NOTIFICATIONS}/${id}`);
      await remove(notificationRef);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },

  // Listen to notifications changes
  onNotificationsChange(callback: (notifications: any[]) => void) {
    if (!realtimeDb) return () => {};
    
    const notificationsRef = ref(realtimeDb, DB_PATHS.NOTIFICATIONS);
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const notifications = snapshot.exists() ? Object.values(snapshot.val()) : [];
      callback(notifications);
    });
    
    return () => off(notificationsRef, 'value', unsubscribe);
  },

  // Listen to user notifications changes
  onUserNotificationsChange(userId: string, callback: (notifications: any[]) => void) {
    if (!realtimeDb) return () => {};
    
    const notificationsRef = ref(realtimeDb, DB_PATHS.NOTIFICATIONS);
    
    // Try indexed query first
    try {
      const userNotificationsQuery = query(notificationsRef, orderByChild('userId'), equalTo(userId));
      const unsubscribe = onValue(userNotificationsQuery, (snapshot) => {
        const notifications = snapshot.exists() ? Object.values(snapshot.val()) : [];
        callback(notifications);
      });
      
      return () => off(userNotificationsQuery, 'value', unsubscribe);
    } catch (indexError) {
      console.warn('Indexed listener failed, falling back to full listener:', indexError);
      
      // Fallback: listen to all notifications and filter client-side
      const unsubscribe = onValue(notificationsRef, (snapshot) => {
        if (snapshot.exists()) {
          const allNotifications = Object.values(snapshot.val());
          const userNotifications = allNotifications.filter((notification: any) => notification.userId === userId);
          callback(userNotifications);
        } else {
          callback([]);
        }
      });
      
      return () => off(notificationsRef, 'value', unsubscribe);
    }
  }
};

// Settings Services
export const settingsService = {
  // Get settings
  async getSettings() {
    if (!realtimeDb) return null;
    
    try {
      const settingsRef = ref(realtimeDb, DB_PATHS.SETTINGS);
      const snapshot = await get(settingsRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  },

  // Update settings
  async updateSettings(settingsData: any) {
    if (!realtimeDb) return false;
    
    try {
      const settingsRef = ref(realtimeDb, DB_PATHS.SETTINGS);
      await set(settingsRef, {
        ...settingsData,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  },

  // Listen to settings changes
  onSettingsChange(callback: (settings: any) => void) {
    if (!realtimeDb) return () => {};
    
    const settingsRef = ref(realtimeDb, DB_PATHS.SETTINGS);
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const settings = snapshot.exists() ? snapshot.val() : null;
      callback(settings);
    });
    
    return () => off(settingsRef, 'value', unsubscribe);
  }
};

export { DB_PATHS };
