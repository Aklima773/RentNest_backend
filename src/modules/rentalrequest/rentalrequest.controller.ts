import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { rentalService } from "./rentalrequest.service";


const createRentalRequest = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.id;
  const result = await rentalService.createRentalRequestIntoDB(tenantId as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental request submitted successfully",
    data: result,
  });
});

const getMyRentalRequests = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.id;
  const result = await rentalService.getTenantRentalRequestsFromDB(tenantId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental requests retrieved successfully",
    data: result,
  });
});

const getLandlordPropertyRequests = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user?.id;
  const { propertyId } = req.params;

  if (!landlordId) {
      throw new Error("You are not logged in.");
    }

    if (!propertyId) {
      throw new Error(
        "Property ID is required."
      );
    }
  const result = await rentalService.getLandlordRentalRequestsFromDB(
      landlordId,
      propertyId as string
    );
    
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property rental requests retrieved successfully",
    data: result,
  });
});

const updateRentalRequest = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.id;
  const { id } = req.params;
  const result = await rentalService.updateRentalRequestByTenant(tenantId as string, id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental request updated successfully",
    data: result,
  });
});

const updateRentalStatus = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user?.id;
  const { id } = req.params;
  const result = await rentalService.updateRentalStatusByLandlord(landlordId as string, id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental request status updated successfully",
    data: result,
  });
});

const deleteRentalRequest = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.id;
  const { id } = req.params;
  await rentalService.deleteRentalRequestByTenant(tenantId as string, id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental request deleted successfully",
    data: null,
  });
});

export const rentalController = {
  createRentalRequest,
  getMyRentalRequests,
  getLandlordPropertyRequests,
  updateRentalRequest,
  updateRentalStatus,
  deleteRentalRequest,
};