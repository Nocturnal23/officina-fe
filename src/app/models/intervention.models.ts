import { BookingStatus } from "./booking.model";

export interface InterventionHistoryRequest {
    cost?: number | null;
    notes?: string | null;
    completedAt?: string;
    interventionKilometers: number;
    jobsIds: number[] | null;
    bookingId: number;
    status: BookingStatus;
}

export interface InterventionHistoryResponse {
    id: number;
    interventionKilometers: number | null;
    cost: number;
    notes: string;
    completedAt: string;
    vehicleId: number;
    bookingId: number;
    jobsIds: number[];
    status: BookingStatus;
}