import * as dotenv from "dotenv";
dotenv.config();
export default function (address) {
  const { address1, address2, address3, city, province } = address;
  let addressString = `${address1} ${city} ${province}`;
  addressString = addressString.replace(/\s+/g, "%20");
  return `https://maps.googleapis.com/maps/api/geocode/json?address=${addressString}&key=${process.env.GMAPS_KEY}`;
}
