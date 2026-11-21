
import { PaymentStatus } from "../../../prisma/generated/prisma";
import { prisma } from "../../lib/prisma";
import { ICreateReviewRequest, IUpdateReviewRequest } from "./review.interface";

// 1. Tenant creates a review only after payment status is completed
const createReviewIntoDB = async (
  tenantId: string,
  payload: ICreateReviewRequest
) => {
  const { rentalRequestId, rating, comment } = payload;

  if (!rentalRequestId) {
    throw new Error("Rental request ID is required.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be an integer between 1 and 5.");
  }

  if (!comment || typeof comment !== "string" || !comment.trim()) {
    throw new Error("Comment is required.");
  }

  // Verify rental request exists, belongs to this tenant, and payment is completed
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: {
      property: true,
      payment: true,
    },
  });

  if (!rentalRequest) {
    throw new Error("Rental request not found.");
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new Error("You are not authorized to review this rental.");
  }

  if (
    !rentalRequest.payment ||
    rentalRequest.payment.status !== PaymentStatus.completed
  ) {
    throw new Error(
      "You can only leave a review after your payment is completed."
    );
  }

  // rentalRequestId is @unique on Review
  const existingReview = await prisma.review.findUnique({
    where: { rentalRequestId },
  });

  if (existingReview) {
    throw new Error("You have already submitted a review for this rental.");
  }

  const review = await prisma.review.create({
    data: {
      propertyId: rentalRequest.propertyId,
      tenantId,
      rentalRequestId,
      rating,
      comment: comment.trim(),
    },
    include: {
      property: true,
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
  });

  return review;
};

// 2. Tenant views all their own reviews
const getReviewsByTenantFromDB = async (tenantId: string) => {
  const reviews = await prisma.review.findMany({
    where: { tenantId },
    include: {
      property: {
        include: {
          category: true,
        },
      },
      rentalRequest: {
        include: {
          payment: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

// 3. Tenant views their own reviews for a specific property
const getReviewsByTenantByPropertyIdFromDB = async (
  tenantId: string,
  propertyId: string
) => {
  const reviews = await prisma.review.findMany({
    where: {
      tenantId,
      propertyId,
    },
    include: {
      property: {
        include: {
          category: true,
        },
      },
      rentalRequest: {
        include: {
          payment: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

// 4. Tenant updates their own review (rating and/or comment)
const updateReviewIntoDB = async (
  tenantId: string,
  reviewId: string,
  payload: IUpdateReviewRequest
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      rentalRequest: {
        include: {
          payment: true,
        },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found.");
  }

  if (review.tenantId !== tenantId) {
    throw new Error("You are not authorized to update this review.");
  }

  if (
    !review.rentalRequest?.payment ||
    review.rentalRequest.payment.status !== PaymentStatus.completed
  ) {
    throw new Error("You can only edit a review for a completed payment.");
  }

  const updateData: IUpdateReviewRequest = {};

  if (payload.rating !== undefined) {
    if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) {
      throw new Error("Rating must be an integer between 1 and 5.");
    }
    updateData.rating = payload.rating;
  }

  if (payload.comment !== undefined) {
    if (typeof payload.comment !== "string" || !payload.comment.trim()) {
      throw new Error("Comment cannot be empty.");
    }
    updateData.comment = payload.comment.trim();
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("Provide at least rating or comment to update.");
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: updateData,
    include: {
      property: true,
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: true,
        },
      },
    },
  });

  return updatedReview;
};

// 5. Tenant deletes their own review
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

// 6. Landlord views reviews ONLY for a property they own (by propertyId)
const getAllReviewsByPropertyIdFromDB = async (
  landlordId: string,
  propertyId: string
) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new Error("Property not found.");
  }

  if (property.landlordId !== landlordId) {
    throw new Error("You are not authorized to view reviews for this property.");
  }

  const reviews = await prisma.review.findMany({
    where: {
      propertyId,
      property: {
        landlordId,
      },
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
  getReviewsByTenantFromDB,
  getReviewsByTenantByPropertyIdFromDB,
  getAllReviewsByPropertyIdFromDB,
};