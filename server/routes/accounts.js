import express, { json } from "express";
import { pool } from "../configServices/dbConfig.js";
import camelize from "camelize";
import bcrypt from "bcryptjs";
import { generateImageLink } from "../utils/imageHelpers.js";
import fetch from "node-fetch";
import addressToGmapsUrl from "../utils/addressToGmapsUrl.js";
import checkAuth from "../middlewares/checkAuth.js";
import { uploadHandler } from "../utils/imageHelpers.js";
import uuid4 from "uuid4";
import { bucket } from "../configServices/cloudStorageConfig.js";
import { computeDestinationPoint } from "geolib";
export const router = express.Router();
import snakeize from "snakeize";
import { accountNotFound } from "../utils/errors.js";
import stripNulls from "../utils/stripNulls.js";
/**
 * get profile data for all accounts
 */
router.get("/", async (req, res, next) => {
  const {
    username,
    includeDistanceFrom = {},
    maxDistance,
    minRating,
    maxRating,
    cuisinePreference,
    cuisineSpeciality,
    matchableWith,
    orderBy,
    key = {
      accountUid: "00000000-0000-0000-0000-000000000000",
    },
    limit = 20,
  } = req.query;
  //validation too complicated for openapi spec
  if (
    //includeDistanceFrom.lat/lng will only be valid numbers or undefined due to openapi validation
    includeDistanceFrom.latitude === undefined ||
    includeDistanceFrom.longitude === undefined
  ) {
    if (maxDistance) {
      next({
        status: 400,
        message: "invalid query params",
        detail:
          "maxDistance is only valid if includeDistanceFrom is also specified",
      });
      return;
    }
    if (orderBy === "distanceAsc" || orderBy === "distanceDesc") {
      next({
        status: 400,
        message: "invalid query params",
        detail:
          "can only order by distance if includeDistanceFrom is also specified",
      });
      return;
    }
  }
  if (key.distance && orderBy != "distanceAsc" && orderBy != "distanceDesc") {
    next({
      status: 400,
      message: "invalid query params",
      detail: `query param orderBy must equal 'distanceAsc' or 'distanceDesc to paginate by distance`,
    });
    return;
  }
  if (
    key.avgRating &&
    orderBy != "avgRatingAsc" &&
    orderBy != "avgRatingDesc"
  ) {
    next({
      status: 400,
      message: "invalid query params",
      detail: `query param orderBy must equal 'avgRatingAsc' or 'avgRatingDesc to paginate by avgRating`,
    });
    return;
  }

  const profiles = camelize(
    await pool.query(
      `SELECT get_profiles($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) AS profile`,
      [
        username,
        includeDistanceFrom.latitude,
        includeDistanceFrom.longitude,
        maxDistance,
        minRating,
        maxRating,
        cuisinePreference,
        cuisineSpeciality,
        matchableWith,
        orderBy,
        key.accountUid,
        key.distance,
        key.avgRating,
        limit,
      ]
    )
  ).rows;
  for (const profile of profiles) {
    stripNulls(profile.profile, ["distance"]);
  }
  res.json(profiles);
  return;
});

/**
 * DOES NOT LOG NEW USER IN
 * expects username, email, password, and address fields in req
 * address should have fields address1, city, province, postalCode, and optional fields address2, address3
 */
