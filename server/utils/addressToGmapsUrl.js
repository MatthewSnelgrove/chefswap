import * as dotenv from "dotenv";
dotenv.config();
export default function (address) {
  const { address1, address2, address3, city, province } = address;
  const addressString = `${address1} ${address2} ${address3}, ${city}, ${province}`;
  addressString.replace(/\s+/g, "+");
  return `https://maps.googleapis.com/maps/api/geocode/json?address=${addressString}&key=${process.env.GMAPS_KEY}`;
}
