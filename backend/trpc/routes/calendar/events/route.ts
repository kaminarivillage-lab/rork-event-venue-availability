import { publicProcedure } from "../../../create-context";
import { z } from "zod";

const EventTimelineSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  description: z.string().optional(),
});

const MeetingDetailsSchema = z.object({
  meetingTime: z.string(),
});

const PaymentInfoSchema = z.object({
  status: z.enum(['pending', 'received']),
  dateReceived: z.string().optional(),
  method: z.enum(['cash', 'bank']).optional(),
});

const CommissionPaymentInfoSchema = z.object({
  status: z.enum(['pending', 'paid']),
  datePaid: z.string().optional(),
});

const EventFinancialsSchema = z.object({
  venueRentalFee: z.number(),
  incomeFromExtras: z.number(),
  costs: z.number(),
  plannerCommission: z.number().optional(),
  plannerCommissionPercentage: z.number().optional(),
  plannerId: z.string().optional(),
  payment: PaymentInfoSchema,
  commissionPayment: CommissionPaymentInfoSchema.optional(),
});

const VenueEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  eventType: z.enum(['wedding', 'baptism', 'kids-party', 'corporate-dinner', 'meetings', 'other']),
  weddingCategory: z.enum(['reception', 'ceremony-reception', 'prep-reception', 'prep-ceremony-reception']).optional(),
  timeline: EventTimelineSchema.optional(),
  meetingDetails: MeetingDetailsSchema.optional(),
  financials: EventFinancialsSchema,
  notes: z.string().optional(),
  vendorIds: z.array(z.string()).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

type VenueEvent = z.infer<typeof VenueEventSchema>;

let eventsStore: Record<string, VenueEvent> = {};

export const getEventsProcedure = publicProcedure.query(() => {
  return {
    events: eventsStore,
  };
});

export const addEventProcedure = publicProcedure
  .input(VenueEventSchema)
  .mutation(({ input }) => {
    eventsStore[input.id] = input;
    return { success: true, event: input };
  });

export const updateEventProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    updates: VenueEventSchema.partial(),
  }))
  .mutation(({ input }) => {
    const existing = eventsStore[input.id];
    if (!existing) {
      throw new Error('Event not found');
    }
    
    eventsStore[input.id] = {
      ...existing,
      ...input.updates,
      updatedAt: Date.now(),
    };
    
    return { success: true, event: eventsStore[input.id] };
  });

export const deleteEventProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    if (!eventsStore[input.id]) {
      throw new Error('Event not found');
    }
    
    delete eventsStore[input.id];
    return { success: true };
  });
