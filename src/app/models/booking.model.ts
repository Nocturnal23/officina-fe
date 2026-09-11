export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface BookingRequest {
    appointmentDate: string;
    jobsIds: number[] | null; //TODO: Da rivedere.
    notes?: string;
}

export interface BookingResponse {
    id: number;
    status: BookingStatus;
    notes: string | null;
    vehicleId: number;
    userId: number;
    jobsIds: number[];
    appointmentDate: string;
}