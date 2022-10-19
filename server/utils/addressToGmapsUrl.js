import * as dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
export default function (address) {
  const { address1, city, province } = address;
  let addressString = `${address1} ${city} ${province}`;
  addressString = addressString.replace(/\s+/g, "%20");
  return `https://maps.googleapis.com/maps/api/geocode/json?address=${addressString}&key=${process.env.GMAPS_KEY}`;
}
