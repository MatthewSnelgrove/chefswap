PGDMP                          {            chefswap    14.4 (Debian 14.4-1.pgdg110+1)    14.5 N    #           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            $           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            %           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            &           1262    17619    chefswap    DATABASE     \   CREATE DATABASE chefswap WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.utf8';
    DROP DATABASE chefswap;
                postgres    false                        2615    2200    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
             
   flypgadmin    false            '           0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                
   flypgadmin    false    6            ?           1255    19009    check_swap_timestamp_change()    FUNCTION     y  CREATE FUNCTION public.check_swap_timestamp_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW."accept_timestamp" IS DISTINCT FROM OLD."accept_timestamp" AND OLD."accept_timestamp" IS NOT NULL
  THEN
    RAISE EXCEPTION 'accept_timestamp is immutable';
  END IF;
  IF NEW."end_timestamp" IS DISTINCT FROM OLD."end_timestamp" AND OLD."end_timestamp" IS NOT NULL
  THEN
    RAISE EXCEPTION 'end_timestamp is immutable';
  END IF;
  IF NEW."end_timestamp" IS NOT NULL AND OLD."accept_timestamp" IS NULL
  THEN
    RAISE EXCEPTION 'end_timestamp requires non-null accept_timestamp';
  END IF;

  RETURN NEW;
END;
$$;
 4   DROP FUNCTION public.check_swap_timestamp_change();
       public          postgres    false    6            ?           1255    18662 ?   get_address_uid(character varying, character varying, character varying, character varying, character varying, character varying)    FUNCTION       CREATE FUNCTION public.get_address_uid(f_address1 character varying, f_address2 character varying, f_address3 character varying, f_city character varying, f_province character varying, f_postal_code character varying) RETURNS uuid
    LANGUAGE sql
    AS $$
SELECT address_uid FROM address WHERE address1=f_address1 AND 
((address2=f_address2) OR (COALESCE(address2, f_address2) IS NULL)) AND 
((address3=f_address3) OR (COALESCE(address3, f_address3) IS NULL)) AND 
city=f_city AND province=f_province AND postal_code=f_postal_code;
$$;
 ?   DROP FUNCTION public.get_address_uid(f_address1 character varying, f_address2 character varying, f_address3 character varying, f_city character varying, f_province character varying, f_postal_code character varying);
       public          postgres    false    6            ?           1255    24668 ?   get_profiles(double precision, double precision, double precision, double precision, double precision, character varying[], character varying[], uuid, character varying, uuid, double precision, double precision, integer)    FUNCTION       CREATE FUNCTION public.get_profiles(_origin_lat double precision, _origin_lng double precision, _max_distance double precision, _min_rating double precision, _max_rating double precision, _cuisine_preferences character varying[], _cuisine_specialities character varying[], _matchable_with uuid, _order_by character varying, _key_account_uid uuid, _key_distance double precision, _key_avg_rating double precision, _pag_limit integer) RETURNS TABLE(profile json)
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
	SELECT account.account_uid, ROUND(AVG(rating.rating), 2) AS avg_rating, ROUND(COUNT(rating.rating)) AS num_ratings
	FROM account LEFT JOIN rating ON account.account_uid = rating.swapper_uid GROUP BY account.account_uid
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
 SELECT json_build_object('account_uid', account.account_uid, 'username', account.username, 'create_time', account.create_time, 'update_time', account.update_time, 'bio', account.bio, 'pfp_link', 'https://storage.googleapis.com/chefswap_0/'::text || account.pfp_name::text, 'avg_rating', avg_rating.avg_rating, 'num_ratings', avg_rating.num_ratings, 'circle', json_build_object('radius', circle.radius, 'latitude', circle.latitude, 'longitude', circle.longitude), 'images', COALESCE(images_per_account.images, '[]'::json), 'cuisine_preferences', COALESCE(agged_preferences.preferences, ARRAY[]::varchar[]), 'cuisine_specialities', COALESCE(agged_specialities.specialities, ARRAY[]::varchar[]), 'distance', distance_per_account.distance) AS profile
   FROM account
     LEFT JOIN circle USING (circle_uid)
     LEFT JOIN images_per_account USING (account_uid)
     LEFT JOIN agged_preferences USING (account_uid)
     LEFT JOIN agged_specialities USING (account_uid)
     LEFT JOIN address USING (address_uid)
	 LEFT JOIN avg_rating USING (account_uid)
	 LEFT JOIN distance_per_account USING (account_uid)
WHERE (_max_distance IS null OR distance_per_account.distance <= _max_distance)
AND (_min_rating IS null OR avg_rating.avg_rating >= _min_rating)
AND (_max_rating IS null OR avg_rating.avg_rating >= _max_rating)
AND (_cuisine_preferences IS null OR _cuisine_preferences && agged_preferences.preferences)
AND (_cuisine_specialities IS null OR _cuisine_specialities && agged_specialities.specialities)
AND (COALESCE(
	(CASE 
		WHEN _order_by = 'avgRatingAsc' THEN COALESCE(avg_rating.avg_rating, 6)
		WHEN _order_by = 'avgRatingDesc' THEN _key_avg_rating
		WHEN _order_by = 'distanceAsc' THEN distance_per_account.distance
		WHEN _order_by = 'distanceDesc' THEN _key_distance
	END > 
	CASE 
		WHEN _order_by = 'avgRatingAsc' THEN _key_avg_rating
		WHEN _order_by = 'avgRatingDesc' THEN COALESCE(avg_rating.avg_rating, 0)
		WHEN _order_by = 'distanceAsc' THEN _key_distance
		WHEN _order_by = 'distanceDesc' THEN distance_per_account.distance
	END), true) OR
	(CASE 
		WHEN _order_by = 'avgRatingAsc' THEN COALESCE(avg_rating.avg_rating, 6)
		WHEN _order_by = 'avgRatingDesc' THEN _key_avg_rating
		WHEN _order_by = 'distanceAsc' THEN distance_per_account.distance
		WHEN _order_by = 'distanceDesc' THEN _key_distance
	END = 
	CASE 
		WHEN _order_by = 'avgRatingAsc' THEN _key_avg_rating
		WHEN _order_by = 'avgRatingDesc' THEN COALESCE(avg_rating.avg_rating, 0)
		WHEN _order_by = 'distanceAsc' THEN _key_distance
		WHEN _order_by = 'distanceDesc' THEN distance_per_account.distance
	END
	AND account.account_uid > _key_account_uid))
	AND account.account_uid NOT IN (SELECT requester_uid FROM swap WHERE requestee_uid = _matchable_with AND end_timestamp IS null)
	AND account.account_uid NOT IN (SELECT requestee_uid FROM swap WHERE requester_uid = _matchable_with AND end_timestamp IS null)
	AND NOT (COALESCE(account.account_uid = _matchable_with, false))
ORDER BY 
	CASE WHEN
		_order_by = 'avgRatingAsc' THEN avg_rating.avg_rating
	END ASC NULLS LAST,
	CASE WHEN
		_order_by = 'avgRatingDesc' THEN avg_rating.avg_rating
	END DESC NULLS LAST,
	CASE WHEN
		_order_by = 'distanceAsc' THEN distance_per_account.distance
	END ASC,
	CASE WHEN
		_order_by = 'distanceDesc' THEN distance_per_account.distance
	END DESC, account.account_uid
	LIMIT COALESCE(_pag_limit, 20);
END 
$$;
 ?  DROP FUNCTION public.get_profiles(_origin_lat double precision, _origin_lng double precision, _max_distance double precision, _min_rating double precision, _max_rating double precision, _cuisine_preferences character varying[], _cuisine_specialities character varying[], _matchable_with uuid, _order_by character varying, _key_account_uid uuid, _key_distance double precision, _key_avg_rating double precision, _pag_limit integer);
       public          postgres    false    6            ?           1255    24675 v   get_profiles_by_username(character varying, double precision, double precision, uuid, uuid, double precision, integer)    FUNCTION     ?  CREATE FUNCTION public.get_profiles_by_username(_username character varying, _origin_lat double precision, _origin_lng double precision, _matchable_with uuid, _key_account_uid uuid, _key_similarity double precision, _pag_limit integer) RETURNS TABLE(profile json)
    LANGUAGE plpgsql
    AS $$
BEGIN
IF _key_account_uid IS null THEN
	_key_account_uid := '00000000-0000-0000-0000-000000000000'::uuid;
END IF;
IF _key_similarity IS null THEN
	_key_similarity := 1::integer;
END IF;
IF _key_similarity < 0 THEN
	RAISE EXCEPTION '_key_similarity must be >= 0';
END IF;
IF _key_similarity > 1 THEN
	RAISE EXCEPTION '_key_similarity must be <=1';
END IF;
RETURN QUERY
WITH similarity_table AS (
		SELECT account.account_uid, similarity(_username, account.username) FROM account
	), avg_rating AS (
		SELECT account.account_uid, ROUND(AVG(rating.rating), 2) AS avg_rating, ROUND(COUNT(rating.rating)) AS num_ratings
		FROM account LEFT JOIN rating ON account.account_uid = rating.swapper_uid GROUP BY account.account_uid
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
 SELECT json_build_object('account_uid', account.account_uid, 'username', account.username, 'create_time', account.create_time, 'update_time', account.update_time, 'bio', account.bio, 'pfp_link', 'https://storage.googleapis.com/chefswap_0/'::text || account.pfp_name::text, 'avg_rating', avg_rating.avg_rating, 'num_ratings', avg_rating.num_ratings, 'circle', json_build_object('radius', circle.radius, 'latitude', circle.latitude, 'longitude', circle.longitude), 'images', COALESCE(images_per_account.images, '[]'::json), 'cuisine_preferences', COALESCE(agged_preferences.preferences, ARRAY[]::varchar[]), 'cuisine_specialities', COALESCE(agged_specialities.specialities, ARRAY[]::varchar[]), 'distance', distance_per_account.distance, 'similarity', similarity_table.similarity) AS profile
   FROM account
     LEFT JOIN circle USING (circle_uid)
     LEFT JOIN images_per_account USING (account_uid)
     LEFT JOIN agged_preferences USING (account_uid)
     LEFT JOIN agged_specialities USING (account_uid)
     LEFT JOIN address USING (address_uid)
	 LEFT JOIN avg_rating USING (account_uid)
	 LEFT JOIN distance_per_account USING (account_uid)
	 LEFT JOIN similarity_table USING (account_uid)
 WHERE (similarity_table.similarity > 0.2)
AND (
	  (similarity_table.similarity < _key_similarity) OR
	  (similarity_table.similarity = _key_similarity AND account.account_uid > _key_account_uid)
    )
	AND account.account_uid NOT IN (SELECT requester_uid FROM swap WHERE requestee_uid = _matchable_with AND end_timestamp IS null)
	AND account.account_uid NOT IN (SELECT requestee_uid FROM swap WHERE requester_uid = _matchable_with AND end_timestamp IS null)
	AND NOT (COALESCE(account.account_uid = _matchable_with, false))
ORDER BY similarity_table.similarity DESC, account_uid ASC
	LIMIT COALESCE(_pag_limit, 20);
END
$$;
 ?   DROP FUNCTION public.get_profiles_by_username(_username character varying, _origin_lat double precision, _origin_lng double precision, _matchable_with uuid, _key_account_uid uuid, _key_similarity double precision, _pag_limit integer);
       public          postgres    false    6            ?           1255    18940    get_single_account(uuid)    FUNCTION     g
  CREATE FUNCTION public.get_single_account(_account_uid uuid) RETURNS TABLE(profile json, email character varying, address json)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY
WITH avg_rating AS (
	SELECT account.account_uid, ROUND(AVG(rating.rating), 2) AS avg_rating, ROUND(COUNT(rating.rating)) AS num_ratings
	FROM account LEFT JOIN rating ON account.account_uid = rating.swapper_uid GROUP BY account.account_uid
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
       public          postgres    false    6            ?           1255    18941 <   get_single_profile(uuid, double precision, double precision)    FUNCTION     ?
  CREATE FUNCTION public.get_single_profile(_account_uid uuid, _origin_lat double precision, _origin_lng double precision) RETURNS TABLE(profile json)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY
WITH avg_rating AS (
	SELECT account.account_uid, ROUND(AVG(rating.rating), 2) AS avg_rating, ROUND(COUNT(rating.rating)) AS num_ratings
	FROM account LEFT JOIN rating ON account.account_uid = rating.swapper_uid GROUP BY account.account_uid
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
       public          postgres    false    6            ?           1255    18953 5   get_single_swap(uuid, uuid, timestamp with time zone)    FUNCTION     ?  CREATE FUNCTION public.get_single_swap(_account_uid uuid, _swapper_uid uuid, _request_timestamp timestamp with time zone) RETURNS TABLE(requester_uid uuid, requestee_uid uuid, request_timestamp timestamp with time zone, accept_timestamp timestamp with time zone, end_timestamp timestamp with time zone)
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
       public          postgres    false    6            ?           1255    18948 ^   get_swaps(uuid, character varying, character varying, uuid, timestamp with time zone, integer)    FUNCTION     	  CREATE FUNCTION public.get_swaps(_account_uid uuid, _status character varying, _order_by character varying, _key_swapper_uid uuid, _key_time timestamp with time zone, _pag_limit integer) RETURNS TABLE(requester_uid uuid, requestee_uid uuid, request_timestamp timestamp with time zone, accept_timestamp timestamp with time zone, end_timestamp timestamp with time zone)
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
-- primary ordering by time updated
	CASE 
		WHEN _order_by = 'timeAsc' THEN COALESCE(swap.end_timestamp, swap.accept_timestamp, swap.request_timestamp)
	END ASC,
	CASE 
		WHEN _order_by = 'timeDesc' THEN COALESCE(swap.end_timestamp, swap.accept_timestamp, swap.request_timestamp)
	END DESC, 
-- 	secondary ordering by swapper_uid 
	CASE 
		WHEN swap.requester_uid = _account_uid THEN swap.requestee_uid 
		ELSE  swap.requester_uid
	END
	LIMIT COALESCE(_pag_limit, 20);
END 
$$;
 ?   DROP FUNCTION public.get_swaps(_account_uid uuid, _status character varying, _order_by character varying, _key_swapper_uid uuid, _key_time timestamp with time zone, _pag_limit integer);
       public          postgres    false    6            ?            1259    18663    account    TABLE     [  CREATE TABLE public.account (
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
       public         heap    postgres    false    6    6    6            ?            1259    18672    address    TABLE     ?  CREATE TABLE public.address (
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
       public         heap    postgres    false    6    6    6            ?            1259    18676    circle    TABLE     ?   CREATE TABLE public.circle (
    circle_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    radius double precision NOT NULL,
    latitude double precision,
    longitude double precision
);
    DROP TABLE public.circle;
       public         heap    postgres    false    6    6    6            ?            1259    18840    cuisine    TABLE     L   CREATE TABLE public.cuisine (
    cuisine character varying(30) NOT NULL
);
    DROP TABLE public.cuisine;
       public         heap    postgres    false    6            ?            1259    18680    cuisine_preference    TABLE     ?   CREATE TABLE public.cuisine_preference (
    account_uid uuid NOT NULL,
    preference character varying(30) NOT NULL,
    preference_num integer NOT NULL
);
 &   DROP TABLE public.cuisine_preference;
       public         heap    postgres    false    6            ?            1259    18683    cuisine_speciality    TABLE     ?   CREATE TABLE public.cuisine_speciality (
    account_uid uuid NOT NULL,
    speciality character varying(30) NOT NULL,
    speciality_num integer NOT NULL
);
 &   DROP TABLE public.cuisine_speciality;
       public         heap    postgres    false    6            ?            1259    18686    image    TABLE     ?   CREATE TABLE public.image (
    image_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    account_uid uuid NOT NULL,
    image_name character varying(200) NOT NULL,
    "timestamp" timestamp(3) with time zone DEFAULT now() NOT NULL
);
    DROP TABLE public.image;
       public         heap    postgres    false    6    6    6            ?            1259    18691    message    TABLE     K  CREATE TABLE public.message (
    message_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sender_uid uuid NOT NULL,
    receiver_uid uuid NOT NULL,
    message_content character varying(300) NOT NULL,
    "timestamp" timestamp(3) with time zone DEFAULT now() NOT NULL,
    system_message boolean DEFAULT false NOT NULL
);
    DROP TABLE public.message;
       public         heap    postgres    false    6    6    6            ?            1259    18861    rating    TABLE     ?   CREATE TABLE public.rating (
    account_uid uuid NOT NULL,
    swapper_uid uuid NOT NULL,
    rating integer,
    update_timestamp timestamp(3) with time zone NOT NULL
);
    DROP TABLE public.rating;
       public         heap    postgres    false    6            ?            1259    18697    session    TABLE     ?   CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);
    DROP TABLE public.session;
       public         heap    postgres    false    6            ?            1259    18702    swap    TABLE     v  CREATE TABLE public.swap (
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
       public         heap    postgres    false    6                      0    18663    account 
   TABLE DATA           ?   COPY public.account (account_uid, username, email, address_uid, passhash, create_time, update_time, bio, circle_uid, pfp_name, avg_rating, num_ratings) FROM stdin;
    public          postgres    false    217   ?                 0    18672    address 
   TABLE DATA           ~   COPY public.address (address_uid, address1, address2, address3, city, province, postal_code, longitude, latitude) FROM stdin;
    public          postgres    false    218   ??                 0    18676    circle 
   TABLE DATA           I   COPY public.circle (circle_uid, radius, latitude, longitude) FROM stdin;
    public          postgres    false    219   ?                 0    18840    cuisine 
   TABLE DATA           *   COPY public.cuisine (cuisine) FROM stdin;
    public          postgres    false    226   G?                 0    18680    cuisine_preference 
   TABLE DATA           U   COPY public.cuisine_preference (account_uid, preference, preference_num) FROM stdin;
    public          postgres    false    220   ??                 0    18683    cuisine_speciality 
   TABLE DATA           U   COPY public.cuisine_speciality (account_uid, speciality, speciality_num) FROM stdin;
    public          postgres    false    221   }?                 0    18686    image 
   TABLE DATA           P   COPY public.image (image_uid, account_uid, image_name, "timestamp") FROM stdin;
    public          postgres    false    222   8?                 0    18691    message 
   TABLE DATA           v   COPY public.message (message_uid, sender_uid, receiver_uid, message_content, "timestamp", system_message) FROM stdin;
    public          postgres    false    223   6?                  0    18861    rating 
   TABLE DATA           T   COPY public.rating (account_uid, swapper_uid, rating, update_timestamp) FROM stdin;
    public          postgres    false    227   S?                 0    18697    session 
   TABLE DATA           4   COPY public.session (sid, sess, expire) FROM stdin;
    public          postgres    false    224   "?       9          0    17930    spatial_ref_sys 
   TABLE DATA           X   COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
    public          postgres    false    213   E?                 0    18702    swap 
   TABLE DATA           p   COPY public.swap (requester_uid, requestee_uid, request_timestamp, accept_timestamp, end_timestamp) FROM stdin;
    public          postgres    false    225   b?       U           2606    18716    account account_email_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_email_key UNIQUE (email);
 C   ALTER TABLE ONLY public.account DROP CONSTRAINT account_email_key;
       public            postgres    false    217            W           2606    18718    account account_passhash_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_passhash_key UNIQUE (passhash);
 F   ALTER TABLE ONLY public.account DROP CONSTRAINT account_passhash_key;
       public            postgres    false    217            Y           2606    18720    account account_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (account_uid);
 >   ALTER TABLE ONLY public.account DROP CONSTRAINT account_pkey;
       public            postgres    false    217            \           2606    18722    account account_username_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_username_key UNIQUE (username);
 F   ALTER TABLE ONLY public.account DROP CONSTRAINT account_username_key;
       public            postgres    false    217            ^           2606    18724    address address_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.address
    ADD CONSTRAINT address_pkey PRIMARY KEY (address_uid);
 >   ALTER TABLE ONLY public.address DROP CONSTRAINT address_pkey;
       public            postgres    false    218            A           2606    18857    address address_province_check    CHECK CONSTRAINT     ?  ALTER TABLE public.address
    ADD CONSTRAINT address_province_check CHECK (((province)::text = ANY (ARRAY['Ontario'::text, 'Quebec'::text, 'British Columbia'::text, 'Alberta'::text, 'Manitoba'::text, 'Saskatchewan'::text, 'Nova Scotia'::text, 'New Brunswick'::text, 'Newfoundland and Labrador'::text, 'Prince Edward Island'::text, 'Northwest Territories'::text, 'Yukon'::text, 'Nunavut'::text]))) NOT VALID;
 C   ALTER TABLE public.address DROP CONSTRAINT address_province_check;
       public          postgres    false    218    218            `           2606    18726    circle circle_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.circle
    ADD CONSTRAINT circle_pkey PRIMARY KEY (circle_uid);
 <   ALTER TABLE ONLY public.circle DROP CONSTRAINT circle_pkey;
       public            postgres    false    219            u           2606    18844    cuisine cuisine_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY public.cuisine
    ADD CONSTRAINT cuisine_pkey PRIMARY KEY (cuisine);
 >   ALTER TABLE ONLY public.cuisine DROP CONSTRAINT cuisine_pkey;
       public            postgres    false    226            b           2606    18728 D   cuisine_preference cuisine_preference_account_uid_preference_num_key 
   CONSTRAINT     ?   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_account_uid_preference_num_key UNIQUE (account_uid, preference_num);
 n   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_account_uid_preference_num_key;
       public            postgres    false    220    220            E           2606    18729 :   cuisine_preference cuisine_preference_preference_num_check    CHECK CONSTRAINT     ?   ALTER TABLE public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_preference_num_check CHECK (((preference_num >= 0) AND (preference_num < 6))) NOT VALID;
 _   ALTER TABLE public.cuisine_preference DROP CONSTRAINT cuisine_preference_preference_num_check;
       public          postgres    false    220    220            f           2606    18856 D   cuisine_speciality cuisine_speciality_account_uid_speciality_num_key 
   CONSTRAINT     ?   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_account_uid_speciality_num_key UNIQUE (account_uid, speciality_num);
 n   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_account_uid_speciality_num_key;
       public            postgres    false    221    221            F           2606    18732 :   cuisine_speciality cuisine_speciality_speciality_num_check    CHECK CONSTRAINT     ?   ALTER TABLE public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_speciality_num_check CHECK (((speciality_num >= 0) AND (speciality_num < 6))) NOT VALID;
 _   ALTER TABLE public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_speciality_num_check;
       public          postgres    false    221    221            j           2606    18734    image image_pkey 
   CONSTRAINT     U   ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (image_uid);
 :   ALTER TABLE ONLY public.image DROP CONSTRAINT image_pkey;
       public            postgres    false    222            B           2606    18735    address latitude    CHECK CONSTRAINT     ?   ALTER TABLE public.address
    ADD CONSTRAINT latitude CHECK (((latitude > ('-90'::integer)::double precision) AND (latitude < (90)::double precision))) NOT VALID;
 5   ALTER TABLE public.address DROP CONSTRAINT latitude;
       public          postgres    false    218    218            C           2606    18736    address longitude    CHECK CONSTRAINT     ?   ALTER TABLE public.address
    ADD CONSTRAINT longitude CHECK (((longitude > ('-180'::integer)::double precision) AND (longitude < (180)::double precision))) NOT VALID;
 6   ALTER TABLE public.address DROP CONSTRAINT longitude;
       public          postgres    false    218    218            l           2606    18740    message message_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_pkey PRIMARY KEY (message_uid);
 >   ALTER TABLE ONLY public.message DROP CONSTRAINT message_pkey;
       public            postgres    false    223            P           2606    18917    rating rating_check    CHECK CONSTRAINT     o   ALTER TABLE public.rating
    ADD CONSTRAINT rating_check CHECK (((rating >= 1) AND (rating <= 5))) NOT VALID;
 8   ALTER TABLE public.rating DROP CONSTRAINT rating_check;
       public          postgres    false    227    227            w           2606    18906    rating rating_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_pkey PRIMARY KEY (account_uid, swapper_uid);
 <   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_pkey;
       public            postgres    false    227    227            Q           2606    24585    rating self_rate_check    CHECK CONSTRAINT     m   ALTER TABLE public.rating
    ADD CONSTRAINT self_rate_check CHECK ((account_uid <> swapper_uid)) NOT VALID;
 ;   ALTER TABLE public.rating DROP CONSTRAINT self_rate_check;
       public          postgres    false    227    227    227    227            o           2606    18742    session session_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);
 >   ALTER TABLE ONLY public.session DROP CONSTRAINT session_pkey;
       public            postgres    false    224            s           2606    18989    swap swap_pkey 
   CONSTRAINT     y   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT swap_pkey PRIMARY KEY (requester_uid, requestee_uid, request_timestamp);
 8   ALTER TABLE ONLY public.swap DROP CONSTRAINT swap_pkey;
       public            postgres    false    225    225    225            d           2606    18748 /   cuisine_preference user_cuisine_preference_pkey 
   CONSTRAINT     ?   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT user_cuisine_preference_pkey PRIMARY KEY (account_uid, preference);
 Y   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT user_cuisine_preference_pkey;
       public            postgres    false    220    220            h           2606    18750 /   cuisine_speciality user_cuisine_speciality_pkey 
   CONSTRAINT     ?   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT user_cuisine_speciality_pkey PRIMARY KEY (account_uid, speciality);
 Y   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT user_cuisine_speciality_pkey;
       public            postgres    false    221    221            m           1259    18751    IDX_session_expire    INDEX     J   CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);
 (   DROP INDEX public."IDX_session_expire";
       public            postgres    false    224            Z           1259    18752    account_uid_index    INDEX     L   CREATE INDEX account_uid_index ON public.account USING btree (account_uid);
 %   DROP INDEX public.account_uid_index;
       public            postgres    false    217            p           1259    19025 $   swap_end_timestamp_lo_uid_hi_uid_key    INDEX     ?   CREATE UNIQUE INDEX swap_end_timestamp_lo_uid_hi_uid_key ON public.swap USING btree (COALESCE(end_timestamp, '2001-09-11 08:45:00+00'::timestamp with time zone), lo_uid, hi_uid);
 8   DROP INDEX public.swap_end_timestamp_lo_uid_hi_uid_key;
       public            postgres    false    225    225    225            q           1259    19024 
   swap_index    INDEX     f   CREATE INDEX swap_index ON public.swap USING btree (requester_uid, requestee_uid, request_timestamp);
    DROP INDEX public.swap_index;
       public            postgres    false    225    225    225            ?           2620    19010    swap swap_update_trigger    TRIGGER     ?   CREATE TRIGGER swap_update_trigger BEFORE UPDATE OF accept_timestamp, end_timestamp ON public.swap FOR EACH ROW EXECUTE FUNCTION public.check_swap_timestamp_change();
 1   DROP TRIGGER swap_update_trigger ON public.swap;
       public          postgres    false    225    225    965    225            x           2606    18820     account account_address_uid_fkey    FK CONSTRAINT     ?   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_address_uid_fkey FOREIGN KEY (address_uid) REFERENCES public.address(address_uid) NOT VALID;
 J   ALTER TABLE ONLY public.account DROP CONSTRAINT account_address_uid_fkey;
       public          postgres    false    218    4190    217            y           2606    18825    account account_circle_uid_fkey    FK CONSTRAINT     ?   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_circle_uid_fkey FOREIGN KEY (circle_uid) REFERENCES public.circle(circle_uid) NOT VALID;
 I   ALTER TABLE ONLY public.account DROP CONSTRAINT account_circle_uid_fkey;
       public          postgres    false    219    217    4192            z           2606    18830 6   cuisine_preference cuisine_preference_account_uid_fkey    FK CONSTRAINT     ?   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 `   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_account_uid_fkey;
       public          postgres    false    220    217    4185            {           2606    18845 5   cuisine_preference cuisine_preference_preference_fkey    FK CONSTRAINT     ?   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_preference_fkey FOREIGN KEY (preference) REFERENCES public.cuisine(cuisine) NOT VALID;
 _   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_preference_fkey;
       public          postgres    false    220    226    4213            |           2606    18835 6   cuisine_speciality cuisine_speciality_account_uid_fkey    FK CONSTRAINT     ?   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 `   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_account_uid_fkey;
       public          postgres    false    217    221    4185            }           2606    18850 5   cuisine_speciality cuisine_speciality_speciality_fkey    FK CONSTRAINT     ?   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_speciality_fkey FOREIGN KEY (speciality) REFERENCES public.cuisine(cuisine) NOT VALID;
 _   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_speciality_fkey;
       public          postgres    false    226    221    4213            ~           2606    18815    image image_account_uid_fkey    FK CONSTRAINT     ?   ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 F   ALTER TABLE ONLY public.image DROP CONSTRAINT image_account_uid_fkey;
       public          postgres    false    217    4185    222            ?           2606    18768    swap match_account1_uid_fkey    FK CONSTRAINT     ?   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT match_account1_uid_fkey FOREIGN KEY (requester_uid) REFERENCES public.account(account_uid);
 F   ALTER TABLE ONLY public.swap DROP CONSTRAINT match_account1_uid_fkey;
       public          postgres    false    225    4185    217            ?           2606    18773    swap match_account2_uid_fkey    FK CONSTRAINT     ?   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT match_account2_uid_fkey FOREIGN KEY (requestee_uid) REFERENCES public.account(account_uid);
 F   ALTER TABLE ONLY public.swap DROP CONSTRAINT match_account2_uid_fkey;
       public          postgres    false    225    4185    217                       2606    18778 !   message message_receiver_uid_fkey    FK CONSTRAINT     ?   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_receiver_uid_fkey FOREIGN KEY (receiver_uid) REFERENCES public.account(account_uid);
 K   ALTER TABLE ONLY public.message DROP CONSTRAINT message_receiver_uid_fkey;
       public          postgres    false    217    4185    223            ?           2606    18783    message message_sender_uid_fkey    FK CONSTRAINT     ?   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_sender_uid_fkey FOREIGN KEY (sender_uid) REFERENCES public.account(account_uid);
 I   ALTER TABLE ONLY public.message DROP CONSTRAINT message_sender_uid_fkey;
       public          postgres    false    4185    217    223            ?           2606    18907    rating rating_account_uid_fkey    FK CONSTRAINT     ?   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) NOT VALID;
 H   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_account_uid_fkey;
       public          postgres    false    4185    227    217            ?           2606    18912    rating rating_swapper_uid_fkey    FK CONSTRAINT     ?   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_swapper_uid_fkey FOREIGN KEY (swapper_uid) REFERENCES public.account(account_uid) NOT VALID;
 H   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_swapper_uid_fkey;
       public          postgres    false    227    217    4185               o  x?}XYR#˖??]????E??W?I?b??(?3?#h?`o	??[?%??(?*kL??H)t<????!E??H??:y?C?Df??V	a??j?yN???[_X????R? ??O%(W,S?5???o????FV??f?h?@lw?:?罧?T?Ʀ?????w?f?O=QDڎ??s?S?	c??ʷ???2T????R???̔?,9??&?4??d???ƿ????e??6?@???Hq?b?u?s?u/??t??7xQGm	?e[?????OĤ?<8?Z?\	????y????Y{?w??W+?fl??o??)?1??????뙽?|?MnQ[Q??P?ǥ??<?4???	?hb?ӡ?2?oe? $U^??q?U??#ɮ?(p?Κ?2/???톿????o?^~??		bE9X?? ??Dl?Q2m=s??;*?;~%/?Ӯ????<????????????㓿z<??O5??{?jo??<?v?f???:?>.???r???4?>'???%UT?e?`P???? ??????\N?(k???F???Ⱦ???G@{?S2?h?
pN???9^??Б%????(???????|?T^^???j?j???_???y?Z?7W????????̖??򏕿/5???g?q$Y/%??@P??Q!|x??a)??IQ??7[bί$??h?R֭?_??nǾ???t?0?[m|!????O?8n8ќ???5???????d;?͓x޼6?????????|y^???U?a?V???Ce.?:?oUR[W)?W?T?# Llp??V+?t?4ɏ??iCg?K?+,??K???hU?Rق*EC\]?ĩ?25?YHF*4??R??v?<???n???ޕQ?????????F??Z1RJF9l뽈$?3??k? ?????H?P?K?Qj?*?f??qh??1??/?Hv????3?](?Z???ǫ?U??ڃ???????L?f/W??6c?>v??;\l??-<???D??%????[Kh??ټ<np?c?Ect?CL|t??T1%j??h4^X???u[???J?p{ƕRE?5???C????e5?????LhY߰h??a`W??????????tw?ڼ1?탽??^??C???]?t??~?q?ً?կ?)a|??5ud%>C!7?R??2??k=y?~??Q?Yb???+???%?\4u?F|?W,"?p ?b?q???/8??8?V?ii<??Q?C?H????%??P? D???N??<i????u???M?j]쬮?O??հ?Mq?/o????O?C?;???x՞????ߕ??
\-"?)~_j??e??:????x
_???	?R?A
!$	?>?T?h5??#s?B??????7\??,?6??VP+??2FUA?jm̛???Ӵu???-??owe8???=u?Z?cZ?g?N򏭓?wG?>hM????6@ *qؕ?⓴???He??~8??a1??y??1?>??0??8?7??????Eg??J$[??/#??K?q?????*?L?%4 D??;-??p?'?^?x@??s??3??@???m??RǵM??h8???
???A??>?b?-?0?E?ż۾mV?S????Y?G>??S=ؕ,?w?{???>?Ǫ{??N{????􄪅?Q?;??? ??p\??1??X?%,???$?Sڪx?KM??IY˷?? p?ҹD_??Er?W?ɸ?90? ??P~CE ?#>?[b]\?<Y??F۳?S???5<??sz????????U??ˇ????D1?~?ɞ?"b????ߜ??R???U?dip<*e??$F/?$*Kg?P@7¢???9C(C@p?!kC?9?? ??~????3Pr?=?uˤ??\x???0IS?Z|h?6?????????????~??'ϔ??Pi?6?n^=?,di^V???9?-?+-+??Rg??"i?0A^[?XD?i???8^?G,)3s?ӝ?7?6%K&jXt?8?~2???y?O0.??@gc?S?g???ξ????X??+?????z<U????J?;??ӕ>??u?????%?w?)??????ټ7i?*?c?X??ޢ???\j ?+J??C?+?d $y?8"???~\<C/*j	a^??'1YOa?p?????ü\͗??XÑ?2??`A?V?z:K?g??-???,DVoY???x??/3?????á?????Vw?<u'7'???Y5?釓2?u?????[J?u?W,?,䳈	????^?	?O????!ҽa??If.?p?:?+O+?n??/ك6?3X???????! ?j??Q??o#\G?i??,=???v?U???[??z?X???5???{????g???du?5???N?z??'Z-!??̮??$???_?V1??_?>$?%?`e?????Fa?go?`?P??$????Z?<????EL?-Vi:\?3	?`??P??9?zjcN׳,F?Lc¨D?)?qs/??A6t?#3????e?IH??y??JzŐ?ڃM?ۼ???<i???2Vivv?s??4{n?^???}????`?{goz??8?m0Wk??Q?	?ߗ?#sXEV??ׇ???d?޽OA*arE?H???8?-:xw.???H?%??_O!P=??C?Si?S?4?.??
??;?&˽?????ǧ?M?>??X\=??n6w??????|????N+??a?.Ro??:?F???B???@Π? 2r????/?????*??w??a?e?[n?ށ?"N???Ɛ????5?q9}?~????X$??z??\r?t?
sd6ķ?>?'G???ݦ???????_]??{???rvs}F????p?z?n????????Pgs^	??O 3??u?!X`?q|?J??ҏ?~??????~?DcA7&u?y???L???1b??3%?9??7?B?DȺ?'k_F???Z'Er?	i?įwB"̫??=????믿??"!         i  x??WM?I=w~E.{tTU??]?a?? ?ja?\?J?/?6$R2????h9t'???(v?????*ě?z?s. 9Hm?Rv?cL޹??m?w}?????rsx???K}??/?.??~t???o????}?N?????????`?n??????#?)?M??!?UR??[ Z ֈP"??5J?C|?y?R?i??????????Ϗ	$m0`????7!!sZ???*	?T,?P???\>fJ??pzt??mOo?ׇ??]??C`xC?)8?n8??ʹ?1v?䂃?A?H?5z???KG%u?5V ??hyP????T}S?Ӈ???a??y???6]?J??}ubO?Ĕ???1??U??J?4J?Xz >C?B?7?????7??֎?q}{??nz?|~??z,??????CEH??7^z?S?IHN?ʷeh0??؉@?E??m???ec??E??1??P??Zzw?Ǣ	??ֺ??_!?f???Þ2.???ؓ??nf??	T????.=/??$?7????h????K?:?tHkV??	-0?
t)F??
ٵI?ƶ?*˶?cЪr?l??As?6?EZ?E&S??9??~?dc(?`t)f?X??	MXH?)+u?k?fR?	?8E??#ɲc?R?L???????P!W?n?6^v????j?df??f?*60ބ???hB?XKDR?X?MU???9\??²Җ?V?????1???B???¤1b?<?F??4?@1??ɖ??&tAmW??͋q6?5??=?w,eф???kdn`ċ?̤۽Ľg??²c?#?(?m[?V ??۽~d/?uY???,^2?????3U5dC#??!??X?nO'37}W????/	??5{?I	M???)??y2????q??j+.6A	1A5?&??ȅ?V?????+ۺ????:%??:{?P??j????v?f???????&}1?ߴ?經:s??x??֪?7??dm?R?e????Ǉ?????˝?[?bw?]?8??m?????i9j;?kz?_?:(?%??%?V?]?M?q;2??f???	?????N??????????????gYo??????\?3h`?)??&3?}????܊?????zq?sUEw???8??U????ݰz ??e??????(!??\~P?x?/6h?m1p?ާ?)?Ѧӥ?zj???hf?qL9=p????ě?M??b?ш????&h???9??s?9????\??.?ܬ?Q?2??ۍ 䓝????B???>?????o???qі=;?t	%?d??}+???f%9???M#?????ʗ??ƾ???????<"??+cX?G?B?l??i?~qB?L?:"????V;?u?i6?2???????O?J??7o?c???????ؿެV?? j?H         /  x?UV?q1?V??)?$??F??<?a??4+?T?ԍ?.0??ܼ?&+Z?(q?,!????ٗ??CI??Za?*????x?[?4?g???o+BҊ?^?O?rd?w<??Y??]?F??B?F?6G;dR??{?F??feʵ}???????ﳓ?i?D?xTC??aT????x/ݟϣ?.?1??(:SʠV?ߑ??,????5?]?J˗???j?O????Z]%?f3?????????F/nQ???$?*a/a??e??+?Q?*R?8<?H`;}?Vi???ɫU??????Kl/wN??֌????}v?V?`@?9?.?T????	????	???P*?C-?Vh?j?	{LmZ???7?g?4L?D?3?(?G???????v??̳ZF?Q<<??!????ɂf?)???z???.??? t????5?[	0?'??\֎EG???/???ײ?ww????ԔA_?eq
Y?????R,F?}s??j?xժ@-?e???D?V?Sc? G9@??????;A?????(?ؒZdV?ws	?FG??ӳC?=?3???%??\????r?Ic??y??] TG=Ɵ??$??K
*)?+y?."?ԁ>?i?*?s??d?)?0?xH?sz*dMu?2??[a*,???%?2??e?@??]|???>??k??hg?XB.xT??	??/??	E?f?4??X?I$Wfi???=ֲ?+?*f+?.x?.?h;^????@[?U?A F??4Ȃ?*G(????A??]?	?-3????AaT-I??FuQ??{wx@???z???oʼ??q??(TV~?.???'U??+v??(;v?vJ???$|???l?E????*oG???P+T??G??U????a?e?]??s??a?}l?G??<????p???gص0?w-1?x*???????j?+H???녚е?Nk˺?.h#U?<;???p??`????,???Lp@??<?[?gj?2??J?1(?c}???T+
???<Ɠ.?.?՛-0L?p??h??a?????ܜ?,=?????е|X?k(??{?J֑?(?cF????	,?2??E??',?"???&????ֵ00V:?/woNbEH?o?AHG?@??gl]@??W?????>>?я?+? ?Ī?Dsd??X:?? ???6Ei?ݬ??t?????1??2 
??i???i????Cw? c?7;ʀY?tȁD/??Û??????1??Z?^?ϛ??
?>?w?n?7ϸS7?*???Km?????ީ-H	$-Ț]Q#i?????????bu?????]?:??w,?))?z!L???3???	?@b8??B V????Ë?oH??]??=8?6|:??Y??B??}x&fi%?8?0?5???e???9ڿ??{???l??`ln?z??{??w?
??r?3??o0L?K??vziL??[?G"????8?O%L???A?*???\??=?@X?"?w????#.??g@7?o[??(IG1?"?ԓ`??޻??M=???u[$??w?Y????GɈe???$Y??5>????kS????????+࿯?y?S6?         a   x??;
?0D?9????D??f1Y?Qb??M????(5B:?&K?L?5moR+?F???2???
?.??س???'X?'k?Ab$???љ?K??#$q         ?   x??ϱNC1@?9??$?????F%?.N?O???_?Cc?3?k?w????%????@֡#?dn?????=?h+?m<4?5??5?G?5|??oG]??7?E????P1pnnU?ks????O??1?Ʀ?Ya?r??????5"rĿ?[U?:DC?ɠ#)P?:????9??K???o         ?   x??б?0E?9??&q??? 6?Y?8?b??#?ݽ????eO?U????L@aT芜R*2?????-?z??E??$???R	?
%e?:6??L?_?=??4?$?K6}??E???9{-?(?": ?^????J܈F?2?Q????????$?&??:????m??? ???3         ?  x????nc7???Sd_Р(??~?n???????6?4???}??lf?????????s??+?Ly?N>?ĩz?]??}?h?{rj?6??q߫R?ӓ?RvΧ?ե?B)g%?ndlBfI{X?s??????/??_???????	?Pb???rI???Y???|?????i?_????&?fcIQ?>??z???4%(??Fo?|ͽVN?G???????e??kݧ???;p?????ci??i϶H;gꦝ????f?'??N???t? ?5H?m{?`{_LR??&pqh?1?d^V~????^???}:?K?ĒZ?o8?????z?tnUNxSzB?o=??R?ڹV?y?c???;Lֲ???Q??H?z???${*?d?C?,x??&??9???????߮?1I?L?.??"_?????Ӝ??#xb??W?{??1E+U?tJ???F?ݑ???G?????????L?\{9??G??&?F?˦?3???9??W??ʘC??,Є??	?z?`m?x?F\~@UAu[??r?+6?????a? cGrNl)#??4عR??????e-?tڛe{??8?9?-(??bXO??=???>??xY_^_??:??3u?I?N?Ƅ!@?T?@?PZ?e?X{??n??UR??D`?{1??+G????{?-?3P6T$?;m??Bt?ˉ?F{???T??ԅ??8????T??5P?(7s4dP6ixhWr?lX??????y???????Ӏe?:?vQA?o???Jn???? (?EK5?HM??cX?Eʐ???͊??XT?P??Q??X?on???پ?? ?}e&?P???Ql$?{?VG?VDGms"?GNu`E??`?͊???JV?-`3??\?h?Ͱ???L[+!??	/??????S?p(??_???t?gcT/??Q^Ȣg??^????܆?/I.???݁????xŬ??2G???";??r?2'ne?\:??0"pf-(B???r?}hdd??D??R??n?????`e:??????%T???????3S            x?????? ? ?          ?  x???;??0D??Sln??_?ɳ8???Gpkx֞?k?P ????E??Ix%?T?BQt??-e"=?	i2?????iК?=?E?p?????H?>X*z5????s?`?6??
?6bh??.??h??쥸<?oL??.'=??`??"U?WIrc?????cȸh?	????????5????vC^?/g?v????6,η? ?4s??p|q?a%??Ez???*@UKE??7B;?l?n(W?jv!?1???lG???f??c?6y??&???o?V???nL?9?(?ǹ2ʄ?6??"?ۅ?;4J???9?7?D??????*^???{0??MiA?<`?????׽?Ĉ?M?LǘA?L[?? jcC?q?E?#>?o1?B?c??ĩA???ڎ?Q???̶?[L????vt<??Ĺ??:?C+=????67hN`O-"?[?oB???.?O7???????n?           x????N?0E??)??????{ˆ(PU(??u?4?4??CUߝt?!?x?{??*(??,/7???????}^`Z?U'&????@b?n?MQ??????Hb씐??)Z??%?	I??,yl?? ???	I?~h?Z??C??}3???/и>??1$??z???"	3\
?3?B??k??<P?*?.Bd??????L0+??*?H$?g??f5[??f???ǰ??^?????iN??O[?-DS??_~
?L5Ο?XJ?2r4?`*bcb??OZ??4?O|??      9      x?????? ? ?           x??WM??<]wN??Wv?ז9?w??????I?L??)XtU?"?Y?{zX????C7MAR???JA??%!Pg?(s?֖?Rj?0?Лf?k????( ?;?Iyb????kH)???!????[??*??p???RZX??g???CSUȭ?%???k(k?PSV?%1?$ ?H:E???????%?w?Z?苍L-̬5(vYY)?P?_?=???C^??/?S?UWǇ????&-`??w'?w,??B??@0???l%8lɕk?k???8}_S?U$U?̟)0??,?J?t???=?s?K
?F????A?L???j??????j?l?%s#? ???H????42???C??)MC???6?uŤ??v5?i??b>?Y?H#?;`?|?5?}????,O?6??P???f?C?g'?Vu??ťbe?%????????+4Eo?͉???CC˧U???
h? G????Cb?ͣ??D?????w??H?ē??Sԧ??hB????	?kH$*???v????o?a$I?Kc5??c_5???Aj???\??J?Cs??K??GZ?d?????F?Yl4`? ?ݬ???A??[?ۼH???I(?>?)??D??ž??e?9?Ӟ?
????'??MM?"?um	LT???}??ԷSZzyIm?+???M<???%?U5??h#r;ժȾu?	?t????O??9ER,ۚ8'??WA??X????S??N?>?{5??zTj??aH?_??5sv??O~?*?ͫ?['C1I?3???:<P??E$?%̴lL??[|????[O"????J3?q(E?|z??????<̪??B?z?K?S?Q?OW횏~Tm?{?|?11?E.oC???+֢?
x^zA?԰4???Ȟ?#sZmN?? ???p(????U??Kbc?a/]?Bn?????D?f??????c??v?>??הn?Gfʓx|?????PäG?&?1]??K#????(rzj'("????#?\??]??Ip?v,o???m71&?cb>??w
??}??&]?#!?F???c???_?v??s??     