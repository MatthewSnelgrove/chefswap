export function accountProfileQuery(includeDistanceFrom) {
  return `WITH temp_image_table AS (
          SELECT account_uid, 
          json_agg(
            json_build_object(
              'image_uid', image_uid,
              'account_uid', account_uid,
              'image_link', 'https://storage.googleapis.com/${
                process.env.GCS_BUCKET
              }/' || image_name, 
              'timestamp', timestamp
            )
          ) AS images
          FROM image
          GROUP BY account_uid
        ), temp_preference_table AS (
          SELECT account_uid, 
          json_agg(preference) AS preferences
          FROM cuisine_preference
          GROUP BY account_uid
        ), temp_speciality_table AS (
          SELECT account_uid, 
          json_agg(speciality) AS specialities
          FROM cuisine_speciality
          GROUP BY account_uid
        )
        ${
          includeDistanceFrom
            ? `, temp_distance_table AS (
          SELECT account_uid, 
          ST_DistanceSphere(
            ST_MakePoint($1, $2), ST_MakePoint(circle.longitude, circle.latitude)
          ) AS distance
          FROM account JOIN circle USING (circle_uid)
        )`
            : ``
        }
        SELECT 
          json_strip_nulls(
            json_build_object(
              'account_uid', account.account_uid, 
              'username', account.username, 
              'create_time', account.create_time, 
              'update_time', account.update_time, 
              'bio', account.bio, 
              'pfp_link', 'https://storage.googleapis.com/${
                process.env.GCS_BUCKET
              }/' || account.pfp_name, 
              'avg_rating', account.avg_rating, 
              'num_ratings', account.num_ratings, 
              'circle', json_build_object(
                'radius', circle.radius, 
                'latitude', circle.latitude,
                'longitude', circle.longitude
              ),
              'images', COALESCE(temp_image_table.images, '[]'),
              'cuisine_preferences', COALESCE(temp_preference_table.preferences, '[]'),
              'cuisine_specialities', COALESCE(temp_speciality_table.specialities, '[]')
              ${
                includeDistanceFrom
                  ? `, 'distance', temp_distance_table.distance`
                  : ``
              }
            ) 
          ) profile
          FROM account 
          LEFT JOIN circle USING (circle_uid)
          LEFT JOIN temp_image_table USING (account_uid)
          LEFT JOIN temp_preference_table USING (account_uid)
          LEFT JOIN temp_speciality_table USING (account_uid)
          ${
            includeDistanceFrom
              ? ` LEFT JOIN temp_distance_table USING (account_uid)`
              : ``
          }`;
}

export function accountQuery(includeDistanceFrom) {
  return `WITH temp_image_table AS (
            SELECT account_uid, 
            json_agg(
              json_build_object(
                'image_uid', image_uid,
                'account_uid', account_uid,
                'image_link', 'https://storage.googleapis.com/${
                  process.env.GCS_BUCKET
                }/' || image_name, 
                'timestamp', timestamp
              )
            ) AS images
            FROM image
            GROUP BY account_uid
          ), temp_preference_table AS (
            SELECT account_uid, 
            json_agg(preference) AS preferences
            FROM cuisine_preference
            GROUP BY account_uid
          ), temp_speciality_table AS (
            SELECT account_uid, 
            json_agg(speciality) AS specialities
            FROM cuisine_speciality
            GROUP BY account_uid
          )
          ${
            includeDistanceFrom
              ? `, temp_distance_table AS (
            SELECT account_uid, 
            ST_DistanceSphere(
              ST_MakePoint($1, $2), ST_MakePoint(circle.longitude, circle.latitude)
            ) AS distance
            FROM account JOIN circle USING (circle_uid)
          )`
              : ``
          }
          SELECT 
            json_strip_nulls(
              json_build_object(
                'account_uid', account.account_uid, 
                'username', account.username, 
                'create_time', account.create_time, 
                'update_time', account.update_time, 
                'bio', account.bio, 
                'pfp_link', 'https://storage.googleapis.com/${
                  process.env.GCS_BUCKET
                }/' || account.pfp_name, 
                'avg_rating', account.avg_rating, 
                'num_ratings', account.num_ratings, 
                'circle', json_build_object(
                  'radius', circle.radius, 
                  'latitude', circle.latitude,
                  'longitude', circle.longitude
                ),
                'images', COALESCE(temp_image_table.images, '[]'),
                'cuisine_preferences', COALESCE(temp_preference_table.preferences, '[]'),
                'cuisine_specialities', COALESCE(temp_speciality_table.specialities, '[]')
                ${
                  includeDistanceFrom
                    ? `, 'distance', temp_distance_table.distance`
                    : ``
                }
              )
            ) profile,
            account.email,
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
            LEFT JOIN circle USING (circle_uid)
            LEFT JOIN temp_image_table USING (account_uid)
            LEFT JOIN temp_preference_table USING (account_uid)
            LEFT JOIN temp_speciality_table USING (account_uid)
            LEFT JOIN address USING (address_uid)
            ${
              includeDistanceFrom
                ? ` LEFT JOIN temp_distance_table USING (account_uid)`
                : ``
            }`;
}
