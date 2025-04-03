"use client";

import { FarcasterUser } from "@/lib/types";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import Image from "next/image";
import { useState } from "react";
import BookingModal from "./booking-modal";

interface UserCardProps {
  user: FarcasterUser;
  currentUserFid?: number;
}

export default function UserCard({ user, currentUserFid }: UserCardProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <>
      <Card className="w-full hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center gap-4 p-4">
          <div className="relative h-12 w-12 rounded-full overflow-hidden">
            <Image
              src={user.pfp?.url || "/placeholder-avatar.png"}
              alt={user.displayName || user.username}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-lg">{user.displayName}</h3>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {user.profile?.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {user.profile.bio}
            </p>
          )}
          <div className="flex gap-4 mt-2 text-sm">
            <span>{user.followerCount || 0} followers</span>
            <span>{user.followingCount || 0} following</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button 
            onClick={() => setIsBookingModalOpen(true)}
            variant="default"
            className="w-full"
            disabled={!currentUserFid || currentUserFid === user.fid}
          >
            {!currentUserFid 
              ? "Connect to book" 
              : currentUserFid === user.fid 
                ? "Cannot book yourself" 
                : "Book Meeting"}
          </Button>
        </CardFooter>
      </Card>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        host={user}
        guestFid={currentUserFid}
      />
    </>
  );
}
