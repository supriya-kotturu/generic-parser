// Function to identify the structure of a JSON object
function identifyStructure(obj, parentKey = '') {
    let structure = {};

    for (const [key, value] of Object.entries(obj)) {
        // Construct the new key
        const newKey = parentKey ? `${parentKey}.${key}` : key;

        if (Array.isArray(value)) {
            // For arrays, we take the structure of the first element if available
            const firstItem = value.length > 0 ? value[0] : 'any';
            if (typeof firstItem === 'object' && firstItem !== null) {
                // If the first item is an object, identify its structure
                const itemStructure = identifyStructure(firstItem);
                // Use a special notation to indicate it's an array of objects
                structure[newKey] = `Array<Object>`;
                // Merge the item structure as a nested structure under the array key
                for (const itemKey in itemStructure) {
                    structure[`${newKey}.<item>.${itemKey}`] = itemStructure[itemKey];
                }
            } else {
                // For arrays of primitive types or empty arrays
                structure[newKey] = `Array<${typeof firstItem}>`;
            }
        } else if (value !== null && typeof value === 'object') {
            // Recurse for nested objects
            Object.assign(structure, identifyStructure(value, newKey));
        } else {
            // Direct assignment for primitive types and null
            structure[newKey] = typeof value;
        }
    }
    return structure;
}

// Function to compare two JSON structures, ignoring array lengths
function compareStructuresWithExactKeyMatch(structure1, structure2) {
    const keys1 = Object.keys(structure1).sort();
    const keys2 = Object.keys(structure2).sort();

    // Check if both structures have the same number of keys
    if (keys1.length !== keys2.length) {
        return false;
    }

    // Check for exact match of keys and their types
    for (let i = 0; i < keys1.length; i++) {
        if (keys1[i] !== keys2[i] || structure1[keys1[i]] !== structure2[keys2[i]]) {
            return false;
        }
    }

    return true;
}


function areJsonStructuresSame(json1, json2) {
    // Recursive function to compare structures
    function compare(obj1, obj2) {
        // Type comparison
        if (typeof obj1 !== typeof obj2) return false;

        // If objects, compare properties
        if (typeof obj1 === 'object' && obj1 !== null && obj2 !== null) {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);

            // Check for same number of keys
            if (keys1.length !== keys2.length) return false;

            // Check for same keys and recursively check values
            for (const key of keys1) {
                if (!keys2.includes(key)) return false;
                if (!compare(obj1[key], obj2[key])) return false;
            }
        } else if (Array.isArray(obj1) && Array.isArray(obj2)) {
            // If arrays, compare lengths and recursively check each item
            if (obj1.length !== obj2.length) return false;
            for (let i = 0; i < obj1.length; i++) {
                if (!compare(obj1[i], obj2[i])) return false;
            }
        } else {
            // If primitives, compare values directly
            if (obj1 !== obj2) return false;
        }

        return true;
    }

    return compare(json1, json2);
}

function compareStructuresWithExactKeyMatchAndReportDifferences(structure1, structure2) {
    const keys1 = Object.keys(structure1).sort();
    const keys2 = Object.keys(structure2).sort();
    let differences = []; // To store the differences

    // Helper function to add differences
    const addDifference = (key, value1, value2) => {
        differences.push(`Key: ${key}, Structure1 Type: ${value1}, Structure2 Type: ${value2}`);
    };

    // Check if both structures have the same number of keys
    if (keys1.length !== keys2.length) {
        // Find which keys are extra in each structure
        const extraKeys1 = keys1.filter(key => !keys2.includes(key));
        const extraKeys2 = keys2.filter(key => !keys1.includes(key));
        extraKeys1.forEach(key => addDifference(key, structure1[key], 'Not present'));
        extraKeys2.forEach(key => addDifference(key, 'Not present', structure2[key]));
    } else {
        // Check for exact match of keys and their types
        for (let i = 0; i < keys1.length; i++) {
            if (keys1[i] !== keys2[i]) {
                addDifference(keys1[i], structure1[keys1[i]], structure2[keys2[i]]);
                addDifference(keys2[i], structure1[keys1[i]], structure2[keys2[i]]);
            } else if (structure1[keys1[i]] !== structure2[keys2[i]]) {
                addDifference(keys1[i], structure1[keys1[i]], structure2[keys2[i]]);
            }
        }
    }

    // Reporting differences
    if (differences.length > 0) {
        console.log("Differences found:");
        differences.forEach(diff => console.log(diff));
        return false; // Structures are not the same
    } else {
        console.log("No differences found. Structures are the same.");
        return true; // Structures are the same
    }
}

module.exports = {
    compareStructuresWithExactKeyMatchAndReportDifferences
    , areJsonStructuresSame,
    compareStructuresWithExactKeyMatch,identifyStructur

}