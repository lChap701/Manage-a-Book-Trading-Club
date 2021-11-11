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
 * Module for retrieving addresses, cities, states, countries, and zip code
 * @module ./routes/locations
 *
 */
const locations = {
  getAllAddresses: (q, cntyAbbr) => {
    let addresses = [];
    const TAGS = "building:house,building:apartment,building:dormitory";
    let url = `?key=${process.env.LOCATIONIQ_ACCESS_TOKEN}&q=${q}&limit=20&tag=${TAGS}`;

    if (cntyAbbr) {
      url += `&countrycodes=${cntyAbbr}`;
    }

    locationIq.get(url).then((res) => {
      console.log(JSON.stringify(res.data));
      addresses = res.data.map((obj) => {
        if (obj.hasOwnProperty("house_number")) {
          return `${obj.house_number} ${obj.road}`;
        } else if (obj.type == "apartment") {
          return `${obj.name} ${obj.road}`;
        }
      });
    });

    return addresses;
  },
  getAllCountries: () => {
    let countries = [];

    countryStateCity.get("/countries").then((res) => {
      countries = res.data
        .map((country) => {
          return {
            name: country.name,
            abbr: country.iso2,
          };
        })
        .catch((err) => console.log(err));
    });

    return countries;
  },
  getCountry: (abbr) => {
    let country = {};

    countryStateCity
      .get(`/countries/${abbr}`)
      .then((res) => {
        country = {
          name: res.data.name,
          abbr: res.data.iso2,
        };
      })
      .catch((err) => console.log(err));

    return country;
  },
  getAllStates: () => {
    let states = [];

    countryStateCity
      .get("/states")
      .then((res) => {
        states = res.data.map((state) => {
          return {
            name: state.name,
            abbr: state.iso2,
          };
        });
      })
      .catch((err) => console.log(err));

    return states;
  },
  getStatesByCountry: (cntyAbbr) => {
    let states = [];

    countryStateCity
      .get(`/countries/${cntyAbbr}/states`)
      .then((res) => {
        states = res.data.map((state) => {
          return {
            name: state.name,
            abbr: state.iso2,
            country: state.country_code,
          };
        });
      })
      .catch((err) => console.log(err));

    return states;
  },
  getStatesByZipPostalCode: (cntyAbbr, zipPostal) => {
    let states = [];

    zippopotam
      .get(`/${cntyAbbr}/${zipPostal}`)
      .then((res) => {
        states = res.data.places.map((place) => {
          return {
            state: place.state,
            abbr: place["state abbreviation"],
            country: res.data["country abbreviation"],
          };
        });
      })
      .catch((err) => console.log(err));

    return states;
  },
  getState: (cntyAbbr, stAbbr) => {
    let state = {};

    countryStateCity
      .get(`/countries/${cntyAbbr}/states/${stAbbr}`)
      .then((res) => {
        state = {
          name: res.data.name,
          abbr: res.data.iso2,
          country: res.data.country_code,
        };
      })
      .catch((err) => console.log(err));

    return state;
  },
  getCitiesByCountry: (cntyAbbr) => {
    let cities = [];

    countryStateCity
      .get(`/countries/${cntyAbbr}/cities`)
      .then((res) => {
        cities = res.data.map((city) => {
          return {
            name: city.name,
            state: city.state_code,
            country: city.country_code,
          };
        });
      })
      .catch((err) => console.log(err));

    return cities;
  },
  getCitiesByState: (cntyAbbr, stAbbr) => {
    let cities = [];

    countryStateCity
      .get(`/countries/${cntyAbbr}/states/${stAbbr}/cities`)
      .then((res) => {
        cities = res.data.map((city) => {
          return {
            name: city.name,
            state: city.state_code,
            country: city.country_code,
          };
        });
      })
      .catch((err) => console.log(err));

    return cities;
  },
  getCitiesByZipPostalCode: (cntyAbbr, zipPostal) => {
    let cities = [];

    zippopotam
      .get(`/${cntyAbbr}/${zipPostal}`)
      .then((res) => {
        cities = res.data.places.map((place) => {
          return {
            name: place["place name"],
            state: place["state abbreviation"],
            country: res.data["country abbreviation"],
          };
        });
      })
      .catch((err) => console.log(err));

    return cities;
  },
  getZipPostalCodes: (cntyAbbr, stAbbr, city) => {
    let zipPostal = [];

    zippopotam
      .get(`/${cntyAbbr}/${stAbbr}/${city}`)
      .then((res) => {
        zipPostal = res.data.places.map((place) => place["post code"]);
      })
      .catch((err) => console.log(err));

    return zipPostal;
  },
};

module.exports = locations;
