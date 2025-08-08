import { Path } from './types';

/**
 * Safely retrieves a value from a nested object using a dot-separated path string.
 *
 * The function can traverse through objects and arrays. If the path leads to an array,
 * it searches all elements in the array. If only one element is found, the single value
 * is returned. If multiple values are found, an array of values is returned. If the path
 * does not exist, a default value can be returned.
 *
 * @template T - The type of the object to retrieve the value from.
 * @template P - The dot-separated string path that describes the location of the value in the object.
 * @template F - The type of the default value, which is returned if the path does not exist.
 *
 * @param {T} obj - The object from which to retrieve the value.
 * @param {P} path - A dot-separated string that specifies the path to the desired value. Supports nested objects and arrays.
 *                    Array indices should not be specified in the path; the function automatically searches all elements
 *                    within any arrays encountered in the path.
 * @param {F} [defaultValue] - A default value returned if the path is not found in the object. If not specified, `undefined` is returned by default.
 *
 * @returns {P extends Path<T> ? any : F} - The value found at the specified path, or the default value if not found.
 * If the path leads to multiple values (e.g., from an array), an array of values is returned.
 * If only one value is found, the value itself is returned, not wrapped in an array.
 *
 * @example
 * const dataWithArray = {
 *   user: {
 *     profile: [
 *       {
 *         name: 'John',
 *         address: {
 *           street: 'Main St',
 *           city: 'Somewhere',
 *         },
 *       },
 *       {
 *         name: 'Robb',
 *         address: {
 *           street: 'Second St',
 *           city: 'Somewhere else',
 *         },
 *       },
 *     ],
 *   },
 * };
 *
 * // Example 1: Multiple values -> Returns an array of cities
 * const cities = getPath(dataWithArray, 'user.profile.address.city');
 * console.log(cities); // Output: ['Somewhere', 'Somewhere else']
 *
 * // Example 2: Single value -> Returns the single city value
 * const singleCity = getPath(dataWithArray, 'user.profile.address.city');
 * console.log(singleCity); // Output: 'Somewhere'
 *
 * // Example 3: Non-existent path -> Returns the default value
 * const nonExistent = getPath(dataWithArray, 'user.profile.address.zipcode', 'No Zip');
 * console.log(nonExistent); // Output: 'No Zip'
 */
export function getPath<T, P extends Path<T> | string, F>(
    obj: T,
    path: P,
    defaultValue?: F,
): P extends Path<T> ? any : F {
    const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.') as Array<keyof any>;

    let result: any = obj;

    for (const key of keys) {
        if (Array.isArray(result)) {
            result = result.map((item) => item?.[key]).filter((r) => r !== undefined);
        } else {
            result = result?.[key];
        }

        if (result === undefined) return defaultValue as F;
    }

    if (Array.isArray(result)) {
        return (result.length > 1 ? result : (result[0] ?? defaultValue)) as P extends Path<T> ? any : F;
    }

    return result as P extends Path<T> ? any : F;
}
