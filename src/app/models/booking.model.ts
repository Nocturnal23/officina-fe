export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface BookingRequest {
    notes?: string;
    jobsIds: number[];
}

export interface BookingResponse {
    id: number;
    status: BookingStatus;
    notes: string | null;
    vehicleId: number;
    userId: number;
    jobsIds: number[];
}