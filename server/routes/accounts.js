import express from "express";
import { pool } from "../configServices/dbConfig.js";
import camelize from "camelize";
import bcrypt from "bcryptjs";
import { generateImageLink } from "../utils/imageHelpers.js";
import validateRegistrationData from "../middlewares/validateRegistrationData.js";
import fetch from "node-fetch";
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateAddress,
  validateBio,
  validateImageName,
  validateCircleRadius,
} from "../utils/dataValidation.js";
import slugid from "slugid";
import addressToGmapsUrl from "../utils/addressToGmapsUrl.js";
import checkAuth from "../middlewares/checkAuth.js";
import slugToUuid from "../utils/slugToUuid.js";
import { uploadHandler } from "../utils/imageHelpers.js";
import uuid4 from "uuid4";
import { bucket } from "../configServices/cloudStorageConfig.js";
import { computeDestinationPoint, getBoundsOfDistance } from "geolib";
export const router = express.Router();
import {
  NoAccountError,
  InvalidSlugError,
  MissingRequiredFieldError,
} from "../error.js";
import { validateUsername2 } from "../middlewares/dataValidation.js";

/**
 * get public data for all accounts
 */
router.get("/", async (req, res, next) => {
  const {
    username,
    maxDistanceFrom,
    minRating,
    maxRating,
    cuisinePreference,
    cuisineSpeciality,
  } = req.query;
  const queryString = `WITH account_image AS (
                        SELECT account_uid, 
                        json_agg(
                          json_build_object(
                            'image_name',image_name, 
                            'timestamp', timestamp
                          )
                        ) AS images
                        FROM image JOIN account USING (account_uid)
                        GROUP BY account_uid
                      ), account_cuisine_preference AS (
                        SELECT account_uid, 
                        json_agg(preference) AS preferences
                        FROM cuisine_preference JOIN account USING (account_uid)
                        GROUP BY account_uid
                      ), account_cuisine_speciality AS (
                        SELECT account_uid, 
                        json_agg(speciality) AS specialities
                        FROM cuisine_speciality JOIN account USING (account_uid)
                        GROUP BY account_uid
                      )
                      SELECT 
                        json_build_object(
                          'account_uid', account.account_uid, 
                          'username', account.username, 
                          'create_time', account.create_time, 
                          'update_time', account.update_time, 
                          'bio', account.bio, 
                          'pfp_name', account.pfp_name, 
                          'avg_rating', account.avg_rating, 
                          'num_ratings', account.num_ratings, 
                          'circle', json_build_object(
                            'circle_uid', circle.circle_uid, 
                            'radius', circle.radius, 
                            'latitude', circle.latitude,
                            'longitude', circle.longitude
                          ),
                          'images', account_image.images,
                          'cuisine_preferences', account_cuisine_preference.preferences,
                          'cuisine_specialities', account_cuisine_speciality.specialities
                        ) public 
                        FROM account 
                        LEFT JOIN circle USING (circle_uid)
                        LEFT JOIN account_image USING (account_uid)
                        LEFT JOIN account_cuisine_preference USING (account_uid)
                        LEFT JOIN account_cuisine_speciality USING (account_uid)`;
  let filterString = ``;
  let numParams = 0;
  let paramArray = [];
  //filter by username
  if (username) {
    numParams++;
    filterString += filterString
      ? ` AND username = $${numParams} `
      : ` WHERE username = $${numParams} `;
    paramArray.push(username);
  }
  // filter by distance from location
  if (
    maxDistanceFrom &&
    maxDistanceFrom.distance &&
    maxDistanceFrom.latitude &&
    maxDistanceFrom.longitude
  ) {
    //gets min/max lat/long of square circumscribed over circle of radius distance
    const geoBounds = getBoundsOfDistance(
      {
        latitude: maxDistanceFrom.latitude,
        longitude: maxDistanceFrom.longitude,
      },
      maxDistanceFrom.distance
    );
    numParams += 4;
    filterString += filterString
      ? ` AND circle.latitude>$${numParams - 3} 
      AND circle.latitude<$${numParams - 2} 
      AND circle.longitude>$${numParams - 1} 
      AND circle.longitude<$${numParams} `
      : ` WHERE circle.latitude>$${numParams - 3} 
      AND circle.latitude<$${numParams - 2} 
      AND circle.longitude>$${numParams - 1} 
      AND circle.longitude<$${numParams} `;
    paramArray.push(
      geoBounds[0].latitude,
      geoBounds[1].latitude,
      geoBounds[0].longitude,
      geoBounds[1].longitude
    );
  }
  if (minRating) {
    numParams++;
    filterString += filterString
      ? ` AND account.avg_rating>=$${numParams} `
      : ` WHERE account.avg_rating>=$${numParams} `;
    paramArray.push(minRating);
  }
  if (maxRating) {
    numParams++;
    filterString += filterString
      ? ` AND account.avg_rating<=$${numParams} `
      : ` WHERE account.avg_rating<=$${numParams} `;
    paramArray.push(maxRating);
  }
  if (cuisinePreference) {
    const prefArr = [].concat(cuisinePreference);
    filterString += filterString ? " AND (" : " WHERE (";
    let flag = false;
    for (const preference of prefArr) {
      numParams++;
      filterString += flag
        ? ` OR (account_cuisine_preference.preferences)::jsonb ? $${numParams} `
        : ` (account_cuisine_preference.preferences)::jsonb ? $${numParams} `;
      paramArray.push(preference);
      flag = true;
    }
    filterString += ")";
  }
  if (cuisineSpeciality) {
    if (Array.isArray(cuisineSpeciality)) {
      for (const speciality of cuisineSpeciality) {
        numParams++;
        filterString += filterString
          ? ` AND (account_cuisine_speciality.specialities)::jsonb ? $${numParams} `
          : ` WHERE (account_cuisine_speciality.specialities)::jsonb ? $${numParams} `;
        paramArray.push(speciality);
      }
    } else {
      numParams++;
      filterString += filterString
        ? ` AND (account_cuisine_speciality.specialities)::jsonb ? $${numParams} `
        : ` WHERE (account_cuisine_speciality.specialities)::jsonb ? $${numParams} `;
      paramArray.push(cuisineSpeciality);
    }
  }
  console.log(filterString, paramArray);
  const accounts = camelize(
    await pool.query(`${queryString} ${filterString}`, paramArray)
  ).rows;
  for (const account in accounts) {
    await formatAccountData(accounts[account]);
  }
  res.status(200).json(accounts);
});

/**
 * DOES NOT LOG NEW USER IN
 * expects username, email, password, and address fields in req
 * address should have fields address1, city, province, postalCode, and optional fields address2, address3
 * validates data
 * if valid, creates account and creates session for user
 * if invalid, sets field invalidFIELD to true where FIELD is username, password, email, address1,
 * city, province, or postalCode. also sets usernameTaken and emailTaken to true if username/email taken
 */
router.post("/", validateRegistrationData, async (req, res, next) => {
  const { username, email, password, address } = req.body;
  const { address1, address2, address3, city, province, postalCode } = address;
  const url = addressToGmapsUrl(address);
  const response = await fetch(url);
  const location = (await response.json()).results[0].geometry.location;
  const passhash = await bcrypt.hash(password, 12);
  const addressUid = camelize(
    await pool.query(
      `INSERT INTO address(
        address1, 
        address2, 
        address3, 
        city, 
        province, 
        postal_code, 
        latitude, 
        longitude) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING address_uid`,
      [
        address1,
        address2,
        address3,
        city,
        province,
        postalCode,
        location.lat,
        location.lng,
      ]
    )
  ).rows[0].addressUid;

  const account = camelize(
    await pool.query(
      `BEGIN

      INSERT INTO account (username, email, address_uid, passhash)
     VALUES ($1, $2, $3, $4) RETURNING *`,
      [username, email, addressUid, passhash]
    )
  ).rows[0];
  await formatAccountData(account);
  res.status(201).json(account);
});

/**
 * if signed authenticated with requested account, return all data about account
 * otherwise, return only public data
 */
router.get("/:slug", async (req, res) => {
  const accountUid = slugToUuid(req.params.slug);
  if (!accountUid) {
    res.status(400).json(new InvalidSlugError());
    return;
  }
  //return all data
  if (req.session.accountUid === accountUid) {
    const account = camelize(
      await pool.query(
        ` SELECT 
            json_build_object(
              'account_uid', account.account_uid, 
              'username', account.username, 
              'create_time', account.create_time, 
              'update_time', account.update_time, 
              'bio', account.bio, 
              'pfp_name', account.pfp_name, 
              'avg_rating', account.avg_rating, 
              'num_ratings', account.num_ratings, 
              'circle', json_build_object(
                'circle_uid', circle.circle_uid, 
                'radius', circle.radius, 
                'latitude', circle.latitude,
                'longitude', circle.longitude
              )
            ) public, 
            account.email, 
            json_build_object(
              'address_uid', address_uid, 
              'address1', address.address1, 
              'address2', address.address2, 
              'address3', address3, 
              'city', address.city, 
              'province', address.province, 
              'postal_code', address.postal_code,
              'latitude', address.latitude,
              'longitude', address.longitude
            ) address 
            FROM account 
            JOIN address USING (address_uid) 
            LEFT JOIN circle USING (circle_uid) 
            WHERE account_uid=$1`,
        [accountUid]
      )
    ).rows[0];
    //no account matching accountUid
    if (!account) {
      res.status(404).json(new NoAccountError());
      return;
    }
    await formatAccountData(account);
    res.status(200).json(account);
  } else {
    //return only public data
    const account = camelize(
      await pool.query(
        ` SELECT 
            json_build_object(
              'account_uid', account.account_uid, 
              'username', account.username, 
              'create_time', account.create_time, 
              'update_time', account.update_time, 
              'bio', account.bio, 
              'pfp_name', account.pfp_name, 
              'avg_rating', account.avg_rating, 
              'num_ratings', account.num_ratings, 
              'circle', json_build_object(
                'circle.circle_uid', circle.circle_uid, 
                'circle.radius', circle.radius, 
                'circle.latitude', circle.latitude,
                'circle.longitude', circle.longitude
              )
            ) public
            FROM account 
            LEFT JOIN circle USING (circle_uid) 
            WHERE account_uid=$1`,
        [accountUid]
      )
    ).rows[0];
    //no account that accountUid
    if (!account) {
      res.status(404).json(new NoAccountError());
      return;
    }
    await formatAccountData(account);
    res.status(200).json(account);
  }
});

/**
 * return username associated with accountUid
 */
router.get("/:slug/username", async (req, res) => {
  await getSingleFieldFromAccount(req, res, "username");
});

/**
 * if authenticated with requested account, update username if available
 */
router.put(
  "/:slug/username",
  checkAuth,
  validateUsername2,
  async (req, res) => {
    await setSingleFieldInAccount(req, res, "username");
  }
);

/**
 * return email associated with accountUid. requires authentication
 */
router.get("/:slug/email", checkAuth, async (req, res) => {
  await getSingleFieldFromAccount(req, res, "email");
});

/**
 * if authenticated with requested account, update email if available
 */
router.put("/:slug/email", checkAuth, async (req, res) => {
  const error = {};
  await validateEmail(req.body.email, error);
  if (Object.keys(error).length) {
    res.status(400).json(error);
    return;
  }
  await setSingleFieldInAccount(req, res, "email");
});

/**
 * if authenticated with requested account, update password
 */
router.put("/:slug/password", checkAuth, async (req, res) => {
  const error = {};
  validatePassword(req.body.password, error);
  if (Object.keys(error).length) {
    res.status(400).json(error);
    return;
  }
  req.body.passhash = await bcrypt.hash(req.body.password, 12);
  await setSingleFieldInAccount(req, res, "passhash");
});

/**
 * return address associated with accountUid. requires authentication
 */
router.get("/:slug/address", checkAuth, async (req, res) => {
  const accountUid = slugToUuid(req.params.slug);
  if (!accountUid) {
    res.status(400).json({ error: "invalid slug" });
  }
  const address = (
    await pool.query(
      `SELECT address.* 
        FROM account
        JOIN address USING (address_uid) 
        WHERE account_uid=$1`,
      [accountUid]
    )
  ).rows[0];
  //no account with that accountUid
  if (!address) {
    res.sendStatus(404);
    return;
  }
  //replace addressUid with slug
  const addressUid = address.addressUid;
  delete address.addressUid;
  address.slug = slugid.encode(addressUid);
  res.status(200).json(address);
});

/**
 * if authenticated with requested account, update address if valid
 */
router.put("/:slug/address", checkAuth, async (req, res) => {
  const accountUid = slugToUuid(req.params.slug);
  if (!accountUid) {
    res.status(400).json({ error: "invalid slug" });
  }
  const address = req.body.address;
  const error = {};
  validateAddress(address, error);
  if (Object.keys(error).length) {
    res.status(400).json(error);
    return;
  }
  const url = addressToGmapsUrl(address);
  const response = await fetch(url);
  const location = (await response.json()).results[0].geometry.location;
  const newAddress = camelize(
    await pool.query(
      `UPDATE address 
        SET address1=$1, 
        address2=$2, 
        address3=$3, 
        city=$4, 
        province=$5, 
        postal_code=$6,
        latitude=$7,
        longitude=$8
        FROM account
        WHERE account.address_uid=address.address_uid AND account.account_uid=$9
        RETURNING address.*`,
      [
        address.address1,
        address.address2,
        address.address3,
        address.city,
        address.province,
        address.postalCode,
        location.lat,
        location.lng,
        accountUid,
      ]
    )
  ).rows[0];
  //no account with that accountUid
  if (!newAddress) {
    res.sendStatus(404);
    return;
  }
  //replace addressUid with slug
  const addressUid = newAddress.addressUid;
  delete newAddress.addressUid;
  newAddress.slug = slugid.encode(addressUid);
  res.status(200).json(newAddress);
});

/**
 * return bio associated with accountUid
 */
router.get("/:slug/bio", async (req, res) => {
  await getSingleFieldFromAccount(req, res, "bio");
});

router.put("/:slug/bio", checkAuth, async (req, res) => {
  const error = {};
  validateBio(req.body.bio, error);
  if (Object.keys(error).length) {
    res.status(400).json(error);
    return;
  }
  await setSingleFieldInAccount(req, res, "bio");
});

/**
 * return circle associated with accountUid
 */
router.get("/:slug/circle", async (req, res) => {
  const accountUid = slugToUuid(req.params.slug);
  if (!accountUid) {
    res.send(400).json({ error: "invalid slug" });
    return;
  }
  const circle = camelize(
    await pool.query(
      `SELECT circle.* 
        FROM account
        JOIN circle USING (circle_uid)
        WHERE account_uid=$1`,
      [accountUid]
    )
  ).rows[0];
  //no account with that accountUid
  if (!circle) {
    res.sendStatus(404);
    return;
  }
  //replace circleUid with slug
  const circleUid = circle.circleUid;
  delete circle.circleUid;
  circle.slug = slugid.encode(circleUid);
  res.status(200).json(circle);
});

/**
 * creates/updates user's circle.
 * requires radius field representing radius of circle in metres with 50<=radius<=3000
 */
router.post("/:slug/circle", checkAuth, async (req, res) => {
  const accountUid = slugToUuid(req.params.slug);
  if (!accountUid) {
    res.send(400).json({ error: "invalid slug" });
    return;
  }
  const radius = req.body.radius;
  const error = {};
  validateCircleRadius(radius, error);
  if (Object.keys(error).length) {
    res.status(400).json(error);
    return;
  }
  const position = camelize(
    await pool.query(
      `SELECT account.circle_uid, address.latitude, address.longitude 
      FROM account 
      JOIN address USING (address_uid) 
      WHERE account_uid=$1`,
      [accountUid]
    )
  ).rows[0];
  const circleCentre = computeDestinationPoint(
    {
      latitude: position.latitude,
      longitude: position.longitude,
    },
    //multiply radius by sqrt of random number from 0-1 to prevent clumping around centre
    Math.sqrt(Math.random()) * radius,
    Math.random() * 360
  );
  if (position.circleUid) {
    const circle = camelize(
      await pool.query(
        `UPDATE circle 
        SET radius=$1, latitude=$2, longitude=$3
        WHERE circle_uid=$4
        RETURNING *`,
        [
          radius,
          circleCentre.latitude,
          circleCentre.longitude,
          position.circleUid,
        ]
      )
    ).rows[0];
    //replace circleUid with slug
    const circleUid = circle.circleUid;
    delete circle.circleUid;
    circle.slug = slugid.encode(circleUid);
    res.status(200).json(circle);
  } else {
    const circle = camelize(
      await pool.query(
        `INSERT INTO circle (radius, latitude, longitude) 
        VALUES ($1, $2, $3)
        RETURNING *`,
        [radius, position.latitude, position.longitude]
      )
    ).rows[0];
    await pool.query(`UPDATE account SET circle_uid=$1 WHERE account_uid=$2`, [
      circle.circleUid,
      accountUid,
    ]);
    //replace circleUid with slug
    const circleUid = circle.circleUid;
    delete circle.circleUid;
    circle.slug = slugid.encode(circleUid);
    res.status(201).json(circle);
  }
});

/**
 * return pfp associated with accountUid
 */
router.get("/:slug/pfp", async (req, res) => {
  const accountUid = slugToUuid(req.params.slug);
  if (!accountUid) {
    res.send(400).json({ error: "invalid slug" });
    return;
  }
  const query = camelize(
    await pool.query(
      `SELECT pfp_name 
        FROM account
        WHERE account_uid=$1`,
      [accountUid]
    )
  ).rows[0];
  //no account with that accountUid
  if (!query) {
    res.sendStatus(404);
    return;
  }
  query.pfpLink = generateImageLink(query.pfpName);
  res.status(200).json(query);
});

router.put(
  "/:slug/pfp",
  checkAuth,
  uploadHandler.single("file"),
  async (req, res) => {
    const accountUid = slugToUuid(req.params.slug);
    const imageName = req.file.originalname;
    const error = {};
    validateImageName(imageName, error);
    if (Object.keys(error).length) {
      res.status(400).send("image must be a .png, .jpg, or .jpeg");
      return;
    }
    const blob = bucket.file(uuid4() + imageName);
    const blobStream = blob.createWriteStream();
    blobStream.on("error", (err) => console.log(err));
    blobStream.on("finish", async () => {
      await pool.query(`UPDATE account SET pfp_name=$1 WHERE account_uid=$2`, [
        blob.name,
        accountUid,
      ]);
    });
    blobStream.end(req.file.buffer);
    res
      .status(201)
      .json({ pfpName: blob.name, pfpLink: generateImageLink(blob.name) });
  }
);

/**
 * return gallery associated with accountUid
 */
router.get("/:slug/gallery", async (req, res) => {
  const accountUid = slugToUuid(req.params.slug);
  if (!accountUid) {
    res.send(400).json({ error: "invalid slug" });
    return;
  }
  const images = camelize(
    await pool.query(
      `SELECT * 
        FROM image
        WHERE account_uid=$1`,
      [accountUid]
    )
  ).rows;
  //no account with that accountUid
  if (!images) {
    res.sendStatus(404);
    return;
  }
  //replace imageName with imageLink and imageUid with slug
  Object.keys(images).forEach((key) => {
    images[key].imageLink = generateImageLink(images[key].imageName);
    const imageUid = images[key].imageUid;
    delete images.key.imageUid;
    images.key.slug = slugid.encode(imageUid);
  });
  res.status(200).json(images);
});

/**
 * add image to user's gallery
 */
router.post(
  "/:slug/gallery",
  checkAuth,
  uploadHandler.single("file"),
  async (req, res) => {
    const accountUid = slugToUuid(req.params.slug);
    const imageName = req.file.originalname;
    const error = {};
    validateImageName(imageName, error);
    if (Object.keys(error).length) {
      res.status(400).send("image must be a .png, .jpg, or .jpeg");
      return;
    }
    const blob = bucket.file(uuid4() + imageName);
    const blobStream = blob.createWriteStream();
    blobStream.on("error", (err) => console.log(err));
    blobStream.on("finish", async () => {
      const image = camelize(
        await pool.query(
          `INSERT INTO image (account_uid, image_name)
          VALUES ($1, $2) 
          RETURNING *`,
          [accountUid, blob.name]
        )
      ).rows[0];
      image.imageLink = generateImageLink(image.imageName);
      //replace imageUid with slug
      const imageUid = image.imageUid;
      delete image.imageUid;
      image.slug = slugid.encode(imageUid);
      res.status(201).json(image);
    });
    blobStream.end(req.file.buffer);
  }
);

/**
 * delete image from user's gallery
 */
