export interface ICreateReviewRequest {
  rentalRequestId: string;
  rating: number; // e.g., 1 to 5
  comment: string;
}

export interface IUpdateReviewRequest {
  rating?: number;
  comment?: string;
}