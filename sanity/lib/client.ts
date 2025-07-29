import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";
import { sanityFetch } from "@/sanity/lib/live";
import { Product, ProductCategory } from "@/sanity.types";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
});

