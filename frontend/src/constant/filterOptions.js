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
      max: null, // No max
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
  