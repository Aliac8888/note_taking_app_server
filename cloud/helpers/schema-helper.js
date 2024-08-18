async function ensureClassExists(className, fields = {}) {
  try {
    // Try to retrieve the schema to check if it already exists
    const existingSchema = new Parse.Schema(className);
    await existingSchema.get(); // This will throw an error if the class doesn't exist
    return true;
  } catch (err) {
    if (
      err.message !== "Schema not found." &&
      err.message !== "Class Note does not exist."
    ) {
      throw new Error(
        `Error while ensuring class ${className}: ${err.message}`
      );
    }
  }

  const schema = new Parse.Schema(className);

  // Define fields for the class based on the provided fields object
  for (const [fieldName, fieldType] of Object.entries(fields)) {
    switch (fieldType) {
      case "String":
        schema.addString(fieldName);
        break;
      case "Number":
        schema.addNumber(fieldName);
        break;
      case "Boolean":
        schema.addBoolean(fieldName);
        break;
      case "Pointer<_User>":
        schema.addPointer(fieldName, "_User");
        break;
      // Add more field types as needed
      default:
        throw new Error(`Unsupported field type: ${fieldType}`);
    }
  }

  try {
    // Try to create the schema, will succeed if it doesn't already exist
    await schema.save();
    return true;
  } catch (error) {
    throw new Error(
      `Error while ensuring class ${className}: ${error.message}`
    );
  }
}

module.exports = {
  ensureClassExists,
};