router.post("/", async (req, res, next) => {
  const { profile, email, password, address } = req.body;
  const { username, circle } = profile;
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
        address1, address2, address3, city, 
        province, postal_code, latitude, longitude) 
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
      `INSERT INTO circle(latitude, longitude, radius) 
        VALUES($1, $2, $3) 
        RETURNING *`,
      [circleCentre.latitude, circleCentre.longitude, radius]
    )
  ).rows[0];
  const accountRes = camelize(
    await pool
      .query(
        `INSERT INTO account (username, circle_uid, email, passhash, address_uid)
          VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [username, circleRes.circleUid, email, passhash, addressRes.addressUid]
      )
      .catch((e) => {
        switch (e.constraint) {
          case "account_username_key":
            next({
              status: 409,
              message: "invalid username",
              detail: "username already exists",
            });
            return;
          case "account_email_key":
            next({
              status: 409,
              message: "Invalid email",
              detail: "Email already exists",
            });
            return;
          default:
            console.log(e);
            next({});
            return;
        }
      })
  );
  //Don't want to include addressUid, circleUid, or null address fields in response
  delete addressRes.addressUid;
  delete circleRes.circleUid;
  stripNulls(addressRes, ["address2", "address3"]);
  //DB error caught above - end function
  if (!accountRes) {
    return;
  }
  const account = accountRes.rows[0];
  await pool.query("COMMIT");
  const resBody = {
    profile: {
      accountUid: account.accountUid,
      username: account.username,
      createTime: account.createTime,
      updateTime: account.updateTime,
      bio: account.bio,
      numRatings: account.numRatings,
      circle: circleRes,
      images: [],
      cuisinePreferences: [],
      cuisineSpecialities: [],
    },
    email: account.email,
    address: addressRes,
  };
  console.log(resBody);
  res.status(201).json(resBody);
  return;
});

/**
 * if authenticated with requested account, return all account data
 * otherwise, return only profile data
 */
router.get("/:accountUid", async (req, res, next) => {
  const accountUid = req.params.accountUid;
  //authenticated with target account - return all account data
  if (accountUid === req.session.accountUid) {
    const accountRes = camelize(
      await pool.query(`SELECT * FROM get_single_account($1)`, [accountUid])
    ).rows[0];
    //could happen if account deleted but record still in session table
    if (!accountRes) {
      next(accountNotFound);
      return;
    }
    res.json(accountRes);
    return;
  }
  //not authenticated with target account - return only profile data
  const { includeDistanceFrom = {} } = req.query;
  const profileRes = camelize(
    await pool.query(`SELECT * FROM get_single_profile($1, $2, $3)`, [
      accountUid,
      includeDistanceFrom.latitude,
      includeDistanceFrom.longitude,
    ])
  ).rows[0];
  if (!profileRes) {
    next(accountNotFound);
    return;
  }
  res.json(profileRes);
  return;
});

/**
 * return username associated with accountUid
 */
router.get("/:accountUid/username", async (req, res, next) => {
  await getSingleFieldFromAccount(req, res, next, "username");
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
  await getSingleFieldFromAccount(req, res, next, "email");
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
  const accountUid = req.params.accountUid;
  //Create passhash
  const passhash = await bcrypt.hash(req.body.password, 12);
  //Returned field is arbitrary. Just checking that something was modified
  const query = await pool.query(
    `UPDATE account 
        SET passhash=$1, update_time=now()
        WHERE account_uid=$2
        RETURNING account_uid`,
    [passhash, accountUid]
  );
  //In case db error when querying
  const accountExists = query ? query.rows[0] : null;
  if (!accountExists) {
    next(accountNotFound);
    return;
  }
  res.sendStatus(204);
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
  res.status(200).json(address.address);
});

/**
 * if authenticated with requested account, update address if valid
 */
router.put("/:accountUid/address", checkAuth, async (req, res, next) => {
  const accountUid = req.params.accountUid;
  const { address1, address2, address3, city, province, postalCode } = req.body;
  const gmapsRes = await fetch(addressToGmapsUrl(req.body));
  const location = (await gmapsRes.json()).results[0].geometry.location;
  await pool.query(`BEGIN`);
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
  //get current circle
  const currentCircle = camelize(
    await pool.query(
      `SELECT radius, circle_uid FROM circle
      JOIN account USING (circle_uid)
      WHERE account_uid=$1 `,
      [accountUid]
    )
  ).rows[0];
  const radius = currentCircle.radius;
  const circleUid = currentCircle.circleUid;
  //generate new circle centre
  const circleCentre = generateCircleCentre(
    address.latitude,
    address.longitude,
    radius
  );
  //update circle. don't change radius
  const circle = camelize(
    await pool.query(
      `UPDATE circle 
        SET latitude=$1, longitude=$2
        WHERE circle_uid=$3
        RETURNING *`,
      [circleCentre.latitude, circleCentre.longitude, circleUid]
    )
  ).rows[0];
  await pool.query(`COMMIT`);
  //Don't want to include addressUid or null addressLines in response
  delete address.addressUid;
  stripNulls(address, ["address2", "address3"]);
  res.status(200).json(address);
});

/**
 * return bio associated with accountUid
 */
router.get("/:accountUid/bio", async (req, res, next) => {
  await getSingleFieldFromAccount(req, res, next, "bio");
});

router.put("/:accountUid/bio", checkAuth, async (req, res, next) => {
  await setSingleFieldInAccount(req, res, next, "bio");
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
router.put("/:accountUid/circle", checkAuth, async (req, res, next) => {
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
  //remove circleUid from res
  delete circle.circleUid;
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
  res.status(200).json({ pfpLink: generateImageLink(query.pfpName) });
});

router.put("/:accountUid/pfp", checkAuth, async (req, res, next) => {
  uploadHandler.single("image")(req, res, (err) => {
    if (err) {
      //wrong field name in request (not image) or multiple images sent in same field
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        next({
          message: "invalid field name",
          detail: `image field name numst be "image" and must contain 1 image`,
        });
        return;
      } else {
        //some other multer error
        next(err);
        return;
      }
    }
    const accountUid = req.params.accountUid;
    const imageName = req.file.originalname;
    const blob = bucket.file(uuid4() + imageName);
    const blobStream = blob.createWriteStream();
    blobStream.on("error", (err) => {
      //some GCS error
      next(err);
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
      res.status(200).json({ pfpLink: generateImageLink(pfp.pfpName) });
    });
    blobStream.end(req.file.buffer);
  });
});

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
    delete images[key].imageName;
  });
  res.status(200).json({ images: images });
});

/**
 * add image to user's images
 */
router.post("/:accountUid/images", checkAuth, async (req, res, next) => {
  uploadHandler.single("image")(req, res, (err) => {
    if (err) {
      //wrong field name in request (not image) or multiple images sent in same field
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        next({
          message: "invalid field name",
          detail: `image field name numst be "image" and must contain 1 image`,
        });
        return;
      } else {
        //some other multer error
        next(err);
        return;
      }
    }
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
      //replace imageName with imageLink
      image.imageLink = generateImageLink(image.imageName);
      delete image.imageName;
      res.status(201).json(image);
    });
    blobStream.end(req.file.buffer);
  });
});

/**
 * return an image associated with accountUid
 */
router.get("/:accountUid/images/:imageUid", async (req, res, next) => {
  const accountUid = req.params.accountUid;
  const imageUid = req.params.imageUid;
  const image = camelize(
    await pool.query(
      `SELECT * 
        FROM image
        WHERE account_uid=$1 AND image_uid=$2`,
      [accountUid, imageUid]
    )
  ).rows[0];
  //specified image not found at path account with that accountUid
  if (!image) {
    next({
      message: "image not found",
      detail: "image with specified uid not found under specified account",
    });
    return;
  }
  //replace imageName with imageLink
  image.imageLink = generateImageLink(image.imageName);
  delete image.imageName;
  res.status(200).json(image);
});

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
 * return cuisinePreferences associated with accountUid
 */
router.get("/:accountUid/cuisinePreferences", async (req, res, next) => {
  const accountUid = req.params.accountUid;
  const cuisinePreferences = camelize(
    await pool.query(
      `SELECT 
        COALESCE(json_agg(preference ORDER BY preference) 
                  FILTER (WHERE preference IS NOT NULL), 
                  '[]'
        ) AS cuisine_preferences
        FROM account 
        LEFT JOIN cuisine_preference USING(account_uid)
        WHERE account_uid=$1
        GROUP BY account_uid;`,
      [accountUid]
    )
  ).rows[0];
  //no account with that accountUid
  if (!cuisinePreferences) {
    next(accountNotFound);
  }
  res.status(200).json(cuisinePreferences);
});

/**
 * replace account's cuisine preferences
 */
router.post(
  "/:accountUid/cuisinePreferences",
  checkAuth,
  async (req, res, next) => {
    const accountUid = req.params.accountUid;
    const cuisinePreference = req.body.cuisinePreference;
    const insertRes = camelize(
      await pool
        .query(
          `INSERT INTO cuisine_preference 
          (account_uid, preference, preference_num)
          SELECT $1, $2, 
            COALESCE(MAX(preference_num), 0) + 1 
          FROM cuisine_preference
          WHERE account_uid=$1
          RETURNING preference;`,
          [accountUid, cuisinePreference]
        )
        .catch((e) => {
          console.log(e);
          switch (e.constraint) {
            case "user_cuisine_preference_pkey":
              next({
                status: 409,
                message: "preference already set",
                detail: "account already has specified cuisine preference",
              });
              return;
            case "cuisine_preference_preference_num_check":
              next({
                status: 409,
                message: "max cuisine preferences",
                detail: "maximum number of cuisine preferences already reached",
              });
              return;
            default:
              next({});
          }
        })
    );
    //no account with that accountUid
    if (!insertRes || !insertRes.rows[0]) {
      next(accountNotFound);
      return;
    }
    res.status(201).json({ cuisinePreference: insertRes.rows[0].preference });
  }
);

/**
 * delete cuisine preference
 */
router.delete(
  "/:accountUid/cuisinePreferences/:preference",
  checkAuth,
  async (req, res, next) => {
    const { accountUid, preference } = req.params;
    console.log(preference);
    await pool.query(`BEGIN`);
    const prefRes = camelize(
      await pool.query(
        `DELETE FROM cuisine_preference 
          WHERE account_uid=$1 AND preference=$2 RETURNING preference_num`,
        [accountUid, preference]
      )
    );
    const prefNum = prefRes ? prefRes.rows[0].preferenceNum : null;
    if (!prefNum) {
      next({
        status: 404,
        message: "preference not found",
        detail: "account does not have specified preference",
      });
      return;
    }
    await pool.query(
      `WITH max_num AS (
        SELECT max(preference_num)
        FROM cuisine_preference
        WHERE account_uid=$2
        )
        UPDATE cuisine_preference SET preference_num=LEAST(max_num.max, $1)
        FROM max_num
        WHERE account_uid=$2
        AND preference_num = max_num.max`,
      [prefNum, accountUid]
    );
    await pool.query(`COMMIT`);
    res.sendStatus(204);
  }
);

/**
 * return cuisineSpecialities associated with accountUid
 */
router.get("/:accountUid/cuisineSpecialities", async (req, res, next) => {
  const accountUid = req.params.accountUid;
  const cuisineSpecialities = camelize(
    await pool.query(
      `SELECT 
        COALESCE(json_agg(speciality ORDER BY speciality) 
                  FILTER (WHERE speciality IS NOT NULL), 
                  '[]'
        ) AS cuisine_specialities
        FROM account 
        LEFT JOIN cuisine_speciality USING(account_uid)
        WHERE account_uid=$1
        GROUP BY account_uid;`,
      [accountUid]
    )
  ).rows[0];
  //no account with that accountUid
  if (!cuisineSpecialities) {
    next(accountNotFound);
  }
  res.status(200).json(cuisineSpecialities);
});

/**
 * replace account's cuisine specialities
 */
router.post(
  "/:accountUid/cuisineSpecialities",
  checkAuth,
  async (req, res, next) => {
    const accountUid = req.params.accountUid;
    const cuisineSpeciality = req.body.cuisineSpeciality;
    const insertRes = camelize(
      await pool
        .query(
          `INSERT INTO cuisine_speciality 
          (account_uid, speciality, speciality_num)
          SELECT $1, $2, 
            COALESCE(MAX(speciality_num), 0) + 1 
          FROM cuisine_speciality
          WHERE account_uid=$1
          RETURNING speciality;`,
          [accountUid, cuisineSpeciality]
        )
        .catch((e) => {
          console.log(e);
          switch (e.constraint) {
            case "user_cuisine_speciality_pkey":
              next({
                status: 409,
                message: "speciality already set",
                detail: "account already has specified cuisine speciality",
              });
              return;
            case "cuisine_speciality_speciality_num_check":
              next({
                status: 409,
                message: "max cuisine specialities",
                detail:
                  "maximum number of cuisine specialities already reached",
              });
              return;
            default:
              next({});
          }
        })
    );
    //no account with that accountUid
    if (!insertRes || !insertRes.rows[0]) {
      next(accountNotFound);
      return;
    }

    //get updated specialities
    res.status(201).json({ cuisineSpeciality: insertRes.rows[0].speciality });
  }
);

/**
 * delete cuisine speciality
 */
router.delete(
  "/:accountUid/cuisineSpecialities/:speciality",
  checkAuth,
  async (req, res, next) => {
    const { accountUid, speciality } = req.params;
    await pool.query(`BEGIN`);
    const specRes = camelize(
      await pool.query(
        `DELETE FROM cuisine_speciality 
          WHERE account_uid=$1 AND speciality=$2 RETURNING speciality_num`,
        [accountUid, speciality]
      )
    );
    const specNum = specRes ? specRes.rows[0].specialityNum : null;
    if (!specNum) {
      next({
        status: 404,
        message: "speciality not found",
        detail: "account does not have specified speciality",
      });
      return;
    }
    await pool.query(
      `WITH max_num AS (
        SELECT max(speciality_num)
        FROM cuisine_speciality
        WHERE account_uid=$2
        )
        UPDATE cuisine_speciality SET speciality_num=LEAST(max_num.max, $1)
        FROM max_num
        WHERE account_uid=$2
        AND speciality_num = max_num.max`,
      [specNum, accountUid]
    );
    await pool.query(`COMMIT`);
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

async function getSingleFieldFromAccount(req, res, next, field) {
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
  res.status(200).json({ [field]: query[field] });
}

async function setSingleFieldInAccount(req, res, next, field) {
  const accountUid = req.params.accountUid;
  const value = req.body[field];
  //fields are in snakecase in DB
  const DBField = snakeize(field);
  const query = camelize(
    await pool
      .query(
        `UPDATE account 
        SET ${DBField}=$1, update_time=now()
        WHERE account_uid=$2
        RETURNING ${DBField}`,
        [value, accountUid]
      )
      .catch((e) => {
        switch (e.constraint) {
          case "account_username_key":
            next({
              status: 409,
              message: "invalid username",
              detail: "username already exists",
            });
            return;
          case "account_email_key":
            next({
              status: 409,
              message: "Invalid email",
              detail: "Email already exists",
            });
            return;
          default:
            next({});
            return;
        }
      })
  );
  //in case account deleted
  const accountExists = query ? query.rows[0] : null;
  if (!accountExists) {
    next(accountNotFound);
    return;
  }
  res.status(200).json({ [field]: query.rows[0][field] });
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
