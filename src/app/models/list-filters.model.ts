export type DateFilter =
    | { mode: 'range'; from: string; to: string }
    | { mode: 'on' | 'before' | 'after'; date: string };

export interface VehicleFilter {
    brand: string;
    model: string;
    plate?: string;
}

export interface ListFilterCriteria {
    date?: DateFilter;
    userId?: number;
    vehicle?: VehicleFilter;
    jobIds?: number[];
}
