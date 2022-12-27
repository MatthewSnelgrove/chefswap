PGDMP     -                    z            chefswap    14.4 (Debian 14.4-1.pgdg110+1)    14.5 M    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    17619    chefswap    DATABASE     \   CREATE DATABASE chefswap WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.utf8';
    DROP DATABASE chefswap;
                postgres    false                        2615    2200    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
             
   flypgadmin    false            �           0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                
   flypgadmin    false    5            �           1255    19009    check_swap_timestamp_change()    FUNCTION     z  CREATE FUNCTION public.check_swap_timestamp_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW."accept_timestamp" IS DISTINCT FROM OLD."accept_timestamp" AND OLD."accept_timestamp" IS NOT NULL
  THEN
    RAISE EXCEPTION 'accept_timestamp is immutable';
  END IF;
  IF NEW."end_timestamp" IS DISTINCT FROM OLD."end_timestamp" AND OLD."end_timestamp" IS NOT NULL
  THEN
    RAISE EXCEPTION 'end_timestamp" is immutable';
  END IF;
  IF NEW."end_timestamp" IS NOT NULL AND OLD."accept_timestamp" IS NULL
  THEN
    RAISE EXCEPTION 'end_timestamp requires non-null accept_timestamp';
  END IF;

  RETURN NEW;
END;
$$;
 4   DROP FUNCTION public.check_swap_timestamp_change();
       public          postgres    false    5            �           1255    18662 �   get_address_uid(character varying, character varying, character varying, character varying, character varying, character varying)    FUNCTION       CREATE FUNCTION public.get_address_uid(f_address1 character varying, f_address2 character varying, f_address3 character varying, f_city character varying, f_province character varying, f_postal_code character varying) RETURNS uuid
    LANGUAGE sql
    AS $$
SELECT address_uid FROM address WHERE address1=f_address1 AND 
((address2=f_address2) OR (COALESCE(address2, f_address2) IS NULL)) AND 
((address3=f_address3) OR (COALESCE(address3, f_address3) IS NULL)) AND 
city=f_city AND province=f_province AND postal_code=f_postal_code;
$$;
 �   DROP FUNCTION public.get_address_uid(f_address1 character varying, f_address2 character varying, f_address3 character varying, f_city character varying, f_province character varying, f_postal_code character varying);
       public          postgres    false    5            �           1255    18930 �   get_profiles(character varying, double precision, double precision, integer, double precision, double precision, character varying[], character varying[], character varying, uuid, integer, double precision, integer)    FUNCTION     �  CREATE FUNCTION public.get_profiles(_username character varying, _origin_lat double precision, _origin_lng double precision, _max_distance integer, _min_rating double precision, _max_rating double precision, _cuisine_preferences character varying[], _cuisine_specialities character varying[], _order_by character varying, _key_account_uid uuid, _key_distance integer, _key_avg_rating double precision, _pag_limit integer) RETURNS TABLE(profile json)
    LANGUAGE plpgsql
    AS $$
BEGIN
IF _origin_lat IS null OR _origin_lng IS null THEN
	IF _max_distance IS NOT null THEN
		RAISE EXCEPTION 'must specify latitude and longitude to filter by distance';
	END IF;
	IF _order_by = 'distanceAsc' OR _order_by = 'distanceDesc' THEN
		RAISE EXCEPTION 'must specify latitude and longitude to order by distance';
	END IF;
END IF;
IF _order_by IS NOT null AND NOT _order_by = ANY(ARRAY['distanceAsc', 'distanceDesc', 'avgRatingAsc', 'avgRatingDesc']) THEN
	RAISE EXCEPTION 'can only order by distanceAsc, distanceDesc, avgRatingAsc, or avgRatingDesc';
END IF;
IF _key_distance IS NOT null AND NOT (_order_by = 'distanceAsc' OR _order_by = 'distanceDesc') THEN
	RAISE EXCEPTION 'must order by distance to paginate by distnace';
END IF;
IF _key_avg_rating IS NOT null AND NOT (_order_by = 'avgRatingAsc' OR _order_by = 'avgRatingDesc') THEN
	RAISE EXCEPTION 'must order by rating to paginate by rating';
END IF;
IF _key_account_uid IS null THEN
	_key_account_uid := '00000000-0000-0000-0000-000000000000'::uuid;
END IF;
RETURN QUERY
WITH avg_rating AS (
	SELECT account.account_uid, COALESCE(ROUND(AVG(rating.rating), 2), 0) AS avg_rating, ROUND(COUNT(rating.rating)) AS num_ratings
	FROM account LEFT JOIN rating USING(account_uid) GROUP BY account.account_uid
	), images_per_account AS (
         SELECT image.account_uid,
            json_agg(json_build_object('image_uid', image.image_uid, 'account_uid', image.account_uid, 'image_link', 'https://storage.googleapis.com/chefswap_0/'::text || image.image_name::text, 'timestamp', image."timestamp")) AS images
           FROM image
          GROUP BY image.account_uid
        ), agged_preferences AS (
         SELECT cuisine_preference.account_uid,
            array_agg(cuisine_preference.preference) AS preferences
           FROM cuisine_preference
          GROUP BY cuisine_preference.account_uid
        ), agged_specialities AS (
         SELECT cuisine_speciality.account_uid,
            array_agg(cuisine_speciality.speciality) AS specialities
           FROM cuisine_speciality
          GROUP BY cuisine_speciality.account_uid
        ), distance_per_account AS (
          SELECT account_uid, 
          ST_DistanceSphere( -- null if either _origin_lng, _origin_lat is null
            ST_MakePoint(_origin_lng, _origin_lat),  ST_MakePoint(circle.longitude, circle.latitude)
          ) AS distance
          FROM account JOIN circle USING (circle_uid)
        )
 SELECT json_strip_nulls(json_build_object('account_uid', account.account_uid, 'username', account.username, 'create_time', account.create_time, 'update_time', account.update_time, 'bio', account.bio, 'pfp_link', 'https://storage.googleapis.com/chefswap_0/'::text || account.pfp_name::text, 'avg_rating', avg_rating.avg_rating, 'num_ratings', avg_rating.num_ratings, 'circle', json_build_object('radius', circle.radius, 'latitude', circle.latitude, 'longitude', circle.longitude), 'images', COALESCE(images_per_account.images, '[]'::json), 'cuisine_preferences', COALESCE(agged_preferences.preferences, ARRAY[]::varchar[]), 'cuisine_specialities', COALESCE(agged_specialities.specialities, ARRAY[]::varchar[]), 'distance', distance_per_account.distance)) AS profile
--     account.email,
--     json_strip_nulls(json_build_object('address1', address.address1, 'address2', address.address2, 'address3', address.address3, 'city', address.city, 'province', address.province, 'postal_code', address.postal_code, 'latitude', address.latitude, 'longitude', address.longitude)) AS address
   FROM account
     LEFT JOIN circle USING (circle_uid)
     LEFT JOIN images_per_account USING (account_uid)
     LEFT JOIN agged_preferences USING (account_uid)
     LEFT JOIN agged_specialities USING (account_uid)
     LEFT JOIN address USING (address_uid)
	 LEFT JOIN avg_rating USING (account_uid)
	 LEFT JOIN distance_per_account USING (account_uid)
 WHERE (_username IS null OR account.username = _username)
AND (_max_distance IS null OR distance_per_account.distance <= _max_distance)
AND (_min_rating IS null OR avg_rating.avg_rating >= _min_rating)
AND (_max_rating IS null OR avg_rating.avg_rating >= _max_rating)
AND (_cuisine_preferences IS null OR _cuisine_preferences && agged_preferences.preferences)
AND (_cuisine_specialities IS null OR _cuisine_specialities && agged_specialities.specialities)
AND (COALESCE(
	(CASE 
		WHEN _order_by = 'avgRatingAsc' THEN avg_rating.avg_rating
		WHEN _order_by = 'avgRatingDesc' THEN _key_avg_rating
		WHEN _order_by = 'distanceAsc' THEN distance_per_account.distance
		WHEN _order_by = 'distanceDesc' THEN _key_distance
	END > 
	CASE 
		WHEN _order_by = 'avgRatingAsc' THEN _key_avg_rating
		WHEN _order_by = 'avgRatingDesc' THEN avg_rating.avg_rating
		WHEN _order_by = 'distanceAsc' THEN _key_distance
		WHEN _order_by = 'distanceDesc' THEN distance_per_account.distance
	END), true) OR
	(CASE 
		WHEN _order_by = 'avgRatingAsc' THEN avg_rating.avg_rating
		WHEN _order_by = 'avgRatingDesc' THEN _key_avg_rating
		WHEN _order_by = 'distanceAsc' THEN distance_per_account.distance
		WHEN _order_by = 'distanceDesc' THEN _key_distance
	END = 
	CASE 
		WHEN _order_by = 'avgRatingAsc' THEN _key_avg_rating
		WHEN _order_by = 'avgRatingDesc' THEN avg_rating.avg_rating
		WHEN _order_by = 'distanceAsc' THEN _key_distance
		WHEN _order_by = 'distanceDesc' THEN distance_per_account.distance
	END
	AND account.account_uid > _key_account_uid))
ORDER BY 
	CASE WHEN
		_order_by = 'avgRatingAsc' THEN avg_rating.avg_rating
	END ASC,
	CASE WHEN
		_order_by = 'avgRatingDesc' THEN avg_rating.avg_rating
	END DESC,
	CASE WHEN
		_order_by = 'distanceAsc' THEN distance_per_account.distance
	END ASC,
	CASE WHEN
		_order_by = 'distanceDesc' THEN distance_per_account.distance
	END DESC, account.account_uid
	LIMIT COALESCE(_pag_limit, 20);
END 
$$;
 �  DROP FUNCTION public.get_profiles(_username character varying, _origin_lat double precision, _origin_lng double precision, _max_distance integer, _min_rating double precision, _max_rating double precision, _cuisine_preferences character varying[], _cuisine_specialities character varying[], _order_by character varying, _key_account_uid uuid, _key_distance integer, _key_avg_rating double precision, _pag_limit integer);
       public          postgres    false    5            �           1255    19012 �   get_profiles(character varying, double precision, double precision, integer, double precision, double precision, character varying[], character varying[], uuid, character varying, uuid, integer, double precision, integer)    FUNCTION     �  CREATE FUNCTION public.get_profiles(_username character varying, _origin_lat double precision, _origin_lng double precision, _max_distance integer, _min_rating double precision, _max_rating double precision, _cuisine_preferences character varying[], _cuisine_specialities character varying[], _matchable_with uuid, _order_by character varying, _key_account_uid uuid, _key_distance integer, _key_avg_rating double precision, _pag_limit integer) RETURNS TABLE(profile json)
    LANGUAGE plpgsql
    AS $$
BEGIN
IF _origin_lat IS null OR _origin_lng IS null THEN
	IF _max_distance IS NOT null THEN
		RAISE EXCEPTION 'must specify latitude and longitude to filter by distance';
	END IF;
	IF _order_by = 'distanceAsc' OR _order_by = 'distanceDesc' THEN
		RAISE EXCEPTION 'must specify latitude and longitude to order by distance';
	END IF;
END IF;
IF _order_by IS NOT null AND NOT _order_by = ANY(ARRAY['distanceAsc', 'distanceDesc', 'avgRatingAsc', 'avgRatingDesc']) THEN
	RAISE EXCEPTION 'can only order by distanceAsc, distanceDesc, avgRatingAsc, or avgRatingDesc';
END IF;
IF _key_distance IS NOT null AND NOT (_order_by = 'distanceAsc' OR _order_by = 'distanceDesc') THEN
	RAISE EXCEPTION 'must order by distance to paginate by distnace';
END IF;
IF _key_avg_rating IS NOT null AND NOT (_order_by = 'avgRatingAsc' OR _order_by = 'avgRatingDesc') THEN
	RAISE EXCEPTION 'must order by rating to paginate by rating';
END IF;
IF _key_account_uid IS null THEN
	_key_account_uid := '00000000-0000-0000-0000-000000000000'::uuid;
END IF;
RETURN QUERY
WITH avg_rating AS (
	SELECT account.account_uid, COALESCE(ROUND(AVG(rating.rating), 2), 0) AS avg_rating, ROUND(COUNT(rating.rating)) AS num_ratings
	FROM account LEFT JOIN rating USING(account_uid) GROUP BY account.account_uid
	), images_per_account AS (
         SELECT image.account_uid,
            json_agg(json_build_object('image_uid', image.image_uid, 'account_uid', image.account_uid, 'image_link', 'https://storage.googleapis.com/chefswap_0/'::text || image.image_name::text, 'timestamp', image."timestamp")) AS images
           FROM image
          GROUP BY image.account_uid
        ), agged_preferences AS (
         SELECT cuisine_preference.account_uid,
            array_agg(cuisine_preference.preference) AS preferences
           FROM cuisine_preference
          GROUP BY cuisine_preference.account_uid
        ), agged_specialities AS (
         SELECT cuisine_speciality.account_uid,
            array_agg(cuisine_speciality.speciality) AS specialities
           FROM cuisine_speciality
          GROUP BY cuisine_speciality.account_uid
        ), distance_per_account AS (
          SELECT account_uid, 
          ST_DistanceSphere( -- null if either _origin_lng, _origin_lat is null
            ST_MakePoint(_origin_lng, _origin_lat),  ST_MakePoint(circle.longitude, circle.latitude)
          ) AS distance
          FROM account JOIN circle USING (circle_uid)
        )
 SELECT json_strip_nulls(json_build_object('account_uid', account.account_uid, 'username', account.username, 'create_time', account.create_time, 'update_time', account.update_time, 'bio', account.bio, 'pfp_link', 'https://storage.googleapis.com/chefswap_0/'::text || account.pfp_name::text, 'avg_rating', avg_rating.avg_rating, 'num_ratings', avg_rating.num_ratings, 'circle', json_build_object('radius', circle.radius, 'latitude', circle.latitude, 'longitude', circle.longitude), 'images', COALESCE(images_per_account.images, '[]'::json), 'cuisine_preferences', COALESCE(agged_preferences.preferences, ARRAY[]::varchar[]), 'cuisine_specialities', COALESCE(agged_specialities.specialities, ARRAY[]::varchar[]), 'distance', distance_per_account.distance)) AS profile
