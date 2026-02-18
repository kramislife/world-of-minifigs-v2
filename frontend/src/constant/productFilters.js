export const PRICE_RANGES = [
  {
    value: "0-150",
    label: "$0 - $150",
    min: 0,
    max: 150,
  },
  {
    value: "101-500",
    label: "$101 - $500",
    min: 101,
    max: 500,
  },
  {
    value: "501-1000",
    label: "$501 - $1000",
    min: 501,
    max: 1000,
  },
  {
    value: "1000+",
    label: "$1000+",
    min: 1001,
    max: null,
  },
];

export const SORT_OPTIONS = [
  {
    value: "name_asc",
    label: "Name: A to Z",
  },
  {
    value: "name_desc",
    label: "Name: Z to A",
  },
  {
    value: "price_asc",
    label: "Price: Low to High",
  },
  {
    value: "price_desc",
    label: "Price: High to Low",
  },
  {
    value: "date_asc",
    label: "Date: Oldest to Newest",
  },
  {
    value: "date_desc",
    label: "Date: Newest to Oldest",
  },
];

export const DEFAULT_SORT = "date_desc";

export const PRODUCT_FILTERS = {
  CATEGORIES: {
    id: "categoryIds",
    urlKey: "categoryIds",
    label: "Categories",
    displayField: "categoryName",
    isArray: true,
  },
  SUB_CATEGORIES: {
    id: "subCategoryIds",
    urlKey: "subCategoryIds",
    label: "Subcategories",
    displayField: "subCategoryName",
    isArray: true,
  },
  COLLECTIONS: {
    id: "collectionIds",
    urlKey: "collectionIds",
    label: "Collections",
    displayField: "collectionName",
    isArray: true,
  },
  SUB_COLLECTIONS: {
    id: "subCollectionIds",
    urlKey: "subCollectionIds",
    label: "Sub-collections",
    displayField: "subCollectionName",
    isArray: true,
  },
  COLORS: {
    id: "colorIds",
    urlKey: "colorIds",
    label: "Colors",
    displayField: "colorName",
    isArray: true,
  },
  SKILL_LEVELS: {
    id: "skillLevelIds",
    urlKey: "skillLevelIds",
    label: "Skill Levels",
    displayField: "skillLevelName",
    isArray: true,
  },
  PRICE_RANGE: {
    id: "priceRange",
    urlKey: "priceRange",
    label: "Price Range",
    isArray: false,
  },
};

export const FILTER_KEYS = Object.values(PRODUCT_FILTERS).map((f) => f.id);
export const ARRAY_FILTER_KEYS = Object.values(PRODUCT_FILTERS)
  .filter((f) => f.isArray)
  .map((f) => f.id);

export const DEFAULT_PRODUCT_LIMIT = 15;
