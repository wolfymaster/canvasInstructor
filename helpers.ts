import { ValidHTTPMethod } from "./types";

export async function request<T, R = T[]>(method: ValidHTTPMethod, url: string, body?: any): Promise<R> {
    // Initialize an array to store all paginated results
    let allResults: T[] = [];
    // Keep track of the next URL to fetch
    let nextUrl: string | null = joinUrl(this.baseUrl, url);
    let firstResponse: any = null;

    while (nextUrl) {
        const options = {
            method,
            headers: { Authorization: `Bearer ${this.token}` },
        };

        if (body) {
            Object.assign(options, { body });
        }

        try {
            const response = await fetch(nextUrl, options);

            if (!response.ok) {
                console.error(response);
                throw new Error('Failed to fetch data');
            }

            // Parse the current page results
            const responseData = await response.json();

            // Store the first response for single-item returns
            if (firstResponse === null) {
                firstResponse = responseData;
            }

            // Add the current page results to our collection
            if (Array.isArray(responseData)) {
                allResults = [...allResults, ...responseData];
            } else {
                // If API returns a single object, add it to results
                allResults.push(responseData as T);
            }

            // Get the Link header to determine if there are more pages
            const linkHeader = response.headers.get('Link');

            // If there's no Link header, we're done
            if (!linkHeader) {
                break;
            }

            // Extract the 'next' URL if it exists, otherwise set to null to end the loop
            nextUrl = extractNextUrl(linkHeader);

        } catch (err) {
            // Handle error here and rethrow or log it
            throw err;
        }
    }

    if (allResults.length === 1 && !Array.isArray(firstResponse)) {
        return firstResponse as R;
    }

    return allResults as R;
}

/**
 * Transforms an object into a FormData object.
 * @param data 
 * @param prefix 
 * @returns 
 */
export function objectToFormData(data: Record<string, any>, prefix = ''): URLSearchParams {
    const formData = new URLSearchParams();

    Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            // Handle array values (like prerequisite_module_ids)
            value.forEach((item) => {
                formData.append(`${prefix}[${key}][]`, item.toString());
            });
        } else if (value !== null && typeof value === 'object') {
            // Handle nested objects recursively
            const nestedFormData = objectToFormData(value, `${prefix}[${key}]`);
            nestedFormData.forEach((value, key) => {
                formData.append(key, value);
            });
        } else {
            // Handle simple key/value pairs
            formData.append(`${prefix}[${key}]`, value.toString());
        }
    });

    return formData;
}

/**
 * Correctly joins two URL parts, handling leading/trailing slashes
 * @param baseUrl string
 * @param path string
 * @returns string
 */
export function joinUrl(baseUrl: string, path: string): string {
    // Remove trailing slash from baseUrl if it exists
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    // Remove leading slash from path if it exists
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

    // Join with a slash
    return `${normalizedBase}/${normalizedPath}`;
}

/**
* Extract the 'next' URL from the Link header
*/
export function extractNextUrl(linkHeader: string | null): string | null {
    if (!linkHeader) return null;

    // Parse the link header to find the URL with rel="next"
    const links = linkHeader.split(',');
    for (const link of links) {
        const [urlPart, relPart] = link.split(';');

        if (relPart.trim() === 'rel="next"') {
            // Extract the URL from the angle brackets
            const url = urlPart.trim().slice(1, -1);
            return url;
        }
    }

    return null;
}