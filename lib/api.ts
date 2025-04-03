import axios from 'axios';
import { FarcasterUser, Meeting, Notification, TimeSlot } from './types';

// Farcaster API base URL
const FARCASTER_API_BASE_URL = 'https://api.warpcast.com/v2';

// API client with auth headers
const apiClient = axios.create({
  baseURL: FARCASTER_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set API key from environment variable
export const setApiKey = (apiKey: string) => {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
};

// Farcaster User API
export const farcasterApi = {
  // Get user by FID
  getUserByFid: async (fid: number): Promise<FarcasterUser> => {
    try {
      const response = await apiClient.get(`/user?fid=${fid}`);
      return response.data.result.user;
    } catch (error) {
      console.error('Error fetching user by FID:', error);
      throw error;
    }
  },

  // Search users by username
  searchUsers: async (query: string): Promise<FarcasterUser[]> => {
    try {
      const response = await apiClient.get(`/user-search?q=${query}`);
      return response.data.result.users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  // Get trending users
  getTrendingUsers: async (limit = 10): Promise<FarcasterUser[]> => {
    try {
      // This is a mock implementation as Farcaster API doesn't have a trending users endpoint
      // In a real app, you might implement this differently
      const response = await apiClient.get(`/user-search?q=&limit=${limit}`);
      return response.data.result.users;
    } catch (error) {
      console.error('Error fetching trending users:', error);
      throw error;
    }
  },

  // Send a cast (notification)
  sendCast: async (text: string, parentUrl?: string): Promise<any> => {
    try {
      const payload = {
        text,
        embeds: [],
        ...(parentUrl && { parent: parentUrl }),
      };
      const response = await apiClient.post('/casts', payload);
      return response.data;
    } catch (error) {
      console.error('Error sending cast:', error);
      throw error;
    }
  },
};

// Mock Calendar API (would be replaced with real Calendly or Google Calendar API)
export const calendarApi = {
  // Get available time slots for a user
  getAvailableTimeSlots: async (userFid: number, date: string): Promise<TimeSlot[]> => {
    // Mock implementation - in a real app, this would call Calendly or Google Calendar
    const slots: TimeSlot[] = [];
    const baseDate = new Date(date);
    
    // Generate 8 time slots for the day (9 AM to 5 PM)
    for (let hour = 9; hour < 17; hour++) {
      const startTime = new Date(baseDate);
      startTime.setHours(hour, 0, 0);
      
      const endTime = new Date(baseDate);
      endTime.setHours(hour + 1, 0, 0);
      
      slots.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        available: Math.random() > 0.3, // 70% chance of being available
      });
    }
    
    return slots;
  },
  
  // Book a meeting
  bookMeeting: async (
    hostFid: number,
    guestFid: number,
    startTime: string,
    endTime: string,
    title: string,
    description?: string
  ): Promise<Meeting> => {
    // Mock implementation - in a real app, this would call Calendly or Google Calendar
    const meeting: Meeting = {
      id: `meeting-${Date.now()}`,
      hostFid,
      guestFid,
      startTime,
      endTime,
      title,
      description,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };
    
    // In a real app, you would save this to your database
    return meeting;
  },
  
  // Get meetings for a user
  getUserMeetings: async (userFid: number): Promise<Meeting[]> => {
    // Mock implementation - in a real app, this would fetch from your database
    // For demo purposes, we'll return some mock meetings
    return [
      {
        id: `meeting-${Date.now() - 100000}`,
        hostFid: userFid,
        guestFid: 1234, // Mock guest FID
        startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(), // Tomorrow + 1 hour
        title: 'Discuss Web3 Projects',
        status: 'scheduled',
        createdAt: new Date(Date.now() - 100000).toISOString(),
      },
      {
        id: `meeting-${Date.now() - 200000}`,
        hostFid: 5678, // Mock host FID
        guestFid: userFid,
        startTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        endTime: new Date(Date.now() + 172800000 + 3600000).toISOString(), // Day after tomorrow + 1 hour
        title: 'Farcaster Integration Discussion',
        status: 'scheduled',
        createdAt: new Date(Date.now() - 200000).toISOString(),
      },
    ];
  },
};

// Notification API
export const notificationApi = {
  // Send a notification
  sendNotification: async (
    recipientFid: number,
    senderFid: number,
    type: 'booking_request' | 'booking_confirmed' | 'booking_cancelled',
    meetingId: string,
    message: string
  ): Promise<Notification> => {
    // Mock implementation - in a real app, this would save to your database and call Farcaster API
    const notification: Notification = {
      id: `notification-${Date.now()}`,
      recipientFid,
      senderFid,
      type,
      meetingId,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    // In a real implementation, you would also send a Farcaster cast as a notification
    try {
      await farcasterApi.sendCast(message);
    } catch (error) {
      console.error('Error sending Farcaster notification:', error);
    }
    
    return notification;
  },
  
  // Get notifications for a user
  getUserNotifications: async (userFid: number): Promise<Notification[]> => {
    // Mock implementation - in a real app, this would fetch from your database
    return [
      {
        id: `notification-${Date.now() - 100000}`,
        recipientFid: userFid,
        senderFid: 1234, // Mock sender FID
        type: 'booking_request',
        meetingId: `meeting-${Date.now() - 100000}`,
        message: 'John wants to book a meeting with you',
        read: false,
        createdAt: new Date(Date.now() - 100000).toISOString(),
      },
      {
        id: `notification-${Date.now() - 200000}`,
        recipientFid: userFid,
        senderFid: 5678, // Mock sender FID
        type: 'booking_confirmed',
        meetingId: `meeting-${Date.now() - 200000}`,
        message: 'Your meeting with Alice has been confirmed',
        read: true,
        createdAt: new Date(Date.now() - 200000).toISOString(),
      },
    ];
  },
  
  // Mark a notification as read
  markNotificationAsRead: async (notificationId: string): Promise<void> => {
    // Mock implementation - in a real app, this would update your database
    console.log(`Marking notification ${notificationId} as read`);
  },
};
