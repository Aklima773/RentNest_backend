export interface ICreateReviewRequest {
  rentalRequestId: string;
  rating: number; // Integer: 1 to 5
  comment: string;
}

export interface IUpdateReviewRequest {
  rating?: number; // Integer: 1 to 5
  comment?: string;
}