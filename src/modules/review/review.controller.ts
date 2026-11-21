import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { reviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.id;
  if (!tenantId) {
    throw new Error("You are not logged in.");
  }

  const result = await reviewService.createReviewIntoDB(tenantId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review submitted successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.id;
  if (!tenantId) {
    throw new Error("You are not logged in.");
  }

  const { id } = req.params;
  const result = await reviewService.updateReviewIntoDB(
    tenantId,
    id as string,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.id;
  if (!tenantId) {
    throw new Error("You are not logged in.");
  }

  const { id } = req.params;
  await reviewService.deleteReviewFromDB(tenantId, id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review deleted successfully",
    data: null,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.id;
  if (!tenantId) {
    throw new Error("You are not logged in.");
  }

  const result = await reviewService.getReviewsByTenantFromDB(tenantId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Tenant reviews retrieved successfully",
    data: result,
  });
});

const getMyReviewsByPropertyId = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.id;
  if (!tenantId) {
    throw new Error("You are not logged in.");
  }

  const { propertyId } = req.params;
  const result = await reviewService.getReviewsByTenantByPropertyIdFromDB(
    tenantId,
    propertyId as string
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Tenant reviews for this property retrieved successfully",
    data: result,
  });
});

const getAllReviewsByPropertyId = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user?.id;
  if (!landlordId) {
    throw new Error("You are not logged in.");
  }

  const { propertyId } = req.params;
  const result = await reviewService.getAllReviewsByPropertyIdFromDB(
    landlordId,
    propertyId as string
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property reviews retrieved successfully",
    data: result,
  });
});

export const reviewController = {
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  getMyReviewsByPropertyId,
  getAllReviewsByPropertyId,
};