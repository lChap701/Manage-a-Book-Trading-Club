require("dotenv").config();

// Axios Setup
const axios = require("axios").default;
const countryStateCity = axios.create({
  baseURL: "https://api.countrystatecity.in/v1",
  headers: { "X-CSCAPI-KEY": process.env.COUNTRY_STATE_CITY_API_KEY },
  timeout: 10000,
});
const zippopotam = axios.create({
  baseURL: "http://api.zippopotam.us",
  timeout: 1000,
});
const locationIq = axios.create({
  baseURL: `https://api.locationiq.com/v1/autocomplete.php`,
  timeout: 10000,
});

/**
 * Filters and sorts states
 * @param {Array} states      Represents an array of states
 * @param {String} cntyAbbr   Represents the abbreviated country (defaults to "")
 * @returns                   Returns a cleaned up array of states
 */
const stateCleanUp = (states, cntyAbbr) => {
  return states
    .filter(
      (state) =>
        (!state.name.includes("Island") &&
          !state.name.includes("Atoll") &&
          !state.name.includes("Reef") &&
          !state.name.includes("Guam") &&
          !state.name.includes("American Samoa")) ||
        state.name.includes("Rhode Island")
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((state) => {
      return {
        name: state.name,
        abbr: state.iso2,
        country: state.country_code || cntyAbbr.toUpperCase(),
      };
    });
};

/**
 * Filters and sorts states
 * @param {Array} cities      Represents an array of cities
 * @param {String} cntyAbbr   Represents the abbreviation of a country
 * @param {String} stAbbr     Represents the abbreviation of a state (defaults to "")
 * @returns                   Returns a cleaned up array of cities
 */
const cityCleanUp = (cities, cntyAbbr, stAbbr = "") => {
  return cities
    .filter(
      (city) =>
        !city.name.includes("County") &&
        !city.name.includes("Parish") &&
        !city.name.includes("River") &&
        !city.name.includes("Lake")
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((city) => {
      return {
        name: city.name,
        state: stAbbr.toUpperCase(),
        country: cntyAbbr.toUpperCase(),
      };
    });
};

/**
 * Module for retrieving addresses, cities, states, countries, and zip code
 * @module ./routes/locations
 *
 */
const locations = {
  getAllAddresses: (res, q, cntyAbbr = null) => {
    let url = `?key=${process.env.LOCATIONIQ_ACCESS_TOKEN}&q=${q}&limit=20&tag=building:house`;

    if (cntyAbbr) url += `&countrycodes=${cntyAbbr}`;

    locationIq
      .get(url)
      .then((resp) => {
        let addresses = resp.data.map((obj) => {
          if (obj.address.hasOwnProperty("house_number")) {
            return `${obj.address.house_number} ${obj.address.road}`;
          } else {
            return `${obj.address.road}`;
          }
        });
        res.json([...new Set(addresses)].sort());
      })
      .catch((err) => console.log(err));
  },
  getAllCountries: (res) => {
    countryStateCity
      .get("/countries")
      .then((resp) => {
        res.json(
          resp.data.map((country) => {
            return {
              name: country.name,
              abbr: country.iso2,
            };
          })
        );
      })
      .catch((err) => console.log(err));
  },
  getCountry: (res, abbr) => {
    countryStateCity
      .get(`/countries/${abbr}`)
      .then((resp) => {
        res.json({
          name: resp.data.name,
          abbr: resp.data.iso2,
        });
      })
      .catch((err) => console.log(err));
  },
  getAllStates: (res) => {
    countryStateCity
      .get("/states")
      .then((resp) => {
        res.json(stateCleanUp(resp.data));
      })
      .catch((err) => console.log(err));
  },
  getStatesByCountry: (res, cntyAbbr) => {
    countryStateCity
      .get(`/countries/${cntyAbbr}/states`)
      .then((resp) => {
        res.json(stateCleanUp(resp.data, cntyAbbr));
      })
      .catch((err) => console.log(err));
  },
  getStatesByZipPostalCode: (res, cntyAbbr, zipPostal) => {
    zippopotam
      .get(`/${cntyAbbr}/${zipPostal}`)
      .then((resp) => {
        res.json(
          resp.data.places
            .sort((a, b) => a.state.localeCompare(b.state))
            .map((place) => {
              return {
                name: place.state,
                abbr: place["state abbreviation"],
                country: resp.data["country abbreviation"],
              };
            })
        );
      })
      .catch((err) => console.log(err));
  },
  getState: (res, cntyAbbr, stAbbr) => {
    countryStateCity
      .get(`/countries/${cntyAbbr}/states/${stAbbr}`)
      .then((resp) => {
        res.json({
          name: resp.data.name,
          abbr: resp.data.iso2,
          country: resp.data.country_code,
        });
      })
      .catch((err) => console.log(err));
  },
  getCitiesByCountry: (res, cntyAbbr) => {
    countryStateCity
      .get(`/countries/${cntyAbbr}/cities`)
      .then((resp) => {
        res.json(cityCleanUp(resp.data, cntyAbbr));
      })
      .catch((err) => console.log(err));
  },
  getCitiesByState: (res, cntyAbbr, stAbbr) => {
    countryStateCity
      .get(`/countries/${cntyAbbr}/states/${stAbbr}/cities`)
      .then((resp) => {
        res.json(cityCleanUp(resp.data, cntyAbbr, stAbbr));
      })
      .catch((err) => console.log(err));
  },
  getCitiesByZipPostalCode: (res, cntyAbbr, zipPostal) => {
    zippopotam
      .get(`/${cntyAbbr}/${zipPostal}`)
      .then((resp) => {
        res.json(
          resp.data.places
            .sort((a, b) => a["place name"].localeCompare(b["place name"]))
            .map((place) => {
              return {
                name: place["place name"],
                state: place["state abbreviation"],
                country: cntyAbbr.toUpperCase(),
              };
            })
        );
      })
      .catch((err) => console.log(err));
  },
  getZipPostalCodes: (res, cntyAbbr, stAbbr, city) => {
    zippopotam
      .get(`/${cntyAbbr}/${stAbbr}/${city}`)
      .then((resp) => {
        if (resp.data.places) {
          res.json(resp.data.places.map((place) => place["post code"]));
        } else {
          res.json([]);
        }
      })
      .catch((err) => console.log(err));
  },
};

module.exports = locations;
