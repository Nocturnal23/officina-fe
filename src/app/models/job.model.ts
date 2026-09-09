export interface JobRequest {
    type: string,
    description: string
}

export interface JobResponse {
    id: number,
    type: string,
    description: string
}