const express = require("express");
const multer = require("multer");
const app = express();
const port = 3000;

const structuresMap = new Map();

// Multer setup for file upload
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

app.get("/", function (req, res) {
  res.send("JSON Parser");
});

app.post("/upload-json", upload.single("jsonFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const identifier = req.body.identifier;
  if (!identifier) {
    return res.status(400).send("Identifier not provided.");
  }

  try {
    const fileContent = req.file.buffer.toString();
    let jsonContent;

    try {
      jsonContent = JSON.parse(fileContent);
    } catch (parseError) {
      console.error(parseError);
      return res.status(400).send("Uploaded file is not valid JSON.");
    }

    const structure = identifyStructure(jsonContent);

    // Store the identifier and structure in the global map
    structuresMap.set(identifier, structure);

    console.log(`Structure for ${identifier} stored.`);
    res.send({ message: `Structure for ${identifier} has been stored.` });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to process JSON file.");
  }
});

app.get("/get-structure/:identifier", (req, res) => {
  const identifier = req.params.identifier;

  if (structuresMap.has(identifier)) {
    const structure = structuresMap.get(identifier);
    res.send({ identifier, structure });
  } else {
    res.status(404).send({ message: "Identifier not found." });
  }
});

app.post("/compare-structure", upload.single("jsonFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const identifier = req.body.identifier;
  if (!identifier) {
    return res.status(400).send("Identifier not provided.");
  }

  // Check if the identifier exists in the global map
  if (!structuresMap.has(identifier)) {
    return res
      .status(404)
      .send({ message: "Identifier not found in the map." });
  }

  try {
    const fileContent = req.file.buffer.toString();
    let jsonContent;

    try {
      jsonContent = JSON.parse(fileContent);
    } catch (parseError) {
      console.error(parseError);
      return res.status(400).send("Uploaded file is not valid JSON.");
    }

    const inputStructure = identifyStructure(jsonContent);
    const storedStructure = structuresMap.get(identifier);

    // Compare the input structure with the stored structure
    const structuresMatch =
      compareStructuresWithExactKeyMatchAndReportDifferences(
        inputStructure,
        storedStructure
      );

    if (structuresMatch) {
      console.log(`Structure for ${identifier} matches the stored structure.`);
      res.send({
        message: `Structure for ${identifier} matches the stored structure.`,
      });
    } else {
      console.log(
        `Structure for ${identifier} does not match the stored structure.`
      );
      res.send({
        message: `Structure for ${identifier} does not match the stored structure.`,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to process JSON file.");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
