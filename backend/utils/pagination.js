const SAFE_MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

//------------------------------------------------ Normalize -------------------------------------------------

export const normalizePagination = ({ page, limit, search }) => {
  // Normalize page
  let normalizedPage = parseInt(page, 10);
  if (isNaN(normalizedPage) || normalizedPage < 1) {
    normalizedPage = DEFAULT_PAGE;
  }

  // Normalize limit - enforce SAFE_MAX_LIMIT
  let normalizedLimit = parseInt(limit, 10);

  // Handle "all" or invalid values - convert to SAFE_MAX_LIMIT
  if (isNaN(normalizedLimit) || normalizedLimit <= 0 || limit === "all") {
    normalizedLimit = SAFE_MAX_LIMIT;
  }

  // Enforce maximum limit
  if (normalizedLimit > SAFE_MAX_LIMIT) {
    normalizedLimit = SAFE_MAX_LIMIT;
  }

  // Normalize search - trim whitespace
  const normalizedSearch = search ? String(search).trim() : "";

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    search: normalizedSearch,
  };
};

//------------------------------------------------ Search -------------------------------------------------

export const buildSearchQuery = (search, searchFields = []) => {
  if (!search || searchFields.length === 0) {
    return {};
  }

  const searchRegex = new RegExp(search, "i"); // Case-insensitive search

  if (searchFields.length === 1) {
    return {
      [searchFields[0]]: searchRegex,
    };
  }

  // Multiple fields: use $or
  return {
    $or: searchFields.map((field) => ({
      [field]: searchRegex,
    })),
  };
};

//------------------------------------------------ Paginate -------------------------------------------------

export const paginateQuery = async (
  Model,
  query = {},
  { page, limit, sort = { createdAt: -1 }, populate = "", select = "-__v" },
) => {
  const skip = (page - 1) * limit;

  // Build query
  let mongooseQuery = Model.find(query).sort(sort).skip(skip).limit(limit);

  // Apply field selection
  if (select) {
    mongooseQuery = mongooseQuery.select(select);
  }

  // Handle populate - can be string, array, or array of objects
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach((pop) => {
        mongooseQuery = mongooseQuery.populate(pop);
      });
    } else {
      mongooseQuery = mongooseQuery.populate(populate);
    }
  }

  // Execute count and data queries in parallel for better performance
  const [totalItems, data] = await Promise.all([
    Model.countDocuments(query),
    mongooseQuery.lean().exec(),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

//------------------------------------------------ Response -------------------------------------------------

export const createPaginationResponse = (result, dataKey = "items") => {
  return {
    success: true,
    [dataKey]: result.data,
    pagination: result.pagination,
  };
};

export { SAFE_MAX_LIMIT, DEFAULT_LIMIT, DEFAULT_PAGE };
