import type { DateStatus } from '@/constants/colors';
export type { DateStatus };

export type EventType = 'wedding' | 'baptism' | 'kids-party' | 'corporate-dinner' | 'meetings' | 'other';

export type WeddingCategory = 
  | 'reception'
  | 'ceremony-reception'
  | 'prep-reception'
  | 'prep-ceremony-reception';

export interface EventTimeline {
  startTime: string;
  endTime: string;
  description?: string;
}

export interface MeetingDetails {
  meetingTime: string;
}

export type PaymentStatus = 'pending' | 'received';
export type CommissionPaymentStatus = 'pending' | 'paid';
export type PaymentMethod = 'cash' | 'bank';

export interface PaymentInfo {
  status: PaymentStatus;
  dateReceived?: string;
  method?: PaymentMethod;
}

export interface CommissionPaymentInfo {
  status: CommissionPaymentStatus;
  datePaid?: string;
}

export interface EventFinancials {
  venueRentalFee: number;
  incomeFromExtras: number;
  costs: number;
  plannerCommission?: number;
  plannerCommissionPercentage?: number;
  plannerId?: string;
  payment: PaymentInfo;
  commissionPayment?: CommissionPaymentInfo;
}

export interface VenueEvent {
  id: string;
  name: string;
  date: string;
  eventType: EventType;
  weddingCategory?: WeddingCategory;
  timeline?: EventTimeline;
  meetingDetails?: MeetingDetails;
  financials: EventFinancials;
  notes?: string;
  vendorIds?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface DateBooking {
  date: string;
  status: DateStatus;
  setAt: number;
  note?: string;
  eventId?: string;
  plannerId?: string;
  customHoldDays?: number;
}

export type ExpenseCategory = string;

export interface CategoryItem {
  id: string;
  label: string;
  isDefault: boolean;
}

export interface VenueExpense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export type UserRole = 'admin' | 'planner';

export interface User {
  id: string;
  role: UserRole;
  plannerId?: string;
}

export interface Planner {
  id: string;
  name: string;
  companyName: string;
  email: string;
  telephone: string;
  website?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PlannerStats {
  plannerId: string;
  totalEvents: number;
  totalVenueRentalFees: number;
  totalCommissions: number;
  onHoldDates: number;
}

export interface VenueState {
  bookings: Record<string, DateBooking>;
  holdDuration: number;
  events: Record<string, VenueEvent>;
  expenses: Record<string, VenueExpense>;
  planners: Record<string, Planner>;
}
