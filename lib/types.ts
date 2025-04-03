// Farcaster User Types
export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfp: {
    url: string;
  };
  profile?: {
    bio?: string;
  };
  followerCount?: number;
  followingCount?: number;
}

// Meeting Types
export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Meeting {
  id: string;
  hostFid: number;
  guestFid: number;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  recipientFid: number;
  senderFid: number;
  type: 'booking_request' | 'booking_confirmed' | 'booking_cancelled';
  meetingId?: string;
  message: string;
  read: boolean;
  createdAt: string;
}
