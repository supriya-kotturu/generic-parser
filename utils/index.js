const { Pool } = require('pg');
const pool = new Pool({
    user: 'myuser',
    host: 'localhost',
    database: 'mytestdb',
    password: 'mypassword',
    port: 5432, // Example: 5432
});

async function executeQuery(sql) {
    const client = await pool.connect(); // Get a client from the pool
    try {
        // Use the client for executing a query
        const res = await client.query(sql);
        console.log(res.rows); // Assuming your query returns rows
    } catch (error) {
        console.error('Error executing query:', error);
    } finally {
        client.release(); // Release the client back to the pool
;
    const keys2 = Object.keys(structure2).sort();
function compareStructuresWithExactKeyMatchAndReportDifferencess(structure1, structure2) {
    const keys1 = Object.keys(structure1).sort();
    const keys2 = Object.keys(structure2).sort();
    let differences = []; // To store the differences

    // Helper function to add differences
    const addDifference = (key, value1, value2) => {
        differences.push({key, structure1Type: value1, structure2Type: value2});
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
            if (keys1[i] !== keys2[i] || structure1[keys1[i]] !== structure2[keys2[i]]) {
                addDifference(keys1[i], structure1[keys1[i]], structure2[keys2[i]]);
            }
        }
    }

    // Constructing the return object
    let result = {
        areSame: differences.length === 0,
        differences: differences
    };

    // Optionally, log the result
    if (differences.length > 0) {
        console.log("Differences found:");
        differences.forEach(diff => console.log(`Key: ${diff.key}, Structure1 Type: ${diff.structure1Type}, Structure2 Type: ${diff.structure2Type}`));
    } else {
        console.log("No differences found. Structures are the same.");
    }

    return result;
}


function compareStructuresWithExactKeyMatchAndReportDifferences(structure1, structure2) {
    const keys1 = Object.keys(structure1).sort();
    const keys2 = Object.keys(structure2).sort();
    let differences = []; // To store the differences

    //key1 input string
    // Helper function to add differences
    const addDifference = (key, value1, value2) => {
        differences.push(`Key: ${key}, of Type: ${value1}, is extra`);
    };

    // Check if both structures have the same number of keys
    if (keys1.length !== keys2.length) {
        // Find which keys are extra in each structure
        const extraKeys1 = keys1.filter(key => !keys2.includes(key));
      //  const extraKeys2 = keys2.filter(key => !keys1.includes(key));
        extraKeys1.forEach(key => addDifference(key, structure1[key], 'Not present'));
     //   extraKeys2.forEach(key => addDifference(key, 'Not present', structure2[key]));
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

    let result = {
        areSame: differences.length === 0,
        differences: differences
    };


    // Reporting differences
    if (differences.length > 0) {
        console.log("Differences found:");
        differences.forEach(diff => console.log(diff));
        return result; // Structures are not the same
    } else {
        console.log("No differences found. Structures are the same.");
        return result; // Structures are the same
    }
}

const express = require('express');
const multer = require('multer');
const app = express();
const port = 3000;


const structuresMap = new Map();

// Multer setup for file upload
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

function identifyJsonStructure(json, path = '') {
    let structure = {};

    for (const [key, value] of Object.entries(json)) {
        // Current path to the property
        const currentPath = path ? `${path}.${key}` : key;

        // Determine the type of value
        if (Array.isArray(value)) {
            structure[currentPath] = 'Array';
            if (value.length > 0) {
                // Check the type of the first element in the array
                const elementType = typeof value[0];
                // If the element is an object, recursively identify its structure
                if (elementType === 'object') {
                    structure = { ...structure, ...identifyJsonStructure(value[0], `${currentPath}.<array element>`) };
                } else {
                    structure[`${currentPath}.<array element>`] = elementType;
                }
            }
        } else if (typeof value === 'object' && value !== null) {
            // If it's an object, recursively identify its structure
            structure = { ...structure, ...identifyJsonStructure(value, currentPath) };
        } else {
            // For primitive types, just set the type directly
            structure[currentPath] = typeof value;
        }
    }

    return structure;
}


app.post('/register', upload.single('jsonFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const identifier = req.body.identifier;
    if (!identifier) {
        return res.status(400).send('Identifier not provided.');
    }

    try {
        const fileContent = req.file.buffer.toString();
        let jsonContent;

        try {
            jsonContent = JSON.parse(fileContent);
        } catch (parseError) {
            console.error(parseError);
            return res.status(400).send('Uploaded file is not valid JSON.');
        }

        const structure = identifyStructure(jsonContent);

        // Store the identifier and structure in the global map
        structuresMap.set(identifier, structure);

        console.log(`Structure for ${identifier} stored.`);
        dbSchemaNested  = identifyJsonStructure(jsonContent);
        const sql = generateCreateTableSQL(identifier, dbSchemaNested);

        console.log(sql); // Optional: SQL log karna chahte hain to

        try {
            await executeQuery(sql); // SQL execute karein
            // If execution reaches this point, no error was thrown, and the table was created successfully
            res.status(200).send({ message: `Table created and structure for ${identifier} has been stored.` });
        } catch (error) {
            // If an error occurs, this block will execute, sending a 500 response
            console.error(error); // Log the error for debugging purposes
            res.status(500).send('Failed to create table');
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to process JSON file.');
    }
});

app.get('/get-structure/:identifier', (req, res) => {
    const identifier = req.params.identifier;

    if (structuresMap.has(identifier)) {
        const structure = structuresMap.get(identifier);
        res.send({ identifier, structure });
    } else {
        res.status(404).send({ message: 'Identifier not found.' });
    }
});

function generateCreateTableSQL(baseTableName, structure) {
    let sqlStatements = [];

    // Expanded typeMapping to include PostgreSQL data types
    const typeMapping = {
        string: 'TEXT',
        number: 'NUMERIC',
        boolean: 'BOOLEAN',
        object: 'JSONB', // For nested objects
        array: 'JSONB',  // For arrays; consider more specific handling depending on content
        integer: 'INTEGER',
        bigInteger: 'BIGINT',
        float: 'REAL',
        double: 'DOUBLE PRECISION',
        date: 'DATE',
        timestamp: 'TIMESTAMP',
        uuid: 'UUID'
    };

    const createTableSQL = (tableName, columns) => {
        const columnsSQL = columns.map(column => {
            // Use typeMapping to convert types, default to TEXT for unrecognized types
            const columnType = typeMapping[column.type.toLowerCase()] || 'TEXT';
            return `"${column.name}" ${columnType}`;
        }).join(',\n  ');

        return `CREATE TABLE "${tableName}" (\n  ${columnsSQL}\n);`;
    };

    // Generate SQL for the base table using typeMapping for data type conversion
    const baseColumns = Object.entries(structure)
        .filter(([_, type]) => !['Array<Object>', 'Object'].includes(type)) // Directly handle simple types and JSONB for complex types
        .map(([key, type]) => ({
            name: key,
            type: type === 'Array' ? 'JSONB' : type // Treat arrays as JSONB; adjust as needed
        }));
    sqlStatements.push(createTableSQL(baseTableName, baseColumns));

    // Optionally, handle 'Array<Object>' or 'Object' types by creating related tables or using JSONB, as per your application logic

    return sqlStatements.join('\n\n');
}
app.post('/parse', upload.single('jsonFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const identifier = req.body.identifier;
    if (!identifier) {
        return res.status(400).send('Identifier not provided.');
    }

    // Check if the identifier exists in the global map
    if (!structuresMap.has(identifier)) {
        return res.status(404).send({ message: 'Identifier not found in the map.' });
    }

    try {
        const fileContent = req.file.buffer.toString();
        let jsonContent;

        try {
            jsonContent = JSON.parse(fileContent);
        } catch (parseError) {
            console.error(parseError);
            return res.status(400).send('Uploaded file is not valid JSON.');
        }

        const inputStructure = identifyStructure(jsonContent);
        const storedStructure = structuresMap.get(identifier);

        // Compare the input structure with the stored structure
        const structuresMatch = compareStructuresWithExactKeyMatchAndReportDifferences(inputStructure, storedStructure);


        if (structuresMatch.areSame) {
            console.log(`Structure for ${identifier} matches the stored structure.`);
            insertJsonData(identifier,jsonContent)
            res.send({ message: `Structure for ${identifier} matches the stored structure.` });
        } else {
            console.log(`Structure for ${identifier} does not match the stored structure. Differences:`, structuresMatch.differences);
            res.send({
                message: `Structure for ${identifier} does not match the stored structure.`,
                differences: structuresMatch.differences
            });
        }

        // if (structuresMatch) {
        //     console.log(`Structure for ${identifier} matches the stored structure.`);
        //     res.send({ message: `Structure for ${identifier} matches the stored structure.` });
        // } else {
        //     console.log(`Structure for ${identifier} does not match the stored structure.`);
        //     res.send({ message: `Structure for ${identifier} does not match the stored structure.` });
        // }
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to process JSON file.');
    }
});

function flattenJson(obj, parentKey = '', result = {}) {
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = parentKey ? `${parentKey}_${key}` : key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            flattenJson(value, fullKey, result);
        } else {
            result[fullKey] = value;
        }
    }
    return result;
}

async function insertJsonData(tableName, jsonData) {
    const client = await pool.connect(); // Get a client from the pool
    const flattenedJson = flattenJson(jsonData);
    const columns = Object.keys(flattenedJson);
    const values = Object.values(flattenedJson);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    console.log(query)
    console.log(values)
    console.log(columns)
    console.log(placeholders)
    try {
        await client.query(query, values);
        console.log('JSON data inserted successfully into table.');
    } catch (error) {
        console.error('Failed to insert JSON data:', error);
    }
}


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app