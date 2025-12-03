import type { MetadataRoute } from "next";

const BASE_URL = "https://duesignal.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
    },
   
  ];
}
