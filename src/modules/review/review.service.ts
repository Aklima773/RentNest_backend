import { prisma } from "../../lib/prisma";
import { ICreateReviewRequest, IUpdateReviewRequest } from "./review.interface";

// 1. Tenant creates a review for a completed rental
const createReviewIntoDB = async (tenantId: string, payload: ICreateReviewRequest) => {
    
  const { rentalRequestId, rating, comment } = payload;

  // Check if rental request exists and belongs to this tenant
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: true,
     },
  });

  if (!rentalRequest) {
    throw new Error("Rental request not found.");
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new Error("You are not authorized to review this rental.");
  }

  // Ensure rental is completed
  if (rentalRequest.status !== "completed") {
    throw new Error("You can only leave a review after the rental is completed.");
  }

  // Check if a review already exists for this rental request
  const existingReview = await prisma.review.findFirst({
    where: { rentalRequestId },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this rental.");
  }

  // Create the review
  const review = await prisma.review.create({
    data: {
      rating,
      comment,
      rentalRequestId,
      propertyId: rentalRequest.propertyId,
      tenantId,
    },
    include: {
      property: true,
      tenant: {
        select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile: true, // Includes tenant profile data
      },
      }
    },
  });

  return review;
};


const getReviewsByTenantFromDB = async (tenantId: string) => {
  const reviews = await prisma.review.findMany({
    where: { tenantId },
    include: {
      property: {
        include: {
          category: true,
        },
      },
      rentalRequest: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

const getReviewsByTenantBypropertyIdFromDB = async (tenantId: string, propertyId: string) => {
  
    const reviews = await prisma.review.findMany({
    where: { tenantId,
        propertyId
     },
    include: {
      property: {
        include: {
          category: true,
        },
      },
      rentalRequest: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!reviews || reviews.length === 0) {
    throw new Error("No reviews found for this property by this tenant.");
  }

  return reviews;
};
// 2. Tenant updates their review
const updateReviewIntoDB = async (tenantId: string, reviewId: string, payload: IUpdateReviewRequest) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found.");
  }

  if (review.tenantId !== tenantId) {
    throw new Error("You are not authorized to update this review.");
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: payload,
  });

  return updatedReview;
};

// 3. Tenant deletes their review
const deleteReviewFromDB = async (tenantId: string, reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found.");
  }

  if (review.tenantId !== tenantId) {
    throw new Error("You are not authorized to delete this review.");
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  return null;
};

// 4. Landlord views their rental history and associated reviews/tenants
const getLandlordPropertyReviewsFromDB = async (landlordId: string) => {
  const properties = await prisma.property.findMany({
    where: { landlordId },
    include: {
      rentalRequests: {
        where: { status: "completed" },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true,
            },
          },
          review: true, // Includes the review left for this completed rental
          payment: true,
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  return properties;
};
const getAllReviewsByPropertyIdFromDB = async (landlordId: string, propertyId: string) => {
  // 1. Verify that the property exists and belongs to this landlord
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      landlordId,
    },
  });

  if (!property) {
    throw new Error("Property not found or you are not authorized to view it.");
  }

  // 2. Fetch all reviews for this specific property directly from the Review model (cleaner and more direct)
  const reviews = await prisma.review.findMany({
    where: {
      propertyId,
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profile: true,
        },
      },
      rentalRequest: {
        include: {
          payment: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    property,
    totalReviews: reviews.length,
    reviews,
  };
};

export const reviewService = {
  createReviewIntoDB,
  updateReviewIntoDB,
  deleteReviewFromDB,
  getLandlordPropertyReviewsFromDB,
  getReviewsByTenantFromDB,
  getReviewsByTenantBypropertyIdFromDB,
  getAllReviewsByPropertyIdFromDB
};