export type DateFilter =
    | { mode: 'range'; from: string; to: string }
    | { mode: 'on' | 'before' | 'after'; date: string };

export interface VehicleFilter {
    id: number;
    brand: string;
    model: string;
    plate: string;
}

export interface UserFilter {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

export interface ListFilterCriteria {
    date?: DateFilter;
    vehicle?: VehicleFilter;
    jobIds?: number[];
    user?: UserFilter;
}