--     account.email,
--     json_strip_nulls(json_build_object('address1', address.address1, 'address2', address.address2, 'address3', address.address3, 'city', address.city, 'province', address.province, 'postal_code', address.postal_code, 'latitude', address.latitude, 'longitude', address.longitude)) AS address
   FROM account
     LEFT JOIN circle USING (circle_uid)
     LEFT JOIN images_per_account USING (account_uid)
     LEFT JOIN agged_preferences USING (account_uid)
     LEFT JOIN agged_specialities USING (account_uid)
     LEFT JOIN address USING (address_uid)
	 LEFT JOIN avg_rating USING (account_uid)
	 LEFT JOIN distance_per_account USING (account_uid)
 WHERE (_username IS null OR account.username = _username)
AND (_max_distance IS null OR distance_per_account.distance <= _max_distance)
AND (_min_rating IS null OR avg_rating.avg_rating >= _min_rating)
AND (_max_rating IS null OR avg_rating.avg_rating >= _max_rating)
AND (_cuisine_preferences IS null OR _cuisine_preferences && agged_preferences.preferences)
AND (_cuisine_specialities IS null OR _cuisine_specialities && agged_specialities.specialities)
AND (COALESCE(
	(CASE 
		WHEN _order_by = 'avgRatingAsc' THEN avg_rating.avg_rating
		WHEN _order_by = 'avgRatingDesc' THEN _key_avg_rating
		WHEN _order_by = 'distanceAsc' THEN distance_per_account.distance
		WHEN _order_by = 'distanceDesc' THEN _key_distance
	END > 
	CASE 
		WHEN _order_by = 'avgRatingAsc' THEN _key_avg_rating
		WHEN _order_by = 'avgRatingDesc' THEN avg_rating.avg_rating
		WHEN _order_by = 'distanceAsc' THEN _key_distance
		WHEN _order_by = 'distanceDesc' THEN distance_per_account.distance
	END), true) OR
	(CASE 
		WHEN _order_by = 'avgRatingAsc' THEN avg_rating.avg_rating
		WHEN _order_by = 'avgRatingDesc' THEN _key_avg_rating
		WHEN _order_by = 'distanceAsc' THEN distance_per_account.distance
		WHEN _order_by = 'distanceDesc' THEN _key_distance
	END = 
	CASE 
		WHEN _order_by = 'avgRatingAsc' THEN _key_avg_rating
		WHEN _order_by = 'avgRatingDesc' THEN avg_rating.avg_rating
		WHEN _order_by = 'distanceAsc' THEN _key_distance
		WHEN _order_by = 'distanceDesc' THEN distance_per_account.distance
	END
	AND account.account_uid > _key_account_uid))
	AND account.account_uid NOT IN (SELECT requester_uid FROM swap WHERE requestee_uid = _matchable_with AND end_timestamp IS null)
	AND account.account_uid NOT IN (SELECT requestee_uid FROM swap WHERE requester_uid = _matchable_with AND end_timestamp IS null)
ORDER BY 
	CASE WHEN
		_order_by = 'avgRatingAsc' THEN avg_rating.avg_rating
	END ASC,
	CASE WHEN
		_order_by = 'avgRatingDesc' THEN avg_rating.avg_rating
	END DESC,
	CASE WHEN
		_order_by = 'distanceAsc' THEN distance_per_account.distance
	END ASC,
	CASE WHEN
		_order_by = 'distanceDesc' THEN distance_per_account.distance
	END DESC, account.account_uid
	LIMIT COALESCE(_pag_limit, 20);
