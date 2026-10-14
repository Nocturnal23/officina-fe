export interface VehicleRequest {
    brand: string;
    model: string;
    plate: string;
    kilometers: number;
}

export interface VehicleResponse {
    id: number;
    brand: string;
    model: string;
    plate: string;
    kilometers: number;
    userId: number;
}