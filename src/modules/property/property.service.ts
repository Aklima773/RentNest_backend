import { UserRole } from "../../../generated/prisma";
import { prisma } from "../../lib/prisma";
import { ICreatePropertyRequest, IUpdatePropertyRequest } from "./property.interface";

const createProperty = async(payload: ICreatePropertyRequest, userId : string)=>{

// Use a transaction to ensure both role upgrade and property creation succeed together

const result = await prisma.$transaction(async (tx) => {
  
    const user = await tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    // 2. If the user is currently a tenant, promote/switch their role to landlord
    if (user.role === UserRole.tenant) {
      await tx.user.update({
        where: { id: userId },
        data: { role: UserRole.landlord },
      });
    }

    // 3. Create the property listing
    const property = await tx.property.create({
      data: {
        ...payload,
        price: Number(payload.price), // Ensure compatibility with Prisma's Decimal type
        landlordId: userId,
      },
      include: {
        category: true, // Optional: return category details in response
      },
    });

    return property;
  });

  return result;
};

const getLandlordPropertiesFromDB = async (landlordId: string) => {
  const properties = await prisma.property.findMany({
    where: { landlordId },
    include: {
      category: true,
      rentalRequests: {
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              profile: true, // Includes tenant profile data
            },
          },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return properties;
};

const getLandlordPropertiesByIdFromDB = async (landlordId: string, propertyId: string) => {
  const properties = await prisma.property.findFirst({
    where: {
      id: propertyId, 
     },
    include: {
      category: true,
      rentalRequests: {
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              profile: true, // Includes tenant profile data
            },
          },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!propertyId) {
    throw new Error("Property not found.");
  }

if (landlordId !== landlordId) {
    throw new Error("You are not authorized to view this property.");
  }
  return properties;
};

const updatePropertyIntoDB = async (landlordId: string, propertyId: string, payload: IUpdatePropertyRequest) => {
  // 1. Check if property exists and belongs to the landlord
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new Error("Property not found.");
  }

  if (property.landlordId !== landlordId) {
    throw new Error("You are not authorized to update this property.");
  }

  // 2. Prepare update payload with formatted price if provided
  const updateData: any = { ...payload };
  if (payload.price !== undefined) {
    updateData.price = Number(payload.price);
  }

  // 3. Update property
  const updatedProperty = await prisma.property.update({
    where: { id: propertyId },
    data: updateData,
    include: {
      category: true,
    },
  });

  return updatedProperty;
};

const deletePropertyFromDB = async (landlordId: string, propertyId: string) => {
  // 1. Check if property exists and belongs to the landlord
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new Error( "Property not found.");
  }

  if (property.landlordId !== landlordId) {
    throw new Error( "You are not authorized to delete this property.");
  }

  // 2. Delete property
  await prisma.property.delete({
    where: { id: propertyId },
  });

  return null;
};
export const propertyService ={
    createProperty,
    getLandlordPropertiesFromDB,
  updatePropertyIntoDB,
  deletePropertyFromDB,
  getLandlordPropertiesByIdFromDB
}