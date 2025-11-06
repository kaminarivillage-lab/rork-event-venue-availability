import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { calendarAvailabilityProcedure } from "./routes/calendar/availability/route";
import { getBookingsProcedure, setBookingProcedure, updateHoldDurationProcedure } from "./routes/calendar/bookings/route";
import { getEventsProcedure, addEventProcedure, updateEventProcedure, deleteEventProcedure } from "./routes/calendar/events/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  calendar: createTRPCRouter({
    availability: calendarAvailabilityProcedure,
    getBookings: getBookingsProcedure,
    setBooking: setBookingProcedure,
    updateHoldDuration: updateHoldDurationProcedure,
    getEvents: getEventsProcedure,
    addEvent: addEventProcedure,
    updateEvent: updateEventProcedure,
    deleteEvent: deleteEventProcedure,
  }),
});

export type AppRouter = typeof appRouter;
