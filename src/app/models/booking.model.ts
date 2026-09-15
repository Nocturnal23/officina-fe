export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

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

export interface StatusChangeEvent {
    id: number;
    status: BookingStatus;
}