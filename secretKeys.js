const fs = require("fs");

// Fast-XML-Parser Setup
const parser = require("fast-xml-parser");
const he = require("he");

/**
 * Returns a key that is 32 characters long
 * @returns     Returns the key that was generated
 */
const genKey = () => {
  let key = "";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return key;
};

/**
 * Converts the array of XML key elements to XML code and saves it in keys.xml
 * @param {string[]} keys   Represents the array of keys
 */
const writeXML = (keys) => {
  let xml = "";

  keys.forEach((key) => {
    xml += key;
  });

  fs.writeFileSync("./keys.xml", "<keys>" + xml + "</keys>");
};

/**
 * Saves a cipher key in keys.xml
 * @param {String} key    Represents the cipher key
 * @param {String} id     Represents the ID of the user that this key was used on
 * @returns               Returns a boolean value to indicate the result
 */
const saveKey = (key, id) => {
  try {
    let keys = [];

    // Checks if file can be read to retrieve previous values
    if (fs.existsSync("./keys.xml")) {
      keys = fs
        .readFileSync("./keys.xml", "utf-8")
        .split(/<\/?keys>/)
        .filter((str) => str.length);
    }

    keys.push(`<key><id>${id}</id><value>${key}</value></key>`);
    writeXML(keys);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

/**
 * Finds a cipher key based on ID in keys.xml
 * @param {String} id     Represents the ID of the  that this key was used on
 * @returns               Returns the key that was found or undefined
 */
const findKey = (id) => {
  try {
    let keys = parser.parse(fs.readFileSync("./keys.xml", "utf-8"), {
      attributeNamePrefix: "@_",
      attrNodeName: "attr",
      textNodeName: "#text",
      ignoreAttributes: true,
      ignoreNameSpace: false,
      allowBooleanAttributes: false,
      parseNodeValue: true,
      parseAttributeValue: false,
      trimValues: true,
      cdataTagName: "__cdata",
      cdataPositionChar: "\\c",
      parseTrueNumberOnly: false,
      numParseOptions: {
        hex: true,
        leadingZeros: true,
      },
      arrayMode: /keys/,
      attrValueProcessor: (val, attrName) =>
        he.decode(val, { isAttributeValue: true }),
      tagValueProcessor: (val, tagName) => he.decode(val),
      alwaysCreateTextNode: false,
    });

    return keys.issues.find((key) => key.includes(id));
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

/**
 * Removes a cipher key from keys.xml based on ID
 * @param {String} id     Represents the ID of the key to delete
 * @returns               Returns a boolean value to indicate the result
 */
const removeKey = (id) => {
  try {
    let keys = fs
      .readFileSync("./keys.xml", "utf-8")
      .split(/<\/?keys>/)
      .filter((str) => str.length);

    if (!keys.find((key) => key.includes(id))) return false;
    keys = keys.filter((key) => !key.includes(id));

    writeXML(keys);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

/**
 * Module for retrieving, deleting, and saving cipher keys
 * @module ./cipherKeys
 *
 */
const cipherKeys = {
  genKey: () => genKey(),
  findKey: (id) => findKey(id),
  saveKey: (key, id) => saveKey(key, id),
  removeKey: (id) => removeKey(id),
};

module.exports = cipherKeys;
