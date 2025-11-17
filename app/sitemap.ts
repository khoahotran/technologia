
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.myelectronicsstore.com";
  const staticPages = ["", "products", "about", "contact"];

  return staticPages.map((page) => ({
    url: `${baseUrl}/${page}`,
    lastModified: new Date(),
  }));
}
