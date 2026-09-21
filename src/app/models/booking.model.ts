export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    REFUSED = 'REFUSED'
}

export interface BookingRequest {
    appointmentDate: string;
    jobsIds: number[] | null;
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

export interface BookingStatusMeta {
    label: string;
    badgeClass: string;
    next?: BookingStatus;
}

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, BookingStatusMeta> = {
    [BookingStatus.PENDING]: {
        label: 'In attesa',
        badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
        next: BookingStatus.CONFIRMED
    },
    [BookingStatus.CONFIRMED]: {
        label: 'Confermata',
        badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
        next: BookingStatus.IN_PROGRESS
    },
    [BookingStatus.IN_PROGRESS]: {
        label: 'In lavorazione',
        badgeClass: 'border-purple-200 bg-purple-50 text-purple-700',
        next: BookingStatus.COMPLETED
    },
    [BookingStatus.COMPLETED]: {
        label: 'Completato',
        badgeClass: 'border-green-200 bg-green-50 text-green-700'
    },
    [BookingStatus.REFUSED]: {
        label: 'Rifiutato',
        badgeClass: 'border-red-200 bg-red-50 text-red-700'
    }
};

export const BOOKING_TABS = Object.entries(BOOKING_STATUS_CONFIG).map(
    ([key, meta]) => ({
        key: key as BookingStatus,
        ...meta
    })
);