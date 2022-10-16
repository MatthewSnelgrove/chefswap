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
import { NotFound } from "express-openapi-validator/dist/openapi.validator.js";
import { accountProfileQuery, accountQuery } from "../utils/queryHelpers.js";

const accountNotFound = {
  status: 404,
  message: "account not found",
  detail: "account with specified accountUid not found",
};
/**
 * get profile data for all accounts
 */
router.get("/", async (req, res, next) => {
  const {
    username,
    includeDistanceFrom,
    maxDistance,
    minRating,
    maxRating,
    cuisinePreference,
    cuisineSpeciality,
    orderBy,
    key,
    limit,
  } = req.query;
  const queryString = accountProfileQuery(includeDistanceFrom);
  let filterString = ``;
  let numParams = includeDistanceFrom ? 2 : 0;
  let paramArray = [];
  if (includeDistanceFrom) {
    paramArray.push(
      includeDistanceFrom.longitude,
      includeDistanceFrom.latitude
    );
  }

  //filter by username
  if (username) {
    numParams++;
    filterString += filterString
      ? ` AND username = $${numParams} `
      : ` WHERE username = $${numParams} `;
    paramArray.push(username);
  }
  //must also have 'includeDistanceFrom' query param
  //filter by distance from location specified in 'includeDistannceFrom' to centre of accounts' circles
  if (maxDistance && includeDistanceFrom) {
    numParams++;
    filterString += filterString
      ? ` AND distance <= $${numParams} `
      : ` WHERE distance <= $${numParams} `;
    paramArray.push(maxDistance);
  }
  if (minRating) {
    numParams++;
    filterString += filterString
      ? ` AND account.avg_rating >= $${numParams} `
      : ` WHERE account.avg_rating >= $${numParams} `;
    paramArray.push(minRating);
  }
  if (maxRating) {
    numParams++;
    filterString += filterString
      ? ` AND account.avg_rating <= $${numParams} `
      : ` WHERE account.avg_rating <= $${numParams} `;
    paramArray.push(maxRating);
  }
  if (cuisinePreference) {
    //Create array of 1 or many preferences
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
  if (key) {
    if (key.distance) {
      switch (orderBy) {
        case "distanceAsc":
          numParams += 2;
          paramArray.push(key.distance, key.accountUid);
          filterString += filterString
            ? ` AND (distance > $${numParams - 1} OR (distance = $${
                numParams - 1
              } AND account_uid > $${numParams}))`
            : ` WHERE (distance > $${numParams - 1} OR (distance = $${
                numParams - 1
              } AND account_uid > $${numParams}))`;
        case "distanceDesc":
          numParams += 2;
          paramArray.push(key.distance, key.accountUid);
          filterString += filterString
            ? ` AND (distance < $${numParams - 1} OR (distance = $${
                numParams - 1
              } AND account_uid > $${numParams}))`
            : ` WHERE (distance < $${numParams - 1} OR (distance = $${
                numParams - 1
              } AND account_uid > $${numParams}))`;
        default:
          next({
            status: 400,
            message: "invalid query",
            detail: `query param orderBy must equal 'distance' to paginate by distance`,
          });
          return;
      }
    }
    if (key.avgRating) {
      switch (orderBy) {
        case "avgRatingAsc":
          numParams += 2;
          paramArray.push(key.rating, key.accountUid);
          filterString += filterString
            ? ` AND (avg_rating > $${numParams - 1} OR (avg_rating = $${
                numParams - 1
              } AND account_uid > $${numParams}))`
            : ` WHERE (avg_rating > $${numParams - 1} OR (avg_rating = $${
                numParams - 1
              } AND account_uid > $${numParams}))`;
        case "avgRatingDesc":
          numParams += 2;
          paramArray.push(key.rating, key.accountUid);
          filterString += filterString
            ? ` AND (avg_rating < $${numParams - 1} OR (avg_rating = $${
                numParams - 1
              } AND account_uid > $${numParams}))`
            : ` WHERE (avg_rating < $${numParams - 1} OR (avg_rating = $${
                numParams - 1
              } AND account_uid > $${numParams}))`;
        default:
          next({
            status: 400,
            message: "invalid query",
            detail: `query param orderBy must equal 'avgRating' to paginate by avgRating`,
          });
          return;
      }
    }
  }
  if (cuisineSpeciality) {
    //Create array of 1 or many specialities
    const specArr = [].concat(cuisineSpeciality);
    filterString += filterString ? " AND (" : " WHERE (";
    let flag = false;
    for (const speciality of prefArr) {
      numParams++;
      filterString += flag
        ? ` OR (account_cuisine_speciality.specialities)::jsonb ? $${numParams} `
        : ` (account_cuisine_speciality.specialities)::jsonb ? $${numParams} `;
      paramArray.push(speciality);
      flag = true;
    }
    filterString += ")";
  }
  // console.log(queryString, filterString, paramArray);
  let orderString = "";
  switch (orderBy) {
    case "avgRatingAsc":
      orderString = ` ORDER BY account.avg_rating, account.account_uid `;
      break;
    case "avgRatingDesc":
      orderString = ` ORDER BY account.avg_rating DESC, account.account_uid `;
      break;
    case "distanceAsc":
      //query must have includeDistanceFrom query param to order by distance
      if (includeDistanceFrom) {
        orderString = ` ORDER BY distance.distance, account.account_uid`;
        break;
      } else {
        next({
          status: 400,
          message: "invalid query params",
          detail:
            "query params includeDistanceFrom[latitude] and includeDistanceFrom[longitude] are required to order by distance",
        });
        return;
      }
    case "distanceDesc":
      //query must have includeDistanceFrom query param to order by distance
      if (includeDistanceFrom) {
        orderString = ` ORDER BY distance.distance DESC, account.account_uid`;
        break;
      } else {
        next({
          status: 400,
          message: "invalid query params",
          detail:
            "query params includeDistanceFrom[latitude] and includeDistanceFrom[longitude] are required to order by distance",
        });
        return;
      }
    default:
      orderString = ` ORDER BY account.account_uid`;
  }
  numParams++;
  paramArray.push(limit);
  // console.log(
  //   `${queryString} ${filterString} ${orderString} LIMIT $${numParams}`,
  //   paramArray
  // );
  const accounts = camelize(
    await pool.query(
      `${queryString} ${filterString} ${orderString} LIMIT $${numParams}`,
      paramArray
    )
  ).rows;
  // console.log(accounts);
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
router.post("/", async (req, res, next) => {
  const { profile, email, password, address } = req.body;
  const { username, bio, circle } = profile;
  const radius = circle.radius;
  const { address1, address2, address3, city, province, postalCode } = address;
  const gmapsUrl = addressToGmapsUrl(address);
  const gmapsData = await fetch(gmapsUrl);
  const location = (await gmapsData.json()).results[0].geometry.location;
  const passhash = await bcrypt.hash(password, 12);
  await pool.query("BEGIN");
  const addressRes = camelize(
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
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
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
  ).rows[0];

  const circleCentre = generateCircleCentre(location.lat, location.lng, radius);
  const circleRes = camelize(
    await pool.query(
      `INSERT INTO circle( 
        latitude, 
        longitude, 
        radius) 
        VALUES($1, $2, $3) 
        RETURNING *`,
      [circleCentre.latitude, circleCentre.longitude, radius]
    )
  ).rows[0];
  const allAccountsRes = camelize(
    await pool
      .query(
        `INSERT INTO account (username, bio, circle_uid, email, passhash, address_uid)
          VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          username,
          bio,
          circleRes.circleUid,
          email,
          passhash,
          addressRes.addressUid,
        ]
      )
      .catch((e) => {
        switch (e.constraint) {
          case "account_username_key":
            next({
              staus: 409,
              message: "invalid username",
              detail: "username already exists",
            });
            return;
          case "account_email_key":
            next({
              status: 409,
              message: "invalid email",
              detail: "email already exists",
            });
            return;
          default:
            next({});
            return;
        }
      })
  );
  const accountRes = allAccountsRes ? allAccountsRes.rows[0] : null;
  if (accountRes) {
    await pool.query("COMMIT");
    const resBody = {
      proflie: {
        username: accountRes.username,
        createTime: accountRes.createTime,
        updateTime: accountRes.updateTime,
        bio: accountRes.bio,
        avgRating: accountRes.avgRating,
        numRatings: accountRes.numRatings,
        circle: circleRes,
        images: [],
        cuisinePreferences: [],
        cuisineSpecialities: [],
      },
      email: accountRes.email,
      address: addressRes,
    };
    res.status(201).json(resBody);
    return;
  }
  //should not happen
  next({});
});

/**
 * if signed authenticated with requested account, return all data about account
 * otherwise, return only profile data
 */
router.get("/:accountUid", async (req, res, next) => {
  const accountUid = req.params.accountUid;
  const includeDistanceFrom = req.query.includeDistanceFrom;
  //return all data
  if (req.session.accountUid === accountUid) {
    const account = camelize(
      await pool.query(
        `${accountQuery(includeDistanceFrom)} WHERE account.account_uid=$1`,
        [accountUid]
      )
    ).rows[0];
    //no account matching accountUid
    if (!account) {
      next(accountNotFound);
      return;
    }
    res.status(200).json(account);
  } else {
    //return only profile data
    console.log(accountProfileQuery(includeDistanceFrom));
    const account = camelize(
      await pool.query(
        `${accountProfileQuery(
          includeDistanceFrom
        )} WHERE account.account_uid=$1`,
        [accountUid]
      )
    ).rows[0];
    //no account that accountUid
    if (!account) {
      next(accountNotFound);
      return;
    }
    res.status(200).json(account);
  }
});

/**
 * return username associated with accountUid
 */
router.get("/:accountUid/username", async (req, res, next) => {
  await getSingleFieldFromAccount(req, res, "username");
});

/**
 * if authenticated with requested account, update username if available
 */
router.put("/:accountUid/username", checkAuth, async (req, res, next) => {
  await setSingleFieldInAccount(req, res, next, "username");
});

/**
 * return email associated with accountUid. requires authentication
 */
router.get("/:accountUid/email", checkAuth, async (req, res, next) => {
  await getSingleFieldFromAccount(req, res, "email");
});

/**
 * if authenticated with requested account, update email if available
 */
router.put("/:accountUid/email", checkAuth, async (req, res, next) => {
  await setSingleFieldInAccount(req, res, next, "email");
});

/**
 * if authenticated with requested account, update password
 */
router.put("/:accountUid/password", checkAuth, async (req, res, next) => {
  req.body.passhash = await bcrypt.hash(req.body.password, 12);
  await setSingleFieldInAccount(req, res, "passhash");
});

/**
 * return address associated with accountUid. requires authentication
 */
router.get("/:accountUid/address", checkAuth, async (req, res, next) => {
  const accountUid = req.params.accountUid;
  const address = (
    await pool.query(
      `SELECT 
        json_strip_nulls(
          json_build_object(
            'address1', address.address1,
            'address2', address.address2,
            'address3', address.address3,
            'city', address.city,
            'province', address.province,
            'postal_code', address.postal_code,
            'latitude', address.latitude,
            'longitude', address.longitude
          )
        ) address
        FROM account
        JOIN address USING (address_uid) 
        WHERE account_uid=$1`,
      [accountUid]
    )
  ).rows[0];
  //no account with that accountUid
  if (!address) {
    next(accountNotFound);
    return;
  }
  res.status(200).json(address);
});

/**
 * if authenticated with requested account, update address if valid
 */
router.put("/:accountUid/address", checkAuth, async (req, res, next) => {
  const accountUid = req.params.accountUid;
  const { address1, address2, address3, city, province, postalCode } =
    req.body.address;
  const gmapsRes = await fetch(addressToGmapsUrl(req.body.address));
  const location = (await gmapsRes.json()).results[0].geometry.location;
  const address = camelize(
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
        address1,
        address2,
        address3,
        city,
        province,
        postalCode,
        location.lat,
        location.lng,
        accountUid,
      ]
    )
  ).rows[0];
  //no account with that accountUid
  if (!address) {
    next(accountNotFound);
    return;
  }
  res.status(200).json(address);
});

/**
 * return bio associated with accountUid
 */
router.get("/:accountUid/bio", async (req, res, next) => {
  await getSingleFieldFromAccount(req, res, "bio");
});

router.put("/:accountUid/bio", checkAuth, async (req, res, next) => {
  await setSingleFieldInAccount(req, res, "bio");
});

/**
 * return circle associated with accountUid
 */
router.get("/:accountUid/circle", async (req, res, next) => {
  const accountUid = req.params.accountUid;
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
    next(accountNotFound);
    return;
  }
  res.status(200).json(circle);
});

/**
 * updates user's circle.
 * requires radius field representing radius of circle in metres with 50<=radius<=3000
 */
router.post("/:accountUid/circle", checkAuth, async (req, res, next) => {
  const accountUid = req.params.accountUid;
  const radius = req.body.radius;
  const position = camelize(
    await pool.query(
      `SELECT account.circle_uid, address.latitude, address.longitude 
      FROM account 
      JOIN address USING (address_uid) 
      WHERE account_uid=$1`,
      [accountUid]
    )
  ).rows[0];
  const circleCentre = generateCircleCentre(
    position.latitude,
    position.longitude,
    radius
  );
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
  res.status(200).json(circle);
});

/**
 * return pfp associated with accountUid
 */
router.get("/:accountUid/pfp", async (req, res, next) => {
  const accountUid = req.params.accountUid;
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
    next(accountNotFound);
    return;
  }
  res.status(200).json(generateImageLink(query.pfpName));
});

router.put(
  "/:accountUid/pfp",
  checkAuth,
  uploadHandler.single("file"),
  async (req, res, next) => {
    const accountUid = req.params.accountUid;
    const imageName = req.file.originalname;
    const blob = bucket.file(uuid4() + imageName);
    const blobStream = blob.createWriteStream();
    blobStream.on("error", (err) => {
      console.log(err);
      next({});
    });
    blobStream.on("finish", async () => {
      const oldImageName = (
        await pool.query(`SELECT pfp_name FROM account WHERE account_uid=$1`, [
          accountUid,
        ])
      ).rows[0].pfp_name;
      const pfp = camelize(
        await pool.query(
          `UPDATE account SET pfp_name=$1, update_time=now() WHERE account_uid=$2 RETURNING *`,
          [blob.name, accountUid]
        )
      ).rows[0];
      //delete old pfp from GCS
      if (oldImageName) {
        try {
          await bucket.file(oldImageName).delete();
        } catch (e) {
          console.log(e);
        }
      }
      res.status(201).json(generateImageLink(pfp.pfpName));
    });
    blobStream.end(req.file.buffer);
  }
);

/**
 * return images associated with accountUid
 */
router.get("/:accountUid/images", async (req, res, next) => {
  const accountUid = req.params.accountUid;
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
    next(accountNotFound);
    return;
  }
  //replace imageName with imageLink
  Object.keys(images).forEach((key) => {
    images[key].imageLink = generateImageLink(images[key].imageName);
  });
  res.status(200).json(images);
});

/**
 * add image to user's images
 */
router.post(
  "/:accountUid/images",
  checkAuth,
  uploadHandler.single("file"),
  async (req, res, next) => {
    const accountUid = req.params.accountUid;
    const imageName = req.file.originalname;
    const blob = bucket.file(uuid4() + imageName);
    const blobStream = blob.createWriteStream();
    blobStream.on("error", (err) => {
      console.log(err);
      next({});
    });
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
      res.status(201).json(image);
    });
    blobStream.end(req.file.buffer);
  }
);

/**
 * delete image from user's images
 */
router.delete(
  "/:accountUid/images/:imageUid",
  checkAuth,
  async (req, res, next) => {
    const imageUid = req.params.imageUid;
    const image = camelize(
      await pool.query(`DELETE FROM image WHERE image_uid=$1 RETURNING *`, [
        imageUid,
      ])
    ).rows[0];
    if (!image) {
      next({
        status: 404,
        message: "image not found",
        detail: "image with specified imageUid does not exist",
      });
      return;
    }
    await bucket.file(image.imageName).delete();
    res.sendStatus(204);
  }
);

/**
 * return rating associated with accountUid
 */
router.get("/:accountUid/rating", async (req, res, next) => {
  const accountUid = req.params.accountUid;
  const rating = camelize(
    await pool.query(
      `SELECT avg_rating, num_ratings 
        FROM account
        WHERE account_uid=$1`,
      [accountUid]
    )
  ).rows[0];
  //no account with that accountUid
  if (!rating) {
    next(accountNotFound);
    return;
  }
  res.status(200).json(rating);
});

async function getSingleFieldFromAccount(req, res, field) {
  const accountUid = req.params.accountUid;
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
    next(accountNotFound);
    return;
  }
  res.status(200).json(query[field]);
}

async function setSingleFieldInAccount(req, res, next, field) {
  const accountUid = req.params.accountUid;
  const value = req.body[field];
  console.log(req.body, field, req.body[field]);
  const allQueryRes = await pool
    .query(
      `UPDATE account 
        SET ${field}=$1, update_time=now()
        WHERE account_uid=$2
        RETURNING account_uid`,
      [value, accountUid]
    )
    .catch((e) => {
      switch (e.constraint) {
        case "account_username_key":
          next({
            staus: 409,
            message: "invalid username",
            detail: "username already exists",
          });
          return;
        case "account_email_key":
          next({
            status: 409,
            message: "invalid email",
            detail: "email already exists",
          });
          return;
        default:
          next({});
          return;
      }
    });
  const queryRes = allQueryRes ? allQueryRes.rows[0] : null;
  if (!queryRes) {
    next(accountNotFound);
    return;
  }
  res.status(200).json(value);
}

function generateCircleCentre(latitude, longitude, radius) {
  return computeDestinationPoint(
    {
      latitude: latitude,
      longitude: longitude,
    },
    //multiply radius by sqrt of random number from 0-1 to prevent clumping around centre
    Math.sqrt(Math.random()) * radius,
    Math.random() * 360
  );
}

// /**
//  * replaces accountUid with slug adds and formats images, cuisine spec/pref, addressUid with slug
//  * if part of account, circleUid to slug, sets circle to null if fields don't exist
//  */
// async function formatAccountData(account) {
//   //replace accountUid with slug
//   const accountUid = account.profile.accountUid;
//   delete account.profile.accountUid;
//   account.profile.accountSlug = slugid.encode(accountUid);
//   //generate gcs link from file name
//   if (account.profile.pfpName) {
//     account.profile.pfpLink = generateImageLink(account.profile.pfpName);
//     delete account.profile.pfpLink;
//   }
//   const images = camelize(
//     await pool.query(
//       `SELECT *
//         FROM image
//         WHERE account_uid=$1`,
//       [accountUid]
//     )
//   ).rows;
//   //replace imageName with imageLink and imageUid with slug
//   Object.keys(images).forEach((key) => {
//     images[key].imageLink = generateImageLink(images[key].imageName);
//     delete images[key].imageName;
//     images[key].imageSlug = slugid.encode(images[key].imageUid);
//     delete images[key].imageUid;
//   });
//   account.profile.images = images;
//   if (!account.profile.circle.circleUid) {
//     account.profile.circle = null;
//   } else {
//     account.profile.circle.circleSlug = slugid.encode(
//       account.profile.circle.circleUid
//     );
//     delete account.profile.circle.circleUid;
//   }
//   const cuisinePreferences = camelize(
//     await pool.query(
//       `SELECT preference
//         FROM cuisine_preference
//         WHERE account_uid=$1`,
//       [accountUid]
//     )
//   ).rows.map((pref) => pref.preference);
//   const cuisineSpecialities = camelize(
//     await pool.query(
//       `SELECT speciality
//         FROM cuisine_speciality
//         WHERE account_uid=$1`,
//       [accountUid]
//     )
//   ).rows.map((spec) => spec.speciality);
//   account.profile.cuisinePreferences = cuisinePreferences;
//   account.profile.cuisineSpecialities = cuisineSpecialities;
//   if (account.address) {
//     const addressUid = account.address.addressUid;
//     account.address.slug = slugid.encode(addressUid);
//     delete account.address.addressUid;
//   }
// }
