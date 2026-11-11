import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { reviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.id;
  const result = await reviewService.createReviewIntoDB(tenantId as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review submitted successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.id;
  const { id } = req.params;
  const result = await reviewService.updateReviewIntoDB(tenantId as string, id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.id;
  const { id } = req.params;
  await reviewService.deleteReviewFromDB(tenantId as string, id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review deleted successfully",
    data: null,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.id;
  const result = await reviewService.getReviewsByTenantFromDB(tenantId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Tenant reviews retrieved successfully",
    data: result,
  });
});

const getMyReviewsbyPropertyId = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.id;
    const { id } = req.params;
  const result = await reviewService.getReviewsByTenantBypropertyIdFromDB(tenantId as string, id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Tenant reviews of his request Property retrieved successfully",
    data: result,
  });
});
const getAllReviewsbyPropertyId = catchAsync(async (req: Request, res: Response) => {
  const landlordtId = req.user?.id;
    const { id } = req.params;
  const result = await reviewService.getAllReviewsByPropertyIdFromDB(landlordtId as string, id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Landlord Properties Review Retrive successfully",
    data: result,
  });
});

const getAllReviewsByPropertyId = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user?.id;
  const { propertyId } = req.params;

  const result = await reviewService.getAllReviewsByPropertyIdFromDB(
    landlordId as string,
    propertyId as string
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property reviews retrieved successfully",
    data: result,
  });
});
const getLandlordRentalHistory = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user?.id;
  const result = await reviewService.getLandlordPropertyReviewsFromDB(landlordId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Landlord rental history and reviews retrieved successfully",
    data: result,
  });
});

export const reviewController = {
  createReview,
  updateReview,
  deleteReview,
  getLandlordRentalHistory,
  getMyReviews,
  getMyReviewsbyPropertyId,
  getAllReviewsByPropertyId
};