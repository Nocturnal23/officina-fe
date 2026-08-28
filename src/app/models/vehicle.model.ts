export interface VehicleRequest {
    brand: string;
    model: string;
    plate: string;
    year: number;
}

export interface VehicleResponse {
    id: number;
    brand: string;
    model: string;
    plate: string;
    year: number;
    userId: number;
}