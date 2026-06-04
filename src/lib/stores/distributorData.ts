import { writable } from "svelte/store";
import type { ResourceHubCategoryDocument } from "../../prismicio-types";
export const distributorData = writable<ResourceHubCategoryDocument<string>[]>();
