export function accountProfileQuery(includeDistanceFrom) {
  return `WITH account_image AS (
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
        ${
          includeDistanceFrom
            ? `, distance AS (
          SELECT account_uid, 
          ST_DistanceSphere(
            ST_MakePoint($1, $2), ST_MakePoint(circle.longitude, circle.latitude)
          ) AS distance
          FROM account JOIN circle USING (circle_uid)
        )`
            : ``
        }
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
            'images', COALESCE(account_image.images, '[]'),
            'cuisine_preferences', COALESCE(account_cuisine_preference.preferences, '[]'),
            'cuisine_specialities', COALESCE(account_cuisine_speciality.specialities, '[]')
            ${includeDistanceFrom ? `, 'distance', distance.distance` : ``}
          ) profile
          FROM account 
          LEFT JOIN circle USING (circle_uid)
          LEFT JOIN account_image USING (account_uid)
          LEFT JOIN account_cuisine_preference USING (account_uid)
          LEFT JOIN account_cuisine_speciality USING (account_uid)
          ${
            includeDistanceFrom ? ` LEFT JOIN distance USING (account_uid)` : ``
          }`;
}

export function accountQuery(includeDistanceFrom) {
  return `WITH account_image AS (
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
          ${
            includeDistanceFrom
              ? `, distance AS (
            SELECT account_uid, 
            ST_DistanceSphere(
              ST_MakePoint($1, $2), ST_MakePoint(circle.longitude, circle.latitude)
            ) AS distance
            FROM account JOIN circle USING (circle_uid)
          )`
              : ``
          }
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
              'images', COALESCE(account_image.images, '[]'),
              'cuisine_preferences', COALESCE(account_cuisine_preference.preferences, '[]'),
              'cuisine_specialities', COALESCE(account_cuisine_speciality.specialities, '[]')
              ${includeDistanceFrom ? `, 'distance', distance.distance` : ``}
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
            LEFT JOIN account_image USING (account_uid)
            LEFT JOIN account_cuisine_preference USING (account_uid)
            LEFT JOIN account_cuisine_speciality USING (account_uid)
            LEFT JOIN address USING (address_uid)
            ${
              includeDistanceFrom
                ? ` LEFT JOIN distance USING (account_uid)`
                : ``
            }`;
}
