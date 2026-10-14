import { BookingStatus } from "./booking.model";

export interface InterventionHistoryRequest{
    cost?: number | null;
    notes?: string | null;
    completedAt?: string;
    jobsIds: number[] | null;
    bookingId: number;
    status: BookingStatus;
}

export interface InterventionCompletionRequest {
    intervention: InterventionHistoryRequest;
    vehicleKilometers: number;
}

export interface InterventionHistoryResponse{
    id: number;
    kilometers: number;
    cost: number;
    notes: string;
    completedAt: string;
    vehicleId: number;
    bookingId: number;
    jobsIds: number[];
    status: BookingStatus;    
}