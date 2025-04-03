"use client";

import { useState, useEffect } from "react";
import { Meeting, FarcasterUser } from "@/lib/types";
import { calendarApi, farcasterApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { formatDateTime } from "@/lib/utils";
import Image from "next/image";

interface DashboardProps {
  currentUserFid?: number;
}

export default function Dashboard({ currentUserFid }: DashboardProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [userDetails, setUserDetails] = useState<Record<number, FarcasterUser>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUserFid) {
      fetchMeetings();
    } else {
      setIsLoading(false);
    }
  }, [currentUserFid]);

  const fetchMeetings = async () => {
    if (!currentUserFid) return;

    setIsLoading(true);
    try {
      const userMeetings = await calendarApi.getUserMeetings(currentUserFid);
      setMeetings(userMeetings);

      // Get user details for all participants
      const userFids = new Set<number>();
      userMeetings.forEach(meeting => {
        userFids.add(meeting.hostFid);
        userFids.add(meeting.guestFid);
      });

      const userDetailsMap: Record<number, FarcasterUser> = {};
      await Promise.all(
        Array.from(userFids).map(async (fid) => {
          if (fid !== currentUserFid) {
            try {
              const user = await farcasterApi.getUserByFid(fid);
              userDetailsMap[fid] = user;
            } catch (error) {
              console.error(`Error fetching user ${fid}:`, error);
            }
          }
        })
      );

      setUserDetails(userDetailsMap);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOtherParticipant = (meeting: Meeting): number => {
    return meeting.hostFid === currentUserFid ? meeting.guestFid : meeting.hostFid;
  };

  if (!currentUserFid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4">Connect your Farcaster account to view your meetings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Upcoming Meetings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading your meetings...</div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-4">You don't have any upcoming meetings</div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => {
              const otherParticipantFid = getOtherParticipant(meeting);
              const otherParticipant = userDetails[otherParticipantFid];

              return (
                <div key={meeting.id} className="flex items-center p-4 border rounded-lg">
                  {otherParticipant ? (
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden">
                        <Image
                          src={otherParticipant.pfp?.url || "/placeholder-avatar.png"}
                          alt={otherParticipant.displayName || otherParticipant.username}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{meeting.title}</h3>
                        <div className="text-sm text-muted-foreground">
                          With {otherParticipant.displayName} (@{otherParticipant.username})
                        </div>
                        <div className="text-sm mt-1">
                          {formatDateTime(meeting.startTime)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium">{meeting.title}</h3>
                      <div className="text-sm text-muted-foreground">
                        With user #{otherParticipantFid}
                      </div>
                      <div className="text-sm mt-1">
                        {formatDateTime(meeting.startTime)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
