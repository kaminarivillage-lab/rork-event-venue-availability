import { publicProcedure } from "../../../create-context";
import { z } from "zod";

const DateBookingSchema = z.object({
  date: z.string(),
  status: z.enum(['available', 'on-hold', 'booked']),
  setAt: z.number(),
  note: z.string().optional(),
  eventId: z.string().optional(),
  plannerId: z.string().optional(),
  customHoldDays: z.number().optional(),
});

type DateBooking = z.infer<typeof DateBookingSchema>;

let bookingsStore: Record<string, DateBooking> = {};
let holdDuration = 7 * 24 * 60 * 60 * 1000;

export const getBookingsProcedure = publicProcedure.query(() => {
  const now = Date.now();
  const activeBookings: Record<string, DateBooking> = {};
  
  Object.entries(bookingsStore).forEach(([date, booking]) => {
    if (booking.status === 'on-hold') {
      const duration = booking.customHoldDays 
        ? booking.customHoldDays * 24 * 60 * 60 * 1000 
        : holdDuration;
      const expiresAt = booking.setAt + duration;
      if (now <= expiresAt) {
        activeBookings[date] = booking;
      }
    } else if (booking.status === 'booked') {
      activeBookings[date] = booking;
    }
  });
  
  return {
    bookings: activeBookings,
    holdDuration,
  };
});

export const setBookingProcedure = publicProcedure
  .input(DateBookingSchema)
  .mutation(({ input }) => {
    if (input.status === 'available') {
      delete bookingsStore[input.date];
    } else {
      bookingsStore[input.date] = input;
    }
    
    return { success: true, booking: input };
  });

export const updateHoldDurationProcedure = publicProcedure
  .input(z.object({ days: z.number().min(1).max(90) }))
  .mutation(({ input }) => {
    holdDuration = input.days * 24 * 60 * 60 * 1000;
    return { success: true, holdDuration };
  });
