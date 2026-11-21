import { RequestStatus } from "../../../prisma/generated/prisma";



export interface ICreateRentalRequest {
  propertyId: string;
  startDate: string | Date;
  endDate: string | Date;
}

export interface IUpdateRentalRequest {
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface IUpdateRentalStatusRequest {
  status: RequestStatus;
}