import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { calendarAvailabilityProcedure } from "./routes/calendar/availability/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  calendar: createTRPCRouter({
    availability: calendarAvailabilityProcedure,
  }),
});

export type AppRouter = typeof appRouter;
