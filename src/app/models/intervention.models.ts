import { BookingStatus } from "./booking.model";

export interface InterventionHistoryRequest {
    cost?: number | null;
    notes?: string | null;
    customerNotes?: string | null;
    completedAt?: string;
    interventionKilometers: number;
    jobsIds: number[] | null;
    bookingId: number | null;
    status: BookingStatus;
}

export interface InterventionHistoryResponse {
    id: number;
    interventionKilometers: number | null;
    cost: number;
    notes: string;
    customerNotes: string | null;
    completedAt: string;
    vehicleId: number;
    bookingId: number | null;
    jobsIds: number[];
    status: BookingStatus;
}