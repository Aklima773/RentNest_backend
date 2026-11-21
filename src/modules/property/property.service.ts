

import { UserRole } from "../../../prisma/schema/generated/prisma";
import { prisma } from "../../lib/prisma";
import { ICreatePropertyRequest, IPropertyQuery, IUpdatePropertyRequest } from "./property.interface";




const createProperty = async(payload: ICreatePropertyRequest, userId : string)=>{

// Use a transaction to ensure both role upgrade and property creation succeed together

const result = await prisma.$transaction(async (tx: any) => {
  
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

const ALLOWED_SORT_FIELDS = ["createdAt", "price", "title", "location"];

type PropertyWhereInput = NonNullable<
  Parameters<typeof prisma.property.findMany>[0]
>["where"];

const andConditions: NonNullable<PropertyWhereInput>[] = [];




const getAllPropertiesFromDB = async (query: IPropertyQuery = {}) => {
  const limit = Math.max(Number(query.limit) || 10, 1);
  const page = Math.max(Number(query.page) || 1, 1);
  const skip = (page - 1) * limit;
  const sortBy =
    query.sortBy && ALLOWED_SORT_FIELDS.includes(query.sortBy)
      ? query.sortBy
      : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const andConditions: PropertyWhereInput[] = [];

  if (query.searchTerm?.trim()) {
    const term = query.searchTerm.trim();
    andConditions.push({
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { location: { contains: term, mode: "insensitive" } },
      ],
    });
  }

  // 2. Filter by location
  if (query.location?.trim()) {
    andConditions.push({
      location: {
        contains: query.location.trim(),
        mode: "insensitive",
      },
    });
  }

  // 3. Filter by price range (minPrice / maxPrice)
  if (query.minPrice !== undefined && query.minPrice !== "") {
    const min = Number(query.minPrice);
    if (!Number.isNaN(min)) {
      andConditions.push({
        price: { gte: min },
      });
    }
  }

  if (query.maxPrice !== undefined && query.maxPrice !== "") {
    const max = Number(query.maxPrice);
    if (!Number.isNaN(max)) {
      andConditions.push({
        price: { lte: max },
      });
    }
  }

  // 4. Filter by property type (categoryId or related category name/slug)
  if (query.categoryId?.trim()) {
    andConditions.push({
      categoryId: query.categoryId.trim(),
    });
  } else if (query.propertyType?.trim()) {
    const propType = query.propertyType.trim();
    andConditions.push({
      OR: [
        { categoryId: propType },
        {
          category: {
            is: {
              name: { equals: propType, mode: "insensitive" },
            },
          },
        },
      ],
    });
  }

  


  // 6. Optional availability filter
  if (query.isAvailable !== undefined && query.isAvailable !== "") {
    const boolVal =
      typeof query.isAvailable === "boolean"
        ? query.isAvailable
        : query.isAvailable === "true";

    andConditions.push({
      isAvailable: boolVal,
    });
  }

  // const whereCondition: PropertyWhereInput =
  //   andConditions.length > 0 ? { AND: andConditions } : {};

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
     
      include: {
        category: true,
        landlord: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    }),
    prisma.property.count(),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: properties,
  };
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
  getLandlordPropertiesByIdFromDB,
  getAllPropertiesFromDB
}