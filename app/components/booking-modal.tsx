"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { FarcasterUser, TimeSlot } from "@/lib/types";
import { calendarApi, notificationApi } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/utils";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  host: FarcasterUser;
  guestFid?: number;
}

export default function BookingModal({ isOpen, onClose, host, guestFid }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [meetingTitle, setMeetingTitle] = useState<string>(`Meeting with ${host.displayName}`);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Fetch available time slots when date changes
  useEffect(() => {
    if (isOpen && host.fid) {
      fetchTimeSlots();
    }
  }, [isOpen, selectedDate, host.fid]);

  const fetchTimeSlots = async () => {
    setIsLoading(true);
    try {
      const slots = await calendarApi.getAvailableTimeSlots(host.fid, selectedDate);
      setTimeSlots(slots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleBookMeeting = async () => {
    if (!selectedSlot || !guestFid) return;

    setIsLoading(true);
    try {
      // Book the meeting
      const meeting = await calendarApi.bookMeeting(
        host.fid,
        guestFid,
        selectedSlot.startTime,
        selectedSlot.endTime,
        meetingTitle
      );

      // Send notification to host
      await notificationApi.sendNotification(
        host.fid,
        guestFid,
        'booking_request',
        meeting.id,
        `${guestFid} wants to book a meeting with you on ${formatDate(selectedSlot.startTime)} at ${formatTime(selectedSlot.startTime)}`
      );

      setIsSuccess(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setSelectedSlot(null);
      }, 2000);
    } catch (error) {
      console.error("Error booking meeting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate date options for the next 14 days
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book a Meeting with {host.displayName}</DialogTitle>
          <DialogDescription>
            Select a date and time slot to schedule your meeting.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-6 text-center">
            <div className="text-green-500 mb-2">✓ Booking Successful!</div>
            <p>Your meeting has been scheduled and a notification has been sent.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="date" className="text-sm font-medium">
                  Select Date
                </label>
                <select
                  id="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {dateOptions.map((date) => (
                    <option key={date} value={date}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <label className="text-sm font-medium">
                  Available Time Slots
                </label>
                {isLoading ? (
                  <div className="text-center py-4">Loading time slots...</div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-4">No available time slots for this date.</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot, index) => (
                      slot.available && (
                        <Button
                          key={index}
                          variant={selectedSlot === slot ? "default" : "outline"}
                          onClick={() => handleSlotSelect(slot)}
                          className="justify-start"
                        >
                          {formatTime(slot.startTime)}
                        </Button>
                      )
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Meeting Title
                </label>
                <input
                  id="title"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleBookMeeting}
                disabled={!selectedSlot || !guestFid || isLoading}
              >
                {isLoading ? "Booking..." : "Book Meeting"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
