const fs = require("fs");
const xml2json = require("xml2json");

/**
 * Returns a key that is 32 characters long
 * @returns     Returns the key that was generated
 */
const genKey = () => {
  let key = "";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 32; i++) {
    key[i] += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return key;
};

/**
 * Saves a cipher key in keys.xml
 * @param {String} key    Represents the cipher key
 * @param {String} id     Represents the ID of the user that this key was used on
 * @returns               Returns a boolean value to indicate the result
 */
const saveKey = (key, id) => {
  try {
    let json = [];
    let obj = { key: { id: id, secret: key } };

    // Checks if file can be read to retrieve previous values
    if (fs.existsSync("./keys.xml")) {
      json = xml2json.toJson(fs.readFileSync("./keys.xml", "utf-8"), {
        reversible: true,
      });
      json.push(obj);
    } else {
      json = [obj];
    }

    fs.writeFileSync("./keys.xml", xml2json.toXml(json));
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

/**
 * Finds a cipher key based on ID in keys.xml
 * @param {String} id     Represents the ID of the user that this key was used on
 * @returns               Returns the key that was found or undefined
 */
const findKey = (id) => {
  try {
    json = xml2json.toJson(fs.readFileSync("./keys.xml", "utf-8"), {
      reversible: true,
    });

    return json.find((key) => key.id == id);
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
    let json = xml2json.toJson(fs.readFileSync("./keys.xml", "utf-8"), {
      reversible: true,
    });

    if (!json.find((key) => key.id == id)) return false;
    json = json.filter((key) => key.id != id);

    fs.writeFileSync("./keys.xml", xml2json.toXml(json));
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
