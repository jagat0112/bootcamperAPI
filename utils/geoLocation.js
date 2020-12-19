const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "mapquest",
  httpAdapter: "https",
  apiKey: "YnSS2K8YQg35L9qzf0vyUzcRG4CHSzXM",
  formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
