/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const request = require('request');

const fetchMyIP = function(callback) {
  const address = 'https://api.ipify.org?format=json';
  // use request to fetch IP address from JSON API
  request(address, (error, response, body) => {

    if (error) return callback(`Error: ${error}`, null);
    // data = JSON.parse(body);

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching IP: ${body}`), null);
      return;
    }
    const ip = JSON.parse(body).ip;

    return callback(null, ip);

  });
};
const fetchMyCoordsByIP = function(ip, callback) {
  const address = `http://ipwho.is/${ip}`;

  request(address, (error, response, body) => {
    if (error) return callback(`Error: ${error}`, null);

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching coordinates: ${body}`), null);
      return;
    }
    const data = JSON.parse(body);

    if (!data.success) {
      const message = `Success status was ${data.success}. Server message says: ${data.message} when fetching for IP ${data.ip}`;
      callback(Error(message), null);
      return;
    }
    const { latitude, longitude } = data;

    return callback(null, { latitude, longitude });
  });
};

const fetchISSFlyOverTimes = function(coords, callback) {
  const address = `https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(address, (error, response, body) => {
    if (error) return callback(`Error: ${error}`, null);

    if (body === 'invalide coordinates') return callback(`Error: invalid coordinates`, null);

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS passing times: ${body}`), null);
      return;
    }
    const flyOverTimes = JSON.parse(body).response;

    return callback(null, flyOverTimes);
  });
};

const nextISSTimesForMyLocation = callback => {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback("It didn't work!", error);

    }

    console.log('It worked! Returned IP:', ip);

    fetchMyCoordsByIP(ip, (error, data) => {
      if (error) {
        return callback("It didn't work!", error);
      }
      console.log(`my cooridnates are: ${data}`);

      fetchISSFlyOverTimes(data, (error, data) => {
        if (error) {
          return callback("It didn't work!", error);

        }
        callback(null, data);
      });
    });
  });

};

module.exports = { nextISSTimesForMyLocation }
// module.exports = { fetchMyIP, fetchMyCoordsByIP, fetchISSFlyOverTimes };

//JO/JJ/RK/JJ