import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { propertyService } from "./property.service";

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await propertyService.createProperty(req.body, userId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Property created successfully",
    data: result,
  });
});

const getLandlordProperties = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user?.id;
  const result = await propertyService.getLandlordPropertiesFromDB(landlordId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Landlord properties retrieved successfully",
    data: result,
  });
});

const getLandlordPropertyById = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user?.id;
  const { id } = req.params;
  
  // Call the single property lookup service function
  const result = await propertyService.getLandlordPropertiesByIdFromDB(landlordId as string, id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Landlord property by ID retrieved successfully",
    data: result,
  });
});


const updateProperty = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user?.id;
  const { id } = req.params;
  const result = await propertyService.updatePropertyIntoDB(landlordId as string, id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property updated successfully",
    data: result,
  });
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user?.id;
  const { id } = req.params;
  await propertyService.deletePropertyFromDB(landlordId as string, id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property deleted successfully",
    data: null,
  });
});

// Ensure every single one of these is defined above and exported here:
export const propertyController = {
  createProperty,
  getLandlordProperties,
  updateProperty,
  deleteProperty,
  getLandlordPropertyById
};