const fs = require("fs");

// Fast-XML-Parser Setup
const parser = require("fast-xml-parser");
const he = require("he");
const options = {
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
  arrayMode: (tagName) => tagName === "key",
  attrValueProcessor: (val, attrName) =>
    he.decode(val, { isAttributeValue: true }),
  tagValueProcessor: (val, tagName) => he.decode(val),
  alwaysCreateTextNode: false,
};

/**
 * Returns a key that is 512 characters long
 * @returns     Returns the key that was generated
 */
const genKey = () => {
  let key = "";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 512; i++) {
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
        .split(/<\/?keys?>/)
        .filter((str) => str.length)
        .map((key) => `<key>${key}</key>`);
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
    const json = parser.parse(fs.readFileSync("./keys.xml", "utf-8"), options);
    return json.keys.key && json.keys.key.find((key) => key.id == id)
      ? json.keys.key.find((key) => key.id == id).value
      : undefined;
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
      .split(/<\/?keys?>/)
      .filter((str) => str.length)
      .map((key) => `<key>${key}</key>`);

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
 * Updates or stores a new secret key in keys.xml based on ID
 * @param {String} id         Represents the ID of the key to update
 * @param {String} newKey     Represents the new key
 * @returns                   Returns a boolean value to indicate the result
 */
const updateKey = (newKey, id) => {
  try {
    let json = parser.parse(fs.readFileSync("./keys.xml", "utf-8"), options);

    // Adds a secret key to keys.xml
    if (!json.keys.key || !json.keys.key.find((key) => key.id == id)) {
      return saveKey(newKey, id);
    }

    let index = json.keys.key.findIndex((key) => key.id == id);

    json.keys.key[index].value = newKey;

    writeXML(
      json.keys.key.map(
        (key) => `<key><id>${key.id}</id><value>${key.value}</value></key>`
      )
    );
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

/**
 * Module for generating, retrieving, deleting, updating, and saving cipher keys
 * @module ./secretKeys
 *
 */
const secretKeys = {
  genKey: () => genKey(),
  findKey: (id) => findKey(id),
  saveKey: (key, id) => saveKey(key, id),
  removeKey: (id) => removeKey(id),
  updateKey: (key, id) => updateKey(key, id),
};

module.exports = secretKeys;
