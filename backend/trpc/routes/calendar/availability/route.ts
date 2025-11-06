import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export const calendarAvailabilityProcedure = publicProcedure
  .input(
    z.object({
      year: z.number().optional(),
      month: z.number().min(0).max(11).optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const now = new Date();
    const year = input.year ?? now.getFullYear();
    const month = input.month ?? now.getMonth();

    return {
      year,
      month,
      message: "Calendar data fetched successfully",
      note: "This is a public endpoint. Calendar bookings are stored client-side in AsyncStorage. To enable server-side storage, implement database integration here.",
    };
  });