router.delete("/:slug/gallery/:imageUid", checkAuth, async (req, res) => {
  const imageUid = req.params.imageUid;
  const image = camelize(
    await pool.query(`DELETE FROM image WHERE image_uid=$1 RETURNING *`, [
      imageUid,
    ])
  ).rows[0];
  if (!image) {
    res.status(400).send(`no image with uid ${imageUid}`);
    return;
  }
  await bucket.file(image.imageName).delete();
  res.sendStatus(204);
});

/**
 * return rating associated with accountUid
 */
router.get("/:slug/rating", async (req, res) => {
  const accountUid = slugToUuid(req.params.slug);
  if (!accountUid) {
    res.send(400).json({ error: "invalid slug" });
    return;
  }
  const query = camelize(
    await pool.query(
      `SELECT avg_rating, num_ratings 
        FROM account
        WHERE account_uid=$1`,
      [accountUid]
    )
  ).rows[0];
  //no account with that accountUid
  if (!query) {
    res.sendStatus(404);
    return;
  }
  res.status(200).json(query);
});

async function getSingleFieldFromAccount(req, res, field) {
  const accountUid = slugToUuid(req.params.slug);
  if (!accountUid) {
    res.send(400).json({ error: "invalid slug" });
    return;
  }
  const query = (
    await pool.query(
      `SELECT ${field} 
        FROM account
        WHERE account_uid=$1`,
      [accountUid]
    )
  ).rows[0];
  //no account with that accountUid
  if (!query) {
    res.sendStatus(404);
    return;
  }
  res.status(200).json(query[field]);
}

async function setSingleFieldInAccount(req, res, field) {
  const accountUid = slugToUuid(req.params.slug);
  if (!accountUid) {
    res.status(400).json(new InvalidSlugError());
    return;
  }
  const value = req.body[field];
  if (!value) {
    res.status(400).json(new MissingRequiredFieldError(field));
    return;
  }
  const query = (
    await pool.query(
      `UPDATE account 
        SET ${field}=$1
        WHERE account_uid=$2
        RETURNING account_uid`,
      [value, accountUid]
    )
  ).rows[0];
  if (!query) {
    res.status(404).json(new NoAccountError());
    return;
  }
  res.status(200).json(value);
}

/**
 * replaces accountUid with slug adds and formats images, cuisine spec/pref, addressUid with slug
 * if part of account, circleUid to slug, sets circle to null if fields don't exist
 */
async function formatAccountData(account) {
  //replace accountUid with slug
  const accountUid = account.public.accountUid;
  delete account.public.accountUid;
  account.public.accountSlug = slugid.encode(accountUid);
  //generate gcs link from file name
  if (account.public.pfpName) {
    account.public.pfpLink = generateImageLink(account.public.pfpName);
    delete account.public.pfpLink;
  }
  const images = camelize(
    await pool.query(
      `SELECT * 
        FROM image 
        WHERE account_uid=$1`,
      [accountUid]
    )
  ).rows;
  //replace imageName with imageLink and imageUid with slug
  Object.keys(images).forEach((key) => {
    images[key].imageLink = generateImageLink(images[key].imageName);
    delete images[key].imageName;
    images[key].imageSlug = slugid.encode(images[key].imageUid);
    delete images[key].imageUid;
  });
  account.public.images = images;
  if (!account.public.circle.circleUid) {
    account.public.circle = null;
  } else {
    account.public.circle.circleSlug = slugid.encode(
      account.public.circle.circleUid
    );
    delete account.public.circle.circleUid;
  }
  const cuisinePreferences = camelize(
    await pool.query(
      `SELECT preference 
        FROM cuisine_preference 
        WHERE account_uid=$1`,
      [accountUid]
    )
  ).rows.map((pref) => pref.preference);
  const cuisineSpecialities = camelize(
    await pool.query(
      `SELECT speciality 
        FROM cuisine_speciality 
        WHERE account_uid=$1`,
      [accountUid]
    )
  ).rows.map((spec) => spec.speciality);
  account.public.cuisinePreferences = cuisinePreferences;
  account.public.cuisineSpecialities = cuisineSpecialities;
  if (account.address) {
    const addressUid = account.address.addressUid;
    account.address.slug = slugid.encode(addressUid);
    delete account.address.addressUid;
  }
}