END 
$$;
 �  DROP FUNCTION public.get_profiles(_username character varying, _origin_lat double precision, _origin_lng double precision, _max_distance integer, _min_rating double precision, _max_rating double precision, _cuisine_preferences character varying[], _cuisine_specialities character varying[], _matchable_with uuid, _order_by character varying, _key_account_uid uuid, _key_distance integer, _key_avg_rating double precision, _pag_limit integer);
       public          postgres    false    5            �           1255    18940    get_single_account(uuid)    FUNCTION     [
  CREATE FUNCTION public.get_single_account(_account_uid uuid) RETURNS TABLE(profile json, email character varying, address json)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY
WITH avg_rating AS (
	SELECT account.account_uid, COALESCE(ROUND(AVG(rating.rating), 2), 0) AS avg_rating, ROUND(COUNT(rating.rating)) AS num_ratings
	FROM account LEFT JOIN rating USING(account_uid) GROUP BY account.account_uid
	), images_per_account AS (
         SELECT image.account_uid,
            json_agg(json_build_object('image_uid', image.image_uid, 'account_uid', image.account_uid, 'image_link', 'https://storage.googleapis.com/chefswap_0/'::text || image.image_name::text, 'timestamp', image."timestamp")) AS images
           FROM image
          GROUP BY image.account_uid
        ), agged_preferences AS (
         SELECT cuisine_preference.account_uid,
            array_agg(cuisine_preference.preference) AS preferences
           FROM cuisine_preference
          GROUP BY cuisine_preference.account_uid
        ), agged_specialities AS (
         SELECT cuisine_speciality.account_uid,
            array_agg(cuisine_speciality.speciality) AS specialities
           FROM cuisine_speciality
          GROUP BY cuisine_speciality.account_uid
        )
 SELECT json_strip_nulls(json_build_object('account_uid', account.account_uid, 'username', account.username, 'create_time', account.create_time, 'update_time', account.update_time, 'bio', account.bio, 'pfp_link', 'https://storage.googleapis.com/chefswap_0/'::text || account.pfp_name::text, 'avg_rating', avg_rating.avg_rating, 'num_ratings', avg_rating.num_ratings, 'circle', json_build_object('radius', circle.radius, 'latitude', circle.latitude, 'longitude', circle.longitude), 'images', COALESCE(images_per_account.images, '[]'::json), 'cuisine_preferences', COALESCE(agged_preferences.preferences, ARRAY[]::varchar[]), 'cuisine_specialities', COALESCE(agged_specialities.specialities, ARRAY[]::varchar[]))) AS profile,
    account.email AS email,
    json_strip_nulls(json_build_object('address1', address.address1, 'address2', address.address2, 'address3', address.address3, 'city', address.city, 'province', address.province, 'postal_code', address.postal_code, 'latitude', address.latitude, 'longitude', address.longitude)) AS address
   FROM account
     LEFT JOIN circle USING (circle_uid)
     LEFT JOIN images_per_account USING (account_uid)
     LEFT JOIN agged_preferences USING (account_uid)
     LEFT JOIN agged_specialities USING (account_uid)
     LEFT JOIN address USING (address_uid)
	 LEFT JOIN avg_rating USING (account_uid)
 WHERE (_account_uid = account.account_uid);
 END;
$$;
 <   DROP FUNCTION public.get_single_account(_account_uid uuid);
       public          postgres    false    5            �           1255    18941 <   get_single_profile(uuid, double precision, double precision)    FUNCTION     �
  CREATE FUNCTION public.get_single_profile(_account_uid uuid, _origin_lat double precision, _origin_lng double precision) RETURNS TABLE(profile json)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY
WITH avg_rating AS (
	SELECT account.account_uid, COALESCE(ROUND(AVG(rating.rating), 2), 0) AS avg_rating, ROUND(COUNT(rating.rating)) AS num_ratings
	FROM account LEFT JOIN rating USING(account_uid) GROUP BY account.account_uid
	), images_per_account AS (
         SELECT image.account_uid,
            json_agg(json_build_object('image_uid', image.image_uid, 'account_uid', image.account_uid, 'image_link', 'https://storage.googleapis.com/chefswap_0/'::text || image.image_name::text, 'timestamp', image."timestamp")) AS images
           FROM image
          GROUP BY image.account_uid
        ), agged_preferences AS (
         SELECT cuisine_preference.account_uid,
            array_agg(cuisine_preference.preference) AS preferences
           FROM cuisine_preference
          GROUP BY cuisine_preference.account_uid
        ), agged_specialities AS (
         SELECT cuisine_speciality.account_uid,
            array_agg(cuisine_speciality.speciality) AS specialities
           FROM cuisine_speciality
          GROUP BY cuisine_speciality.account_uid
        ), distance_per_account AS (
          SELECT account_uid, 
          ST_DistanceSphere( -- null if either _origin_lng, _origin_lat is null
            ST_MakePoint(_origin_lng, _origin_lat),  ST_MakePoint(circle.longitude, circle.latitude)
          ) AS distance
          FROM account JOIN circle USING (circle_uid)
        )
 SELECT json_strip_nulls(json_build_object('account_uid', account.account_uid, 'username', account.username, 'create_time', account.create_time, 'update_time', account.update_time, 'bio', account.bio, 'pfp_link', 'https://storage.googleapis.com/chefswap_0/'::text || account.pfp_name::text, 'avg_rating', avg_rating.avg_rating, 'num_ratings', avg_rating.num_ratings, 'circle', json_build_object('radius', circle.radius, 'latitude', circle.latitude, 'longitude', circle.longitude), 'images', COALESCE(images_per_account.images, '[]'::json), 'cuisine_preferences', COALESCE(agged_preferences.preferences, ARRAY[]::varchar[]), 'cuisine_specialities', COALESCE(agged_specialities.specialities, ARRAY[]::varchar[]), 'distance', distance_per_account.distance)) AS profile
   FROM account
     LEFT JOIN circle USING (circle_uid)
     LEFT JOIN images_per_account USING (account_uid)
     LEFT JOIN agged_preferences USING (account_uid)
     LEFT JOIN agged_specialities USING (account_uid)
     LEFT JOIN address USING (address_uid)
	 LEFT JOIN avg_rating USING (account_uid)
	 LEFT JOIN distance_per_account USING (account_uid)
 WHERE (_account_uid = account.account_uid);
 END;
$$;
 x   DROP FUNCTION public.get_single_profile(_account_uid uuid, _origin_lat double precision, _origin_lng double precision);
       public          postgres    false    5            �           1255    18953 5   get_single_swap(uuid, uuid, timestamp with time zone)    FUNCTION     �  CREATE FUNCTION public.get_single_swap(_account_uid uuid, _swapper_uid uuid, _request_timestamp timestamp with time zone) RETURNS TABLE(requester_uid uuid, requestee_uid uuid, request_timestamp timestamp with time zone, accept_timestamp timestamp with time zone, end_timestamp timestamp with time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
IF _account_uid IS null THEN
	RAISE EXCEPTION 'must provide _account_uid';
END IF;
IF _swapper_uid IS null THEN
	RAISE EXCEPTION 'must provide _swapper_uid';
END IF;
IF _request_timestamp IS null THEN
	RAISE EXCEPTION 'must provide _request_timestamp';
END IF;
RETURN QUERY
 SELECT 
      swap.requester_uid,
      swap.requestee_uid,
      swap.request_timestamp, 
      swap.accept_timestamp,
      swap.end_timestamp
FROM swap
 WHERE ((swap.requester_uid = _account_uid AND swap.requestee_uid = _swapper_uid) OR 
		(swap.requester_uid = _swapper_uid AND swap.requestee_uid = _account_uid)) 
		AND swap.request_timestamp = _request_timestamp;
END 
$$;
 y   DROP FUNCTION public.get_single_swap(_account_uid uuid, _swapper_uid uuid, _request_timestamp timestamp with time zone);
       public          postgres    false    5            �           1255    18948 ^   get_swaps(uuid, character varying, character varying, uuid, timestamp with time zone, integer)    FUNCTION     b  CREATE FUNCTION public.get_swaps(_account_uid uuid, _status character varying, _order_by character varying, _key_swapper_uid uuid, _key_time timestamp with time zone, _pag_limit integer) RETURNS TABLE(requester_uid uuid, requestee_uid uuid, request_timestamp timestamp with time zone, accept_timestamp timestamp with time zone, end_timestamp timestamp with time zone)
    LANGUAGE plpgsql
    AS $$BEGIN
IF _account_uid IS null THEN
	RAISE EXCEPTION 'must provide _account_uid';
END IF;
IF _order_by IS NOT null AND NOT _order_by = ANY(ARRAY['timeAsc', 'timeDesc']) THEN
	RAISE EXCEPTION 'can only order by timeAsc or timeDesc';
END IF;
IF _key_time IS NOT null AND NOT (_order_by = 'timeAsc' OR _order_by = 'timeDesc') THEN
	RAISE EXCEPTION 'must order by distance to paginate by distnace';
END IF;
IF _key_swapper_uid IS null THEN
	_key_swapper_uid := '00000000-0000-0000-0000-000000000000'::uuid;
END IF;
RETURN QUERY
 SELECT 
      swap.requester_uid,
      swap.requestee_uid,
      swap.request_timestamp, 
      swap.accept_timestamp,
      swap.end_timestamp
FROM swap
 WHERE (swap.requester_uid = _account_uid OR swap.requestee_uid = _account_uid)
AND CASE	
		WHEN _status = 'pending' THEN swap.accept_timestamp IS null
		WHEN _status = 'ongoing' THEN swap.accept_timestamp IS NOT null AND swap.end_timestamp IS null
		WHEN _status = 'ended' THEN swap.end_timestamp IS NOT null
		ELSE true
	END
AND (COALESCE(
	(CASE 
		WHEN _order_by = 'timeAsc' THEN swap.request_timestamp
		WHEN _order_by = 'timeDesc' THEN _key_time
	END > 
	CASE 
		WHEN _order_by = 'timeAsc' THEN _key_time
		WHEN _order_by = 'timeDesc' THEN swap.request_timestamp
	END), true) OR
	(swap.request_timestamp = _key_time
	AND CASE 
	 		WHEN swap.requester_uid = _account_uid THEN swap.requestee_uid 
	 		ELSE  swap.requester_uid
	 	END
	 	> _key_swapper_uid))
ORDER BY 
	CASE 
		WHEN _order_by = 'timeAsc' THEN swap.request_timestamp
	END ASC,
	CASE 
		WHEN _order_by = 'timeDesc' THEN swap.request_timestamp
	END DESC, 
	CASE 
		WHEN swap.requester_uid = _account_uid THEN swap.requestee_uid 
		ELSE  swap.requester_uid
	END
	LIMIT COALESCE(_pag_limit, 20);
END 
$$;
 �   DROP FUNCTION public.get_swaps(_account_uid uuid, _status character varying, _order_by character varying, _key_swapper_uid uuid, _key_time timestamp with time zone, _pag_limit integer);
       public          postgres    false    5            �            1259    18663    account    TABLE     [  CREATE TABLE public.account (
    account_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(30) NOT NULL,
    email character varying(80) NOT NULL,
    address_uid uuid NOT NULL,
    passhash character(60) NOT NULL,
    create_time timestamp(3) with time zone DEFAULT now() NOT NULL,
    update_time timestamp(3) with time zone DEFAULT now() NOT NULL,
    bio character varying(500) DEFAULT ''::character varying NOT NULL,
    circle_uid uuid NOT NULL,
    pfp_name character varying(200),
    avg_rating double precision,
    num_ratings integer DEFAULT 0 NOT NULL
);
    DROP TABLE public.account;
       public         heap    postgres    false    5    5    5            �            1259    18672    address    TABLE     �  CREATE TABLE public.address (
    address_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    address1 character varying(80) NOT NULL,
    address2 character varying(80),
    address3 character varying(80),
    city character varying(35) NOT NULL,
    province character varying(25) NOT NULL,
    postal_code character(6) NOT NULL,
    longitude double precision,
    latitude double precision
);
    DROP TABLE public.address;
       public         heap    postgres    false    5    5    5            �            1259    18676    circle    TABLE     �   CREATE TABLE public.circle (
    circle_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    radius double precision NOT NULL,
    latitude double precision,
    longitude double precision
);
    DROP TABLE public.circle;
       public         heap    postgres    false    5    5    5            �            1259    18840    cuisine    TABLE     L   CREATE TABLE public.cuisine (
    cuisine character varying(30) NOT NULL
);
    DROP TABLE public.cuisine;
       public         heap    postgres    false    5            �            1259    18680    cuisine_preference    TABLE     �   CREATE TABLE public.cuisine_preference (
    account_uid uuid NOT NULL,
    preference character varying(30) NOT NULL,
    preference_num integer NOT NULL
);
 &   DROP TABLE public.cuisine_preference;
       public         heap    postgres    false    5            �            1259    18683    cuisine_speciality    TABLE     �   CREATE TABLE public.cuisine_speciality (
    account_uid uuid NOT NULL,
    speciality character varying(30) NOT NULL,
    speciality_num integer NOT NULL
);
 &   DROP TABLE public.cuisine_speciality;
       public         heap    postgres    false    5            �            1259    18686    image    TABLE     �   CREATE TABLE public.image (
    image_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    account_uid uuid NOT NULL,
    image_name character varying(200) NOT NULL,
    "timestamp" timestamp(3) with time zone DEFAULT now() NOT NULL
);
    DROP TABLE public.image;
       public         heap    postgres    false    5    5    5            �            1259    18691    message    TABLE     K  CREATE TABLE public.message (
    message_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sender_uid uuid NOT NULL,
    receiver_uid uuid NOT NULL,
    message_content character varying(300) NOT NULL,
    "timestamp" timestamp(3) with time zone DEFAULT now() NOT NULL,
    system_message boolean DEFAULT false NOT NULL
);
    DROP TABLE public.message;
       public         heap    postgres    false    5    5    5            �            1259    18861    rating    TABLE     z   CREATE TABLE public.rating (
    account_uid uuid NOT NULL,
    swapper_uid uuid NOT NULL,
    rating integer NOT NULL
);
    DROP TABLE public.rating;
       public         heap    postgres    false    5            �            1259    18697    session    TABLE     �   CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);
    DROP TABLE public.session;
       public         heap    postgres    false    5            �            1259    18702    swap    TABLE     v  CREATE TABLE public.swap (
    requester_uid uuid NOT NULL,
    requestee_uid uuid NOT NULL,
    request_timestamp timestamp(3) with time zone DEFAULT now() NOT NULL,
    accept_timestamp timestamp(3) with time zone,
    end_timestamp timestamp(3) with time zone,
    lo_uid uuid GENERATED ALWAYS AS (
CASE
    WHEN (requester_uid < requestee_uid) THEN requester_uid
    ELSE requestee_uid
END) STORED NOT NULL,
    hi_uid uuid GENERATED ALWAYS AS (
CASE
    WHEN (requester_uid < requestee_uid) THEN requestee_uid
    ELSE requester_uid
END) STORED NOT NULL,
    CONSTRAINT swap_check CHECK ((requester_uid <> requestee_uid))
);
    DROP TABLE public.swap;
       public         heap    postgres    false    5            �          0    18663    account 
   TABLE DATA           �   COPY public.account (account_uid, username, email, address_uid, passhash, create_time, update_time, bio, circle_uid, pfp_name, avg_rating, num_ratings) FROM stdin;
    public          postgres    false    216   ��       �          0    18672    address 
   TABLE DATA           ~   COPY public.address (address_uid, address1, address2, address3, city, province, postal_code, longitude, latitude) FROM stdin;
    public          postgres    false    217   �       �          0    18676    circle 
   TABLE DATA           I   COPY public.circle (circle_uid, radius, latitude, longitude) FROM stdin;
    public          postgres    false    218   ��       �          0    18840    cuisine 
   TABLE DATA           *   COPY public.cuisine (cuisine) FROM stdin;
    public          postgres    false    225   Z�       �          0    18680    cuisine_preference 
   TABLE DATA           U   COPY public.cuisine_preference (account_uid, preference, preference_num) FROM stdin;
    public          postgres    false    219   ��       �          0    18683    cuisine_speciality 
   TABLE DATA           U   COPY public.cuisine_speciality (account_uid, speciality, speciality_num) FROM stdin;
    public          postgres    false    220   ��       �          0    18686    image 
   TABLE DATA           P   COPY public.image (image_uid, account_uid, image_name, "timestamp") FROM stdin;
    public          postgres    false    221   e�       �          0    18691    message 
   TABLE DATA           v   COPY public.message (message_uid, sender_uid, receiver_uid, message_content, "timestamp", system_message) FROM stdin;
    public          postgres    false    222   ��       �          0    18861    rating 
   TABLE DATA           B   COPY public.rating (account_uid, swapper_uid, rating) FROM stdin;
    public          postgres    false    226   ��       �          0    18697    session 
   TABLE DATA           4   COPY public.session (sid, sess, expire) FROM stdin;
    public          postgres    false    223   	�                 0    17930    spatial_ref_sys 
   TABLE DATA           X   COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
    public          postgres    false    212   �       �          0    18702    swap 
   TABLE DATA           p   COPY public.swap (requester_uid, requestee_uid, request_timestamp, accept_timestamp, end_timestamp) FROM stdin;
    public          postgres    false    224   /�       #           2606    18716    account account_email_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_email_key UNIQUE (email);
 C   ALTER TABLE ONLY public.account DROP CONSTRAINT account_email_key;
       public            postgres    false    216            %           2606    18718    account account_passhash_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_passhash_key UNIQUE (passhash);
 F   ALTER TABLE ONLY public.account DROP CONSTRAINT account_passhash_key;
       public            postgres    false    216            '           2606    18720    account account_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (account_uid);
 >   ALTER TABLE ONLY public.account DROP CONSTRAINT account_pkey;
       public            postgres    false    216            *           2606    18722    account account_username_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_username_key UNIQUE (username);
 F   ALTER TABLE ONLY public.account DROP CONSTRAINT account_username_key;
       public            postgres    false    216            ,           2606    18724    address address_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.address
    ADD CONSTRAINT address_pkey PRIMARY KEY (address_uid);
 >   ALTER TABLE ONLY public.address DROP CONSTRAINT address_pkey;
       public            postgres    false    217                       2606    18857    address address_province_check    CHECK CONSTRAINT     �  ALTER TABLE public.address
    ADD CONSTRAINT address_province_check CHECK (((province)::text = ANY (ARRAY['Ontario'::text, 'Quebec'::text, 'British Columbia'::text, 'Alberta'::text, 'Manitoba'::text, 'Saskatchewan'::text, 'Nova Scotia'::text, 'New Brunswick'::text, 'Newfoundland and Labrador'::text, 'Prince Edward Island'::text, 'Northwest Territories'::text, 'Yukon'::text, 'Nunavut'::text]))) NOT VALID;
 C   ALTER TABLE public.address DROP CONSTRAINT address_province_check;
       public          postgres    false    217    217            .           2606    18726    circle circle_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.circle
    ADD CONSTRAINT circle_pkey PRIMARY KEY (circle_uid);
 <   ALTER TABLE ONLY public.circle DROP CONSTRAINT circle_pkey;
       public            postgres    false    218            D           2606    18844    cuisine cuisine_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY public.cuisine
    ADD CONSTRAINT cuisine_pkey PRIMARY KEY (cuisine);
 >   ALTER TABLE ONLY public.cuisine DROP CONSTRAINT cuisine_pkey;
       public            postgres    false    225            0           2606    18728 D   cuisine_preference cuisine_preference_account_uid_preference_num_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_account_uid_preference_num_key UNIQUE (account_uid, preference_num);
 n   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_account_uid_preference_num_key;
       public            postgres    false    219    219                       2606    18729 :   cuisine_preference cuisine_preference_preference_num_check    CHECK CONSTRAINT     �   ALTER TABLE public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_preference_num_check CHECK (((preference_num >= 0) AND (preference_num < 6))) NOT VALID;
 _   ALTER TABLE public.cuisine_preference DROP CONSTRAINT cuisine_preference_preference_num_check;
       public          postgres    false    219    219            4           2606    18856 D   cuisine_speciality cuisine_speciality_account_uid_speciality_num_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_account_uid_speciality_num_key UNIQUE (account_uid, speciality_num);
 n   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_account_uid_speciality_num_key;
       public            postgres    false    220    220                       2606    18732 :   cuisine_speciality cuisine_speciality_speciality_num_check    CHECK CONSTRAINT     �   ALTER TABLE public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_speciality_num_check CHECK (((speciality_num >= 0) AND (speciality_num < 6))) NOT VALID;
 _   ALTER TABLE public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_speciality_num_check;
       public          postgres    false    220    220            8           2606    18734    image image_pkey 
   CONSTRAINT     U   ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (image_uid);
 :   ALTER TABLE ONLY public.image DROP CONSTRAINT image_pkey;
       public            postgres    false    221                       2606    18735    address latitude    CHECK CONSTRAINT     �   ALTER TABLE public.address
    ADD CONSTRAINT latitude CHECK (((latitude > ('-90'::integer)::double precision) AND (latitude < (90)::double precision))) NOT VALID;
 5   ALTER TABLE public.address DROP CONSTRAINT latitude;
       public          postgres    false    217    217                       2606    18736    address longitude    CHECK CONSTRAINT     �   ALTER TABLE public.address
    ADD CONSTRAINT longitude CHECK (((longitude > ('-180'::integer)::double precision) AND (longitude < (180)::double precision))) NOT VALID;
 6   ALTER TABLE public.address DROP CONSTRAINT longitude;
       public          postgres    false    217    217            :           2606    18740    message message_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_pkey PRIMARY KEY (message_uid);
 >   ALTER TABLE ONLY public.message DROP CONSTRAINT message_pkey;
       public            postgres    false    222                       2606    18917    rating rating_check    CHECK CONSTRAINT     o   ALTER TABLE public.rating
    ADD CONSTRAINT rating_check CHECK (((rating >= 1) AND (rating <= 5))) NOT VALID;
 8   ALTER TABLE public.rating DROP CONSTRAINT rating_check;
       public          postgres    false    226    226            F           2606    18906    rating rating_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_pkey PRIMARY KEY (account_uid, swapper_uid);
 <   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_pkey;
       public            postgres    false    226    226            =           2606    18742    session session_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);
 >   ALTER TABLE ONLY public.session DROP CONSTRAINT session_pkey;
       public            postgres    false    223            ?           2606    18950    swap swap_lo_uid_hi_uid_key 
   CONSTRAINT     `   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT swap_lo_uid_hi_uid_key UNIQUE (lo_uid, hi_uid);
 E   ALTER TABLE ONLY public.swap DROP CONSTRAINT swap_lo_uid_hi_uid_key;
       public            postgres    false    224    224            A           2606    18989    swap swap_pkey 
   CONSTRAINT     y   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT swap_pkey PRIMARY KEY (requester_uid, requestee_uid, request_timestamp);
 8   ALTER TABLE ONLY public.swap DROP CONSTRAINT swap_pkey;
       public            postgres    false    224    224    224            2           2606    18748 /   cuisine_preference user_cuisine_preference_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT user_cuisine_preference_pkey PRIMARY KEY (account_uid, preference);
 Y   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT user_cuisine_preference_pkey;
       public            postgres    false    219    219            6           2606    18750 /   cuisine_speciality user_cuisine_speciality_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT user_cuisine_speciality_pkey PRIMARY KEY (account_uid, speciality);
 Y   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT user_cuisine_speciality_pkey;
       public            postgres    false    220    220            ;           1259    18751    IDX_session_expire    INDEX     J   CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);
 (   DROP INDEX public."IDX_session_expire";
       public            postgres    false    223            (           1259    18752    account_uid_index    INDEX     L   CREATE INDEX account_uid_index ON public.account USING btree (account_uid);
 %   DROP INDEX public.account_uid_index;
       public            postgres    false    216            B           1259    19002    unique_swap_constraint    INDEX     v   CREATE UNIQUE INDEX unique_swap_constraint ON public.swap USING btree (lo_uid, hi_uid) WHERE (end_timestamp IS NULL);
 *   DROP INDEX public.unique_swap_constraint;
       public            postgres    false    224    224    224            T           2620    19010    swap swap_update_trigger    TRIGGER     �   CREATE TRIGGER swap_update_trigger BEFORE UPDATE OF accept_timestamp, end_timestamp ON public.swap FOR EACH ROW EXECUTE FUNCTION public.check_swap_timestamp_change();
 1   DROP TRIGGER swap_update_trigger ON public.swap;
       public          postgres    false    224    224    965    224            G           2606    18820     account account_address_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_address_uid_fkey FOREIGN KEY (address_uid) REFERENCES public.address(address_uid) NOT VALID;
 J   ALTER TABLE ONLY public.account DROP CONSTRAINT account_address_uid_fkey;
       public          postgres    false    216    4140    217            H           2606    18825    account account_circle_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_circle_uid_fkey FOREIGN KEY (circle_uid) REFERENCES public.circle(circle_uid) NOT VALID;
 I   ALTER TABLE ONLY public.account DROP CONSTRAINT account_circle_uid_fkey;
       public          postgres    false    4142    216    218            I           2606    18830 6   cuisine_preference cuisine_preference_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 `   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_account_uid_fkey;
       public          postgres    false    216    219    4135            J           2606    18845 5   cuisine_preference cuisine_preference_preference_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_preference_fkey FOREIGN KEY (preference) REFERENCES public.cuisine(cuisine) NOT VALID;
 _   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_preference_fkey;
       public          postgres    false    225    4164    219            K           2606    18835 6   cuisine_speciality cuisine_speciality_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 `   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_account_uid_fkey;
       public          postgres    false    4135    216    220            L           2606    18850 5   cuisine_speciality cuisine_speciality_speciality_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_speciality_fkey FOREIGN KEY (speciality) REFERENCES public.cuisine(cuisine) NOT VALID;
 _   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_speciality_fkey;
       public          postgres    false    4164    225    220            M           2606    18815    image image_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 F   ALTER TABLE ONLY public.image DROP CONSTRAINT image_account_uid_fkey;
       public          postgres    false    221    4135    216            P           2606    18768    swap match_account1_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT match_account1_uid_fkey FOREIGN KEY (requester_uid) REFERENCES public.account(account_uid);
 F   ALTER TABLE ONLY public.swap DROP CONSTRAINT match_account1_uid_fkey;
       public          postgres    false    224    4135    216            Q           2606    18773    swap match_account2_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT match_account2_uid_fkey FOREIGN KEY (requestee_uid) REFERENCES public.account(account_uid);
 F   ALTER TABLE ONLY public.swap DROP CONSTRAINT match_account2_uid_fkey;
       public          postgres    false    4135    216    224            N           2606    18778 !   message message_receiver_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_receiver_uid_fkey FOREIGN KEY (receiver_uid) REFERENCES public.account(account_uid);
 K   ALTER TABLE ONLY public.message DROP CONSTRAINT message_receiver_uid_fkey;
       public          postgres    false    216    222    4135            O           2606    18783    message message_sender_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_sender_uid_fkey FOREIGN KEY (sender_uid) REFERENCES public.account(account_uid);
 I   ALTER TABLE ONLY public.message DROP CONSTRAINT message_sender_uid_fkey;
       public          postgres    false    222    216    4135            R           2606    18907    rating rating_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) NOT VALID;
 H   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_account_uid_fkey;
       public          postgres    false    4135    216    226            S           2606    18912    rating rating_swapper_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_swapper_uid_fkey FOREIGN KEY (swapper_uid) REFERENCES public.account(account_uid) NOT VALID;
 H   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_swapper_uid_fkey;
       public          postgres    false    4135    226    216            �   (	  x�}WYR#I��:�ڬ��"�}�W	b� m,�fm���5�'�#��\q�0/E������D��|���{��8K#�(A\����D��Q�tf�WV���d�j�H�H%���!�%�O�	�4�dR�'�r�������s�����2�w�!�LTC�_�'7���%���ɘQL)"QY��JX��\a�/���R����G�l�q�2�x�D��*��V��_�Q;��X �=C&���FRJ��p(�~�M�K/5�sA�ZFd%U�n0u�������*���A������/
��d(���#g3��Q�Y�?׋���x�s�?.e����a�$�3J"�tIa)?���XX����P�qԣhR��o���q�L�+����}}�c�8	L�5�2��H�9��C�ax�����˛]vv{�ymo_�GO��z����y�l&��oE}XL7�t_U�̱Q������bF!�D�ƀ���$��B����c��as�V��*����R��
Y�;l� ����HJ� � �I��w�gғ`���+��7:;�\ܞ4y�_�v��qqڛ��ړ�
�򱵍���Ћ�q�jWç_������V�c)Ö:U��D���9���t��1fݡrK!x����ܬ�&п�a����u�v��<��q�g�L%���	9k<�>8d��HRL�!Z�� ��w-NN����m�����E�dz���m��sn<ry���/�j�&�xJUb]V�E���� �*W)�՜Y.M��x0�dd�� P�L��[��-�*�R�U�L88���j�X!�A2B��:���1NW/����U	��oL�&�O��`d�.A)E�#���y���H��� ���b��$�K�	�J�J�d��vH��!�z�ޑ솗��r�%��RӶw^��>�L�}}�s�kO1�r��l�a�p�
�Ux���ޖ8�e.�^B;�Z�*���ȓDJ�ubb�!H:'�J�a���^Y��E*�cA�)JQ"��*�H�� o��Xh�Wء�4)�vA!N��� ���r�vC]�^�g�����y:-��k���|�|�Ԭ==���o��v٩���{�Z!zO�����)��P9�{=y�~PG%"�HUW �30/��$������c�	W`�@A��e�H(��2┽��8�����xqh��	 ��k:�(�B� Y�9�@�����kܝ��nyR�j��;�~��w�#";�ݱﵖq���e%��S��D�_���"��
P{�,_e ��q��� Ap�dm �èa�p�5�R�m����V_�(m$��!�e�|���a�`b�T� ����5�a���t{���
�u���N��V'�m�����2����t3�������K�~���R)@Y�~.*֭f�bǻ�x����y?*��Ͽ����%q�"���וx)n��Zo�Έ&�,@��r��:��NM)V�#��!6 ���cH�a�" ��<[a���{����>p*�y|�Z2�@�]J
�d�^D��;���Z�:�Wc��J����N�х��NO���^�+�{�̛O����zL�BC0�؟� ��q!�Dc.�F����j81��X%����x�8/�c� p�?�1��˛���a�1�D���P �@=��!����g�z����z��ͷ�����^�G���}ʯ��M�vr7厍�?�3��b���sZ�tLk!P�
�#B3�yo9(��ܨ
��0J�2�A(����]�
{�bxc�����=%�%�p���y����>�����x��=���G�/��k���F�>�o���+�7�"��qmi���a�S���\<�W��%���OK�.!�&HK+�.^S�R`�12�U���( ��0	�LĈ=�6���?���/ֳ�l�����C��C,*��N�Y������v��3|w}�w�1�ڴ���`�(�*��!�]�����ܺfc�o����b�拏М��-aZ��*p�����(<&�X)���,~|���%:�U$�+3�"1�0H*�Ly�Z���%��m�� � �X��O�ڎ�+��]�ܲ���}	*.#��H�����f�8��@�-�����?ɉs�^��P�]��X�'�9v�֠������_�
�tۧ�U�t{��hv|��l�����)+��\(�A�KǪJHn�ީ�a�꼪�l(|�����Y�y��Ӏ����V��0sJ2�Y $P����Y	69�"s�$���gA=M~_��s�����;x�_�|�)e�      �   �  x��VˎG<��B�)t���8��������`�l!k	����߇#��I �5i$��I�E�4)'(#gȪD�@ZoT4Ϲ��_���w��8�Ϸ�o�|i������Wϟ���������ݸ,?���g����{��r�Ǜ�@�t�8qY�P�Q㮘،��U�-'������X�.7f�,��~<=��x^n��Z@�!at)�%1��Ԩ��(��`�! Ƭ������r|8޿�??�=��G��qD>Pf�@KIF"��AS�C���%��[ˑĢƧ���da��D:!�N�����[���X�w�?�O����;�ov���]����8ҡ0���zbM	9��a�Z�̪��@��
yV1.��o�wG?��W;�-���^/�]��r~|��SDג�XQJ����),A�.��ez	�o~"ڨ�z�-�t�LV���e��u�au�0yn
�B�}�7�=�5Uv|��FQ��)`y��l�y�b����[�Es覀$��s�N�RLBq���!�{����<:VR�4�4�E,����M�M�Hh�"h���
Ɣ�T��b�^lS��֓�-��T�-�&�P���7ta!���4<���K��%���H�m�PFr���q��am)�)ɬ󶍟�aoȊG�r�M�&�0х���)���jN�&g���J��`�2���V�GL��-�5��L���Ƥqbʜ��F�<�5�Bu��Ň��5,)����݋��Ö!�jd���n
8��ـ��=��	J� �A"�0�.�o����o��kj������飷�.� Wo�$��V���x�|����c�x���lہ<Q�mB5���{u�>���(m[Q��,Q�v�K�5��;��S5�q��u��w�r;����rj�3@z]�Q<��|�|\Kƃ�?w�;�<ɧ��.w�v�\�y{���S�'����HZ������왒�}�Dت{��I�����ˇ�_Ƃ;\��0dC��2���r�U�l<�-�����������������a�|��qx ���B;�S.�tT	��d��������~?/U����e��?��~X�x��@����K�C��K=I]����q�?�����<}�Od�`��9�ܶX;��C�a��[�:'��Uoa��6yY�2��n��S�k�      �   �  x�UVIr�H<7�R���O��R���0I��zd��v��	�F�=���dEk%Κ%d���4U~��4�J�N֪۫˻f�C�Z�I\�u]}[�V��*}�#�����e��g`�h��@�6G;dR��納,=��*�k�<�=�����I�4|#m<��V�0*���\�������aͣ2�Δ2�U�sd����_�;�9gc�Wi�b�A\M����t�ҷ��U�i�1c�H����_n���YIr�W	{����UU�r�5j_E� �G	nb���*m�g��[ժ��* �}��v�TK�h��Z]��g\�$��e�*��8>�5�VX�~)��a�J:̲l��=���!�e��M�:��������H��%��X�v��.V�ByV�h1��Ǟ6D��]6Y �b�)��Io��	�*�Le�y�o%Ȁ�@�sY;u��^��=\�e�/t����ՔA?�e,q
Y���@�R,F�}s��i���U�Z~O�*�5�P�Sc�G9 �p{y�w�ud~�S\I-2��.��h�(�]=;|x�i�	�e-�7��� g�kM��[x_�@Bu�c���J�I��`�b��g�"2O�YO�W���f$������C���Uak����`G݊Pa	X��-���7.���QY�q��xe��k���Ό%��\Ȩ�೾��'�Ҭ����Hn��ѕ'�X�
��]1[�v��vK��ミ���^����0�T��|�r�Bl��-;��e�9�38��%)=谪�B���_�k�#z��ԃ�u���?�>� A!e��v	n��T�.��]_��0�]�)�vǓ�)&ó����l4Lyd�7¬P���^VU�{����-k��g��}.��zp>@���n�����b�U��8ҵ�D⩘#������W����M57�kW��,�u]�F��xvPe'� �:*��,:C$�%���ϙZ����e��8�94>]Ɗ�ª���c<���ԥzwS�#a 9Z��BmX},��&w����?�k��u-/�N/��-�hZ��1��Q[�$���.2��e��OD>L��Mp�	8U�kP`�&|&/w.'��$ �Gv��)���[X���mَ|rمj(�`���o�3q�� �]Ao3�d�8,;�٦(m��+#�3���g�y~��B�d���n����\��;����<q���f�,�NuOݽ�_͢�.Z���YAEH������剗4D�w����$k���&�
��@P-�-�cY���9/�=��-�.��	x5)Q�ް�o/��w�B~Zѐ�(I�_^�}x������6@!h
$��mE�?�э3�s8P� 0 f�k�|z�ԅ��YZ�>F�@��5#� "�-��46�/}P#[������� `W�      �   a   x��;
�0D�9����D��f1Y?Qb��M����(5B:�&K�L�5moR+�F��2���
�.��س���'X�'k�Ab$���љ�K��#$q      �   �   x����nC1Fq�.����-��6ipĉc��TP��w�K
o��;_a%�ա�l�+A�e���(��v�k�hc�<@����.��ԉ}�VZ8������~א������ٵ��� 1u���a��+�LŪ�Zi���>j3�
.ف�4hXܸ����,~:�o=ʑg�xt���fUj�PW�$�����b���?_b�E*��      �   �   x��й1�:��N�[D%�'b�Q��sS���5�V��Bt��|V�c,�{7���x�#�x�����P@D`�89/U��F���f�d~&��\_|0|{k�b��O�"��{b�%*6�J��)�����43�i?ƿ�Eދc����> �Æo      �     x����n#G���S�K@�dk�1�C.�6Q�Ȑm$y������swu�T��W��f��}P1mĒ<��Y��q��8�YE��f"I�E�l��k�\s3�"E/�*W�Z%�^Kk��:��?^N��_�翇�^��UI'�lG����&���n�B�x����J����y��/�.��S�"��$j%7�9֜A�����{���2�ş�^/ϟ��t��np��h:��'�J�����cS��r�;-S��* ÙX1ֶ�+b/�I-]�.S�,��j�g�/�2������IX�U���8e�z���r�)n���-,�Lr�25g
��t��v)zqB5�p��A-��̊sh���]�����j�m����!\k� c�'(;//���G0۳C8J:����1���a��6�����R|�yW���8(F���Ь0'�$�-��C�����t����{z8=�~�B�{��z�|`�.沒�R.+ncg��u�2�,�:v��6"���F[��q%��]�,%����b��(������b�d�/�7;����G��7�%�gr�1֢[r��<����jrSϖt'i[��wm�y����ϧ3��9S8�rճrK�N�6)�-*q�&��Z����dm��
�L�F�}`Y���1#��r���x�UյCri̾(�������(��
���f��P-��7�I��:����6'w�����w���<� �b��so�H�Z���O�o������O���-8j�SC)��0�&�H	�4q>Л��FW��s�����q�N�ĆĽ[��t����r�g��$�:���kG�����$����e��ؼ�����PF}�ؐ���|}�����1�u�|���n�yÂn�:Z~�BEhQ�tb[�V�5�۰�W���)TE3Ε��\P5���C,�,�cT$��h��-�f���y��'�CTM�߆���0?�:#�D�A�>)Y��Q)���X��"�Q�~��!�e&\���p_�7�� �^ʪ��E��1q������v��8����������pww��.?      �      x������ � �      �   I   x����0 ���E_	��G��G�ݖ��r���R3�cTj�\�n<�=�F���QV3F�F��T���� �c;�      �   �   x�ŏ�N�@ E��+̬�:̫3���@CS��)q3�@I	P��K7�w�]��ޓ��0~�%��ps7#�_�1�[�އ�?.N m�Ci�:��+����F��b&�St��ؖ��a=��<�<�Z�N�z��\�u��m�u5��V���p�.�i����l&�j�Q#�ԩ�Ԡ~�!�rj2,���꫋�(��M/�Κ�@7��ǰ}����_It�9���U�q���d�(��Ra�|,��:�	            x������ � �      �   !  x���;n1Dk�����9��J��"p�)ր��q���2t6h~TЉv1��9��V�Gq��PfP����pb3�#3���E�i���x�}�w�gH�B�� bh�r��˜�G��H��0N�tj�ۙ�I����Q${��
��S�JT-L�K�W7T]g5�GX��k�ڒP{�=�j{�ca�Lh�2@m"�{���ĺ�t�n9�3��B6�Nڹ&2�WRM&eI�N����&���
�q(��Q��ă���Q��:R�V��]��@Ɋ�/����z��\��     