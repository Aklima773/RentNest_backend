import { prisma } from "../../lib/prisma";
import { ICreateCategoryRequest, IUpdateCategoryRequest } from "./category.interface";

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word characters
    .replace(/[\s_-]+/g, "-") // Collapse whitespace and replace with -
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
};

const createCategoryIntoDB = async (payload: ICreateCategoryRequest) => {
  const { name, description } = payload;
  const slug = generateSlug(name);

  // Check if category with same name or slug already exists
  const existingCategory = await prisma.category.findFirst({
    where: {
      OR: [{ name }, { slug }],
    },
  });

  if (existingCategory) {
    throw new Error("A category with this name or slug already exists.");
  }

  const result = await prisma.category.create({
    data: {
      name,
      slug,
      description,
    },
  });

  return result;
};

const getAllCategoriesFromDB = async () => {
  const result = await prisma.category.findMany({
    include: {
      _count: {
        select: { properties: true }, // Optional: shows how many properties belong to each category
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getCategoryByIdFromDB = async (id: string,) => {

    const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  const result = await prisma.category.findUnique({

    where:{

        id : id
    },

    include: {
      _count: {
        select: { properties: true }, // Optional: shows how many properties belong to each category
      },
    },

   
  });

  return result;
};

const updateCategoryIntoDB = async (id: string, payload: IUpdateCategoryRequest) => {
  // 1. Check if category exists

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  // 2. Prepare update data and re-generate slug if name is updated
  const updateData: any = { ...payload };
  if (payload.name) {
    const newSlug = generateSlug(payload.name);
    
    // Check if another category already uses the same name or slug
    const duplicate = await prisma.category.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { OR: [{ name: payload.name }, { slug: newSlug }] },
        ],
      },
    });

    if (duplicate) {
      throw new Error("Another category with this name or slug already exists.");
    }

    updateData.slug = newSlug;
  }

  // 3. Perform update
  const result = await prisma.category.update({
    where: { id },
    data: updateData,
  });

  return result;
};

const deleteCategoryFromDB = async (id: string) => {
  // 1. Check if category exists
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { properties: true } },
    },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  // 2. Optional safety check: Prevent deletion if properties are linked to it
  if (category._count.properties > 0) {
    throw new Error(
     
      `Cannot delete category. It has ${category._count.properties} active property/properties linked to it.`
    );
  }

  // 3. Delete category
  await prisma.category.delete({
    where: { id },
  });

  return null;
};

export const categoryService = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  updateCategoryIntoDB,
  deleteCategoryFromDB,
  getCategoryByIdFromDB
};