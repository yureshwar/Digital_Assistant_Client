/**
 * Imports various utility functions and constants used in the search service.
 * - `ENDPOINT`: Provides the endpoint URLs for the search-related API calls.
 * - `recordUserClickData`: Records user click data for search-related actions.
 * - `REST`: Provides utility functions for processing API request parameters.
 * - `specialNodes`: Provides a list of special node types used in the application.
 * - `getUserId`: Retrieves the user's session ID.
 */
import { ENDPOINT } from "../config/endpoints";
import { recordUserClickData, REST } from ".";
import { specialNodes } from "../util/specialNodes";
import { getUserId } from "./userService";

/**
 * Fetches search results from the backend with error handling.
 *
 * @param request - An optional object containing the following properties:
 *   - keyword: The search keyword to record user click data.
 *   - page: The page number for the search results.
 *   - domain: The domain to filter the search results.
 *   - additionalParams: Any additional parameters to include in the search request.
 *   - userSessionId: The user's session ID.
 * @returns A promise that resolves to the search results.
 */
export const fetchSearchResults = async (request?: {
  // The search keyword to record user click data.
  keyword?: string;
  // The page number for the search results.
  page: number;
  // The domain to filter the search results.
  domain?: string;
  // Any additional parameters to include in the search request.
  additionalParams?: any;
  // The user's session ID.
  userSessionId?: any;
}) => {
  try {
    // If the keyword is not empty, record user click data.
    if (request?.keyword && request.keyword !== "") {
      recordUserClickData("search", request.keyword);
    }

  request.userSessionId = await getUserId();
  if (request.additionalParams === null) {
    delete request.additionalParams;
  }
  let parameters: any;
  let url=ENDPOINT.Search;
  if (request.additionalParams != null) {
    if(global.UDAGlobalConfig.enableAISearch){
      url = process.env.tokenUrl+ENDPOINT.AISearchWithPermissions;
    } else {
      url = ENDPOINT.SearchWithPermissions;
    }
    parameters = {
      url: REST.processArgs(url, request),
      method: "GET",
    };
  } else {
    if(global.UDAGlobalConfig.enableAISearch){
      url = process.env.tokenUrl+ENDPOINT.AISearch;
    } else {
      url = ENDPOINT.Search;
    }
    parameters = {
      url: REST.processArgs(url, request),
      method: "GET",
    };
  }

    // Make the API call and return the result.
    return await REST.apiCal(parameters);
  } catch (error) {
    // Log the error and throw a new error with a user-friendly message.
    console.error("Error fetching search results:", error);
    throw new Error(`Failed to fetch search results: ${error.message}`);
  }
};

/**
 * Fetch a record from the backend with optional additional parameters and error handling.
 * @param request - An optional object containing the following properties:
 *   - id: The ID of the record to fetch.
 *   - domain: The domain to filter the record.
 *   - additionalParams: Any additional parameters to include in the record fetch request.
 *   - userSessionId: The user's session ID.
 * @returns A promise that resolves to the fetched record.
 */
export const fetchRecord = async (request?: {
  id?: string;
  domain?: string;
  additionalParams?: any;
  userSessionId?: string;
}) => {
  try {
    // If additionalParams is null, remove it from the request object
    if (request.additionalParams === null) {
      delete request.additionalParams;
    } else {
      // If additionalParams is present, add the userSessionId to the request object
      request.userSessionId = await getUserId();
    }

    let parameters: any;
    let url = ENDPOINT.fetchRecord;

    // Determine which endpoint to use based on whether additionalParams is present
    if (request.additionalParams != null) {
      url += "/withPermissions";
    }

    // Construct the full URL by appending the id and domain to the endpoint URL
    url += "/" + request.id + "?domain=" + request.domain;

    // If additionalParams is present, append it to the URL
    if (request.additionalParams != null) {
      url +=
        "&additionalParams=" +
        request.additionalParams +
        "&userSessionId=" +
        request.userSessionId;
    }

    // Construct the API call parameters
    parameters = {
      url,
      method: "GET",
    };

    // Make the API call and return the result
    return await REST.apiCal(parameters);
  } catch (error) {
    // Log the error and throw a new error with a user-friendly message
    console.error("Error fetching record:", error);
    throw new Error(`Failed to fetch record: ${error.message}`);
  }
};

/**
 * Fetch special nodes processing from backend with error handling
 * @param request - An optional object containing parameters for the special nodes request
 * @returns A promise that resolves to the fetched special nodes
 */
export const fetchSpecialNodes = async (request?: any) => {
  try {
    // Construct the API call parameters by processing the request using the REST.processArgs function
    const parameters = {
      url: REST.processArgs(ENDPOINT.SpecialNodes, request),
      method: "GET",
    };
    return specialNodes;
  } catch (error) {
    // Log the error and throw a new error with a user-friendly message
    console.error("Error fetching special nodes:", error);
    throw new Error(`Failed to fetch special nodes: ${error.message}`);
  }
};
