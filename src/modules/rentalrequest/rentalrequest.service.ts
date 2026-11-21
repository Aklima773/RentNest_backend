import { RequestStatus } from "../../../prisma/schema/generated/prisma";
import { prisma } from "../../lib/prisma";

import { ICreateRentalRequest, IUpdateRentalRequest, IUpdateRentalStatusRequest } from "./rentalrequest.interface";

import httpStatus from "http-status";



const createRentalRequestIntoDB = async (tenantId: string, payload: ICreateRentalRequest) => {

  const { propertyId, startDate, endDate } = payload;

  // 1. Check if property exists and is available
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new Error("Property not found.");
  }

  if (!property.isAvailable) {
    throw new Error("This property is currently not available for rent.");
  }

  // 2. Prevent landlord from renting their own property
  if (property.landlordId === tenantId) {
    throw new Error("Landlords cannot submit rental requests for their own properties.");
  }

  // 3. Create rental request
  const result = await prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: RequestStatus.pending,
    },

    include: {
      property: true,
      tenant: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return result;
};

const getTenantRentalRequestsFromDB = async (tenantId: string) => {
  const result = await prisma.rentalRequest.findMany({
    where: { tenantId },
    include: {
      property: {
        include: { category: true },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getLandlordRentalRequestsFromDB = async (landlordId: string, propertyId: string) => {
 const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, landlordId: true },
  });

  if (!property) {
    throw new Error("Property not found.");
  }

  if (property.landlordId !== landlordId) {
    throw new Error(
      "You are not authorized to view rental requests for this property."
    );
  }

  // 2. Fetch all rental requests for that property
  const result = await prisma.rentalRequest.findMany({
    where: {
      propertyId,
      property: {
        landlordId,
      },
    },
    include: {
      property: true,
      tenant: {
        select: { id: true, name: true, email: true },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const updateRentalRequestByTenant = async (tenantId: string, requestId: string, payload: IUpdateRentalRequest) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
  });

  if (!rentalRequest) {
    throw new Error("Rental request not found.");
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new Error("You are not authorized to update this rental request.");
  }

  if (rentalRequest.status !== RequestStatus.pending) {
    throw new Error("You can only update pending rental requests.");
  }

  const result = await prisma.rentalRequest.update({
    where: { id: requestId },
    data: {
      startDate: payload.startDate ? new Date(payload.startDate) : undefined,
      endDate: payload.endDate ? new Date(payload.endDate) : undefined,
    },
  });

  return result;
};

const updateRentalStatusByLandlord = async (landlordId: string, requestId: string, payload: IUpdateRentalStatusRequest) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: { property: true },
  });

  if (!rentalRequest) {
    throw new Error("Rental request not found.");
  }

  if (rentalRequest.property.landlordId !== landlordId) {
    throw new Error( "You are not authorized to manage requests for this property.");
  }

  const result = await prisma.rentalRequest.update({
    where: { id: requestId },
    data: { status: payload.status },
  });

  return result;
};

const deleteRentalRequestByTenant = async (tenantId: string, requestId: string) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
  });

  if (!rentalRequest) {
    throw new Error("Rental request not found.");
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new Error("You can only delete your own rental requests.");
  }

  if (rentalRequest.status !== RequestStatus.pending) {
    throw new Error("Only pending rental requests can be deleted.");
  }

  await prisma.rentalRequest.delete({
    where: { id: requestId },
  });

  return null;
};

export const rentalService = {
  createRentalRequestIntoDB,
  getTenantRentalRequestsFromDB,
  getLandlordRentalRequestsFromDB,
  updateRentalRequestByTenant,
  updateRentalStatusByLandlord,
  deleteRentalRequestByTenant,
};