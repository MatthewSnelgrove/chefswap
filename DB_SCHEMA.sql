PGDMP     "                     {            chefswap    14.4 (Debian 14.4-1.pgdg110+1)    14.5 O    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    17619    chefswap    DATABASE     \   CREATE DATABASE chefswap WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.utf8';
    DROP DATABASE chefswap;
                postgres    false                        3079    17620    postgis 	   EXTENSION     ;   CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;
    DROP EXTENSION postgis;
                   false            �           0    0    EXTENSION postgis    COMMENT     ^   COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';
                        false    2                        3079    18651 	   uuid-ossp 	   EXTENSION     ?   CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
    DROP EXTENSION "uuid-ossp";
                   false            �           0    0    EXTENSION "uuid-ossp"    COMMENT     W   COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';
                        false    3            �           1255    19009    check_swap_timestamp_change()    FUNCTION     y  CREATE FUNCTION public.check_swap_timestamp_change() RETURNS trigger
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
       public          postgres    false            �           1255    18662 �   get_address_uid(character varying, character varying, character varying, character varying, character varying, character varying)    FUNCTION       CREATE FUNCTION public.get_address_uid(f_address1 character varying, f_address2 character varying, f_address3 character varying, f_city character varying, f_province character varying, f_postal_code character varying) RETURNS uuid
    LANGUAGE sql
    AS $$
SELECT address_uid FROM address WHERE address1=f_address1 AND 
((address2=f_address2) OR (COALESCE(address2, f_address2) IS NULL)) AND 
((address3=f_address3) OR (COALESCE(address3, f_address3) IS NULL)) AND 
city=f_city AND province=f_province AND postal_code=f_postal_code;
$$;
 �   DROP FUNCTION public.get_address_uid(f_address1 character varying, f_address2 character varying, f_address3 character varying, f_city character varying, f_province character varying, f_postal_code character varying);
       public          postgres    false            �           1255    24577 �   get_profiles(character varying, double precision, double precision, double precision, double precision, double precision, character varying[], character varying[], uuid, character varying, uuid, double precision, double precision, integer)    FUNCTION     �  CREATE FUNCTION public.get_profiles(_username character varying, _origin_lat double precision, _origin_lng double precision, _max_distance double precision, _min_rating double precision, _max_rating double precision, _cuisine_preferences character varying[], _cuisine_specialities character varying[], _matchable_with uuid, _order_by character varying, _key_account_uid uuid, _key_distance double precision, _key_avg_rating double precision, _pag_limit integer) RETURNS TABLE(profile json)
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
 SELECT json_build_object('account_uid', account.account_uid, 'username', account.username, 'create_time', account.create_time, 'update_time', account.update_time, 'bio', account.bio, 'pfp_link', 'https://storage.googleapis.com/chefswap_0/'::text || account.pfp_name::text, 'avg_rating', avg_rating.avg_rating, 'num_ratings', avg_rating.num_ratings, 'circle', json_build_object('radius', circle.radius, 'latitude', circle.latitude, 'longitude', circle.longitude), 'images', COALESCE(images_per_account.images, '[]'::json), 'cuisine_preferences', COALESCE(agged_preferences.preferences, ARRAY[]::varchar[]), 'cuisine_specialities', COALESCE(agged_specialities.specialities, ARRAY[]::varchar[]), 'distance', distance_per_account.distance) AS profile
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
 �  DROP FUNCTION public.get_profiles(_username character varying, _origin_lat double precision, _origin_lng double precision, _max_distance double precision, _min_rating double precision, _max_rating double precision, _cuisine_preferences character varying[], _cuisine_specialities character varying[], _matchable_with uuid, _order_by character varying, _key_account_uid uuid, _key_distance double precision, _key_avg_rating double precision, _pag_limit integer);
       public          postgres    false            �           1255    18940    get_single_account(uuid)    FUNCTION     [
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
       public          postgres    false            �           1255    18941 <   get_single_profile(uuid, double precision, double precision)    FUNCTION     �
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
       public          postgres    false            �           1255    18953 5   get_single_swap(uuid, uuid, timestamp with time zone)    FUNCTION     �  CREATE FUNCTION public.get_single_swap(_account_uid uuid, _swapper_uid uuid, _request_timestamp timestamp with time zone) RETURNS TABLE(requester_uid uuid, requestee_uid uuid, request_timestamp timestamp with time zone, accept_timestamp timestamp with time zone, end_timestamp timestamp with time zone)
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
       public          postgres    false            �           1255    18948 ^   get_swaps(uuid, character varying, character varying, uuid, timestamp with time zone, integer)    FUNCTION     b  CREATE FUNCTION public.get_swaps(_account_uid uuid, _status character varying, _order_by character varying, _key_swapper_uid uuid, _key_time timestamp with time zone, _pag_limit integer) RETURNS TABLE(requester_uid uuid, requestee_uid uuid, request_timestamp timestamp with time zone, accept_timestamp timestamp with time zone, end_timestamp timestamp with time zone)
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
       public          postgres    false            �            1259    18663    account    TABLE     [  CREATE TABLE public.account (
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
       public         heap    postgres    false    3            �            1259    18672    address    TABLE     �  CREATE TABLE public.address (
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
       public         heap    postgres    false    3            �            1259    18676    circle    TABLE     �   CREATE TABLE public.circle (
    circle_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    radius double precision NOT NULL,
    latitude double precision,
    longitude double precision
);
    DROP TABLE public.circle;
       public         heap    postgres    false    3            �            1259    18840    cuisine    TABLE     L   CREATE TABLE public.cuisine (
    cuisine character varying(30) NOT NULL
);
    DROP TABLE public.cuisine;
       public         heap    postgres    false            �            1259    18680    cuisine_preference    TABLE     �   CREATE TABLE public.cuisine_preference (
    account_uid uuid NOT NULL,
    preference character varying(30) NOT NULL,
    preference_num integer NOT NULL
);
 &   DROP TABLE public.cuisine_preference;
       public         heap    postgres    false            �            1259    18683    cuisine_speciality    TABLE     �   CREATE TABLE public.cuisine_speciality (
    account_uid uuid NOT NULL,
    speciality character varying(30) NOT NULL,
    speciality_num integer NOT NULL
);
 &   DROP TABLE public.cuisine_speciality;
       public         heap    postgres    false            �            1259    18686    image    TABLE     �   CREATE TABLE public.image (
    image_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    account_uid uuid NOT NULL,
    image_name character varying(200) NOT NULL,
    "timestamp" timestamp(3) with time zone DEFAULT now() NOT NULL
);
    DROP TABLE public.image;
       public         heap    postgres    false    3            �            1259    18691    message    TABLE     K  CREATE TABLE public.message (
    message_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sender_uid uuid NOT NULL,
    receiver_uid uuid NOT NULL,
    message_content character varying(300) NOT NULL,
    "timestamp" timestamp(3) with time zone DEFAULT now() NOT NULL,
    system_message boolean DEFAULT false NOT NULL
);
    DROP TABLE public.message;
       public         heap    postgres    false    3            �            1259    18861    rating    TABLE     �   CREATE TABLE public.rating (
    account_uid uuid NOT NULL,
    swapper_uid uuid NOT NULL,
    rating integer,
    update_timestamp timestamp(3) with time zone NOT NULL
);
    DROP TABLE public.rating;
       public         heap    postgres    false            �            1259    18697    session    TABLE     �   CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);
    DROP TABLE public.session;
       public         heap    postgres    false            �            1259    18702    swap    TABLE     v  CREATE TABLE public.swap (
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
       public         heap    postgres    false            �          0    18663    account 
   TABLE DATA           �   COPY public.account (account_uid, username, email, address_uid, passhash, create_time, update_time, bio, circle_uid, pfp_name, avg_rating, num_ratings) FROM stdin;
    public          postgres    false    216   �       �          0    18672    address 
   TABLE DATA           ~   COPY public.address (address_uid, address1, address2, address3, city, province, postal_code, longitude, latitude) FROM stdin;
    public          postgres    false    217   i�       �          0    18676    circle 
   TABLE DATA           I   COPY public.circle (circle_uid, radius, latitude, longitude) FROM stdin;
    public          postgres    false    218   �       �          0    18840    cuisine 
   TABLE DATA           *   COPY public.cuisine (cuisine) FROM stdin;
    public          postgres    false    225   *�       �          0    18680    cuisine_preference 
   TABLE DATA           U   COPY public.cuisine_preference (account_uid, preference, preference_num) FROM stdin;
    public          postgres    false    219   ��       �          0    18683    cuisine_speciality 
   TABLE DATA           U   COPY public.cuisine_speciality (account_uid, speciality, speciality_num) FROM stdin;
    public          postgres    false    220   v�       �          0    18686    image 
   TABLE DATA           P   COPY public.image (image_uid, account_uid, image_name, "timestamp") FROM stdin;
    public          postgres    false    221   (�       �          0    18691    message 
   TABLE DATA           v   COPY public.message (message_uid, sender_uid, receiver_uid, message_content, "timestamp", system_message) FROM stdin;
    public          postgres    false    222   �       �          0    18861    rating 
   TABLE DATA           T   COPY public.rating (account_uid, swapper_uid, rating, update_timestamp) FROM stdin;
    public          postgres    false    226   ,�       �          0    18697    session 
   TABLE DATA           4   COPY public.session (sid, sess, expire) FROM stdin;
    public          postgres    false    223   ��                 0    17930    spatial_ref_sys 
   TABLE DATA           X   COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
    public          postgres    false    212    �       �          0    18702    swap 
   TABLE DATA           p   COPY public.swap (requester_uid, requestee_uid, request_timestamp, accept_timestamp, end_timestamp) FROM stdin;
    public          postgres    false    224   =�       #           2606    18716    account account_email_key 
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
       public            postgres    false    217                       2606    18857    address address_province_check    CHECK CONSTRAINT     �  ALTER TABLE public.address
    ADD CONSTRAINT address_province_check CHECK (((province)::text = ANY (ARRAY['Ontario'::text, 'Quebec'::text, 'British Columbia'::text, 'Alberta'::text, 'Manitoba'::text, 'Saskatchewan'::text, 'Nova Scotia'::text, 'New Brunswick'::text, 'Newfoundland and Labrador'::text, 'Prince Edward Island'::text, 'Northwest Territories'::text, 'Yukon'::text, 'Nunavut'::text]))) NOT VALID;
 C   ALTER TABLE public.address DROP CONSTRAINT address_province_check;
       public          postgres    false    217    217            .           2606    18726    circle circle_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.circle
    ADD CONSTRAINT circle_pkey PRIMARY KEY (circle_uid);
 <   ALTER TABLE ONLY public.circle DROP CONSTRAINT circle_pkey;
       public            postgres    false    218            C           2606    18844    cuisine cuisine_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY public.cuisine
    ADD CONSTRAINT cuisine_pkey PRIMARY KEY (cuisine);
 >   ALTER TABLE ONLY public.cuisine DROP CONSTRAINT cuisine_pkey;
       public            postgres    false    225            0           2606    18728 D   cuisine_preference cuisine_preference_account_uid_preference_num_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_account_uid_preference_num_key UNIQUE (account_uid, preference_num);
 n   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_account_uid_preference_num_key;
       public            postgres    false    219    219                       2606    18729 :   cuisine_preference cuisine_preference_preference_num_check    CHECK CONSTRAINT     �   ALTER TABLE public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_preference_num_check CHECK (((preference_num >= 0) AND (preference_num < 6))) NOT VALID;
 _   ALTER TABLE public.cuisine_preference DROP CONSTRAINT cuisine_preference_preference_num_check;
       public          postgres    false    219    219            4           2606    18856 D   cuisine_speciality cuisine_speciality_account_uid_speciality_num_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_account_uid_speciality_num_key UNIQUE (account_uid, speciality_num);
 n   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_account_uid_speciality_num_key;
       public            postgres    false    220    220                       2606    18732 :   cuisine_speciality cuisine_speciality_speciality_num_check    CHECK CONSTRAINT     �   ALTER TABLE public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_speciality_num_check CHECK (((speciality_num >= 0) AND (speciality_num < 6))) NOT VALID;
 _   ALTER TABLE public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_speciality_num_check;
       public          postgres    false    220    220            8           2606    18734    image image_pkey 
   CONSTRAINT     U   ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (image_uid);
 :   ALTER TABLE ONLY public.image DROP CONSTRAINT image_pkey;
       public            postgres    false    221                       2606    18735    address latitude    CHECK CONSTRAINT     �   ALTER TABLE public.address
    ADD CONSTRAINT latitude CHECK (((latitude > ('-90'::integer)::double precision) AND (latitude < (90)::double precision))) NOT VALID;
 5   ALTER TABLE public.address DROP CONSTRAINT latitude;
       public          postgres    false    217    217                       2606    18736    address longitude    CHECK CONSTRAINT     �   ALTER TABLE public.address
    ADD CONSTRAINT longitude CHECK (((longitude > ('-180'::integer)::double precision) AND (longitude < (180)::double precision))) NOT VALID;
 6   ALTER TABLE public.address DROP CONSTRAINT longitude;
       public          postgres    false    217    217            :           2606    18740    message message_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_pkey PRIMARY KEY (message_uid);
 >   ALTER TABLE ONLY public.message DROP CONSTRAINT message_pkey;
       public            postgres    false    222                       2606    18917    rating rating_check    CHECK CONSTRAINT     o   ALTER TABLE public.rating
    ADD CONSTRAINT rating_check CHECK (((rating >= 1) AND (rating <= 5))) NOT VALID;
 8   ALTER TABLE public.rating DROP CONSTRAINT rating_check;
       public          postgres    false    226    226            E           2606    18906    rating rating_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_pkey PRIMARY KEY (account_uid, swapper_uid);
 <   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_pkey;
       public            postgres    false    226    226                       2606    24585    rating self_rate_check    CHECK CONSTRAINT     m   ALTER TABLE public.rating
    ADD CONSTRAINT self_rate_check CHECK ((account_uid <> swapper_uid)) NOT VALID;
 ;   ALTER TABLE public.rating DROP CONSTRAINT self_rate_check;
       public          postgres    false    226    226    226    226            =           2606    18742    session session_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);
 >   ALTER TABLE ONLY public.session DROP CONSTRAINT session_pkey;
       public            postgres    false    223            A           2606    18989    swap swap_pkey 
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
       public            postgres    false    216            >           1259    19025 $   swap_end_timestamp_lo_uid_hi_uid_key    INDEX     �   CREATE UNIQUE INDEX swap_end_timestamp_lo_uid_hi_uid_key ON public.swap USING btree (COALESCE(end_timestamp, '2001-09-11 08:45:00+00'::timestamp with time zone), lo_uid, hi_uid);
 8   DROP INDEX public.swap_end_timestamp_lo_uid_hi_uid_key;
       public            postgres    false    224    224    224            ?           1259    19024 
   swap_index    INDEX     f   CREATE INDEX swap_index ON public.swap USING btree (requester_uid, requestee_uid, request_timestamp);
    DROP INDEX public.swap_index;
       public            postgres    false    224    224    224            S           2620    19010    swap swap_update_trigger    TRIGGER     �   CREATE TRIGGER swap_update_trigger BEFORE UPDATE OF accept_timestamp, end_timestamp ON public.swap FOR EACH ROW EXECUTE FUNCTION public.check_swap_timestamp_change();
 1   DROP TRIGGER swap_update_trigger ON public.swap;
       public          postgres    false    224    224    224    964            F           2606    18820     account account_address_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_address_uid_fkey FOREIGN KEY (address_uid) REFERENCES public.address(address_uid) NOT VALID;
 J   ALTER TABLE ONLY public.account DROP CONSTRAINT account_address_uid_fkey;
       public          postgres    false    4140    217    216            G           2606    18825    account account_circle_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_circle_uid_fkey FOREIGN KEY (circle_uid) REFERENCES public.circle(circle_uid) NOT VALID;
 I   ALTER TABLE ONLY public.account DROP CONSTRAINT account_circle_uid_fkey;
       public          postgres    false    216    4142    218            H           2606    18830 6   cuisine_preference cuisine_preference_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 `   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_account_uid_fkey;
       public          postgres    false    219    216    4135            I           2606    18845 5   cuisine_preference cuisine_preference_preference_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_preference_fkey FOREIGN KEY (preference) REFERENCES public.cuisine(cuisine) NOT VALID;
 _   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_preference_fkey;
       public          postgres    false    219    225    4163            J           2606    18835 6   cuisine_speciality cuisine_speciality_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 `   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_account_uid_fkey;
       public          postgres    false    216    4135    220            K           2606    18850 5   cuisine_speciality cuisine_speciality_speciality_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_speciality_fkey FOREIGN KEY (speciality) REFERENCES public.cuisine(cuisine) NOT VALID;
 _   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_speciality_fkey;
       public          postgres    false    4163    220    225            L           2606    18815    image image_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 F   ALTER TABLE ONLY public.image DROP CONSTRAINT image_account_uid_fkey;
       public          postgres    false    221    216    4135            O           2606    18768    swap match_account1_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT match_account1_uid_fkey FOREIGN KEY (requester_uid) REFERENCES public.account(account_uid);
 F   ALTER TABLE ONLY public.swap DROP CONSTRAINT match_account1_uid_fkey;
       public          postgres    false    224    216    4135            P           2606    18773    swap match_account2_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT match_account2_uid_fkey FOREIGN KEY (requestee_uid) REFERENCES public.account(account_uid);
 F   ALTER TABLE ONLY public.swap DROP CONSTRAINT match_account2_uid_fkey;
       public          postgres    false    224    216    4135            M           2606    18778 !   message message_receiver_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_receiver_uid_fkey FOREIGN KEY (receiver_uid) REFERENCES public.account(account_uid);
 K   ALTER TABLE ONLY public.message DROP CONSTRAINT message_receiver_uid_fkey;
       public          postgres    false    216    4135    222            N           2606    18783    message message_sender_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_sender_uid_fkey FOREIGN KEY (sender_uid) REFERENCES public.account(account_uid);
 I   ALTER TABLE ONLY public.message DROP CONSTRAINT message_sender_uid_fkey;
       public          postgres    false    222    216    4135            Q           2606    18907    rating rating_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) NOT VALID;
 H   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_account_uid_fkey;
       public          postgres    false    216    4135    226            R           2606    18912    rating rating_swapper_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_swapper_uid_fkey FOREIGN KEY (swapper_uid) REFERENCES public.account(account_uid) NOT VALID;
 H   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_swapper_uid_fkey;
       public          postgres    false    226    4135    216            �   g  x�}XWRcK��[/��Mԥ�᫅V	�VLċ� /dp+�%��lq�0y���1���J���'3�)��DΈ���%�0�e�J���Wc��s�m�P���'��@d���~*A�b�����1��W��[��;�;zg����<�<n�r26-�s�y��2�}�"�f�M��rN#\�Q��Ć`��������^+�)�Yr"M�i	��*8�Mɍ�����mЁpK�6
��:�4��1�^
G���o�"����ʶ:��!��IGyp��\�y���o���o]\�V>���@^��RLc��ÝL;�3{��Z�ܠ������K-y
�'"h@%����f�C1�e.��AH��"Q�"5�p�G�])Q���5�e^,���5����߾��F�� �r�&yA�׉��d�z��+7T~w�B�U�]�{z�yj3�O����۝��Gq��ٝj~"w���`5������u�70|\%�aQi"}N$��/J��,�2���P=5)���cu���Q�F-8����}�O�� ��4�d<����4qEs�&E�#K��Y�A>�������ֱ<��9
������x{q>�4�y�Z�W������̆��򷕿/5��g�q$Y/%��@P��Q!|x��a)��IQ��7[bί$�h�R�[��\�]�}T��a
���B�wG�q�p�9e�1kZ�' g;�mɶz�G�yiFW}a�˭����ǭ�F�P���;�ʜ/�Gt�ߪ���R��*��G �X�t�3�V��zi��7�ӆ΂	�)VX����%�Ѫ ��U��
��$�S5dj����Th�������yΓ��t�w�+�\�M93�U�����&�b���>r��{I
&g��=�>(ꏗk? Ba.i�G�����Eǡ�jǸ���"�M7��O�w�8k��fP�/�Vͪk��&j�?��3%��\�[�az���p�5�7�`�R��^�$�R�YB;{���a��,���b�cD���)1PC�E���2OL�ۂ�]T�&��3��*B<#�^�_��1�hh �XV#	�Ʉ�10����|qv��?�ܝ����'��+���۹>�u��oo�Ǜ�۝�yg'nW?���5f��#+�
������$}֓W�:��%&����Ρ_B�ESm��{�"2�+&'(񂃌��-`���Ɠe?d�ĸ��^� �u	@�h��*˓}�^�P���^ŋ����b�8�Z�+�g��Z�����=d�3{܌�y���]Y�Y�@��""���ץF	Y&
��
j/���U��A��(eo�B�� ��A��V��0p:2�-D�����X,��}f��!����X	��1�
:Vkcޤ�4���4}jQ~�}�+�!=]��s�ZҲw:kw��o���9���^kr7~�O�P�î4���y��P���k>,���2��Fӻ����������}�n�i�*�l�j��t��.e��{j�2$�t2��ЀaS��{��]l �B�	bh��Gl�Ox���J�m�gF�����Ux%�2%���Clq��,2/���u�2�r����J?�A���ή�`��}�Nw��8T]�cgv�[����'T-4��_��� ���"�d����/aa���&ɜ��V�#_rhJ��O�Z�%����%�"./�k�JL�΁����#*4��A�����~W�R4ڜ��{���������_;�g�W^.�O�g����'{����+Gq�/K�K�V)����a�V�����,�yCa��V�^��������6�������gJ8%���QX�L
��%����	�4�Ň��d�G�O/����`ɟn�0���4y���J�;�9w���j!K��\<Ιn0]i�K�_�8l�IS�	�ڊ}(�"ZN�5��Z<byH��{��.��)Y2Qâ�1��!����~��p��:��D8��D�u�D�(T��
^�8잷��rߧ�U���ڞ����..�M�Ϸ��9�O��͇��yo��Y.�L��'z��J�H�v����(E�I ���I�P���@���}p����%�1x�r��d=��­r�?��r5_�����y�������Y
<K��hiH��/e!�z�rw��V��hN�.���|�E������;�:�_Ϫ�U?u�ݨ�?l7�P
�+�b�e	X �EL��W�:%H }�L���={8����n 5? ������q׏���� Nb�E"%�9��0�c (^!'aC|�czvtp<��Mzx��N����չ)����糫��ݜ����e�l�no��_.x%���[c�Z�G�^�b�Z�Q�/֖ӌ�_,�Z}�k�څF y��Y	�dH�
J2s�	�O�B�D���Q��ZX�AB��>h���g��?�K˫���m��"���`��փ��D����9��h�݀�{�Y�d $PEN@Wk���D����8��j�^z����~��^ݶ�Y�t�ҽ�K.��q���N7OZ�����-�qQ�u*e>u��5�$0v�f�9�M�<?��bm��*�?��H'��_V�2j���D���2Z��M(�b����]m�QOǘ�DL�-Vi:\�=	�`�7�rN�����?0r�4&̟�Q��3n�������DH�1��h"5c`1Fے^1d���`]�֯�v׏�z���U���<,��f�M�+s�����Ͷo�U/�w�`5� ��?��O���Hs�-���[S���+�(����}�T)y�ؖ�5q�[tD� ǁ&"����|��B�����O띂W����wM�;����e�O����7�]��z��\�o?�������ٞV�5À���֯u*�ѿ��}���FmA��7X�ڭQ{]���8����?�w� �      �   r  x��WM�I=w~E.{tTU��]�a�� �j-������L@��ug> �H�'���h����k��13B�1B̹��@ �UJ�)�1y��O����է�?�������/��}_�:h�|t�����ߺ���~�^���'��i���}����*N�n|p����7A��WIE�oxh�X#B����()���JU�i��?��z��+?M i���<%�		��*�TI��b1�:(�B�1�P2N��ӓ��v{���>���V���L�єpÁ�W�e��$Ħ��@Z�ѓ���>�/����X�(���A���*R�M�O�����};|�[����t�+�x�͉=mSr��g���V!j@*	�(b�d�)YW��O>PZ�lw[;����nwӻ���u�c9��+��4M�y�%��8Ek���$�|kQ�a�7;��������l�a����a:�1�C<�>�����hBt��.F��+�`�,X��gr�Sf�EV{���ͬFؐ@��(�����	I"{ê���SPq�RG�i�
_4���B�.�@3T!��!�"m{��lK;��!G�V�+�L4�n\,Ғ.�0��5�	|��(%�E��ѥ�Yb��&4a!-��ԭ���I'����$��¥<��uEC��+��B���Tm�,���j�df��f�*FoBS{Z4�v�%�)h(ͦ��� �.HMaYiKj+�E���3��B��� 1`�<s#�`�V��H�dKn�&tAmW��͋q��CΞ�;��h��yT`#���@�'`�I�jp!O�����\�=U�����|��������۠D��*�m#3#^DmƧؚ'�=�Y�e � �:�h���Z�l6l������eE�#�x��r3�/P�	��(4�^�̈Y�����d�����|���5>�og{�7)����k�ac�Ϝ�*sd[�v���]BLP��#7r��u��+�Zzev����SR�-�j1Sm4�~�ݿ_��=�~�k(���Rg.9���7���"��8Ua�\&��u}z�뮝��4��Y�o�����t����-Gm��tM���x�
z�8O��@+g���f��j3�E��c�hNE�hÙm���~����o���o��ꎹx.f��6�D
��'S��Z0*w3F.�ot�h��!c���nwZ�ڿ���׹۬�8w��1Ż.��,�r�U@�,��*�2��ܽO�S�M�Kw��b?��|�3]���dD'ތ��(6�1P�\\�-XT2�d�b:ǽ���Ň�?�"i��̋�*0�H��EgLJ#�,s����W���@�<�:"����8�u�J�}\�A����M/���Z`HwR`�`OUw׊[.�j^'�9�2�MadSX1�1x��_$��j����       �   /  x�UV�q9�V��)�$��F�?<�a�4+�T�T7����'s�"��hm��Y��?����_f_�/%q'kU���˫f�%n-�$�պ���I+J{�>�ˑA��L��e��w��~
y��I��iYz��9T(��y�O����g'������Z�èt�Cs�^�?�Gs]c�Qt��A��#+�V�X^��)8k�~��/!6i�Ք��Mw-}+���J:�2flɽ��%�ˍ^ܢ6k!I.�U�^�~?e��+�Q�*R�8<�H`;}�Vi���ɫU������Kl/wN��֌����}v�V�`@�9�.�T����	����	���P*�C-�Vh�j�	{LmZ���;�g�4L�D�gXQ"�*.�ak����bu+�g���xx�iC���a��`S,5�P�]:�{A�JS�k��`�O ù���:W__��=l�e����}c�)�~4���Xs{�X�X��*��"�U�Z���U�k1ZyN�� � ���ˋ����#�bKj�Y���%XEO��4΄β�d��s	@w��?ʵ&����%�w9�P����d�.)����䙻��S���}�����"��O����C���S!k���� G�
Sa	H��-�0��[.�� Ҩ��r��xe��^#wE;3��r��L�w}1�O(*6#�Y���O"�2K�'O^qU1[w��v�G���gw��b��� 1�T�A|U9BA������N�l�q��
�jIJ��0������?�k��z��ԃu�R损�c�D	�����{w	l���:=\���F�a���S��'�SL�g��(��l4Ty�8�o�Z��/<½�������-k��g��}�c{P>���1h�\���<�����<�k�	�S1��U�'�4�X �Z�jn@מ:�- X,�.���T��� �N�>, �uD�C���3X2�aZ�Ho���eʀ�*T�\�����C�Se�0(����O�4��zTo��0�:,�a���Ԇ��ҏjrs�����&nH^@��a�����+YGҢ��au���'�dD7�P��런|6��7"���P�Z�24��XM�L����9a�!j�iy �����ul�_�v���.T�@�4F�]�q&VU �#+�e���Y(V�n�)J[�fl`�#�>��9�O�QЗL[}�Hk�͕����Q��C@$zY=ބf7'�T���%���b�|�lTV��9��v[�ؽyƝ�iPAuOݽ�oj#m�涀��NmA�H iA�D{�#�qC!0�^�{"KʆŒ���?����؀���u \a��χ�E ���%֝�� u�"�BrV��v���!�C�`��\�����bF9|pnd�W]��ʛ���a�"�2�}����ߎ�xb�VZ���[�U(9��ڷ"a��
l	����V���X �?߲���n�-��}���!(�������m�{O�=I���!567A�z/Q�p�h�l9���/�	�W`�m����q����B�3�𼰪C���:v-�hx'w`�w��X�R$7n�_�������      �   a   x��;
�0D�9����D��f1Y?Qb��M����(5B:�&K�L�5moR+�F��2���
�.��س���'X�'k�Ab$���љ�K��#$q      �   �   x��лNA��z�]��c{.m�$J��(��ӳB�\��8��9�q��jXb��< u���׾�������O��M�r?~��ot��v����˛^6Iy ��^Zvl0c10Uk*�y��1[7[
!%��t�X�x���_~:=��Ք:*4;-A��v�XD$�~1UV2�C�}v6�$
��n����'��CJ��{k      �   �   x��л
1��:y��\&q��F�,m&�e�ڧwU��~�=�V��Bt��|V�c,�{7�t6����d6�f���X*6�PbH�c�@�����}�ZJQD��^��c�R�znD��q�Y�-cL����㿒8�O��1��#�������־j=n�      �   �  x����ncG�k�)�8rf��H�"M��8�Xۋ o��h��EԨ87}���;�w��W#1��t�T��&U�>�[
��7���ثP*3�����ԣ��n�rV�hN�.䞴om�y��i<�����o����_~?	�Pb���vI��Y��������i�_�d��J���4z���jipT5%L�
�V;Ś{���������ק׵_����_^>����8�KMf�=�"m���6
���&i���6��&�ck� �w�1ֶ�	+�h�I�ܾ.��,ާ[����x]�������)��'�TͿ�Lg��ӹ=8�k�ն�@��*J��k5	���{�
�#�d�=ȍ�R��Wk����H���v3y�$����Vc}�����?Lb�U���,�mw�/n4���0�8f�O��wO�1�jE�J�;��J�"����=�e���t}y�S>�f�s/�פ^��f��t&�2'�y�q'���U�΂��l�1���t�V���^Ǹ>?������Zs�kl����T�I1��H�s�9'���MK*ֹR���ƻ5l-�7ˎ1���9g�I˨�{K����{<?�c]_���:��3uЉ!S�2AL*h��9&b��>:o�Zk!�rst�ss�\x��t�%;�`uqIm�n���S-�&�*�S��So����Xo� K[�@�|i�"�|�%�3�JcU��SC�߾��篟^�w�,d�X9j�x=����@I��q��� ��R�cx��a��@q�.�B!H熢, f�!L��E������j��bF���-լ"%E�a���Y�BN7��cQ���Qk���X�o"�E����od[�	'zuG��@Fk�K�w�8NN�刏v$���Yq\��`AD�7���s�%X@0㬎�h�d��H��*'��%N��X:ŋ��ズON��mVƉ�8/�_a�e�M�������Dl�$�g\;�~;?<<�F�      �      x������ � �      �   �   x��лm�0�ڞ��~eRCd�����?B�IRX�8���2tDv�8�K0Z:{��!)��֚� S:������p?ޟ# =�bj��*�g�q�_)N	׌�K ׬@u$��-���cVj~"]���PE���g�i��b��7����Ve��D�Z�t��:����!5�J|?�]�����z�      �     x����n�0E��+��1��4��TB�4�uc� ������u;��#�;:V�`7�Y>������� ˇ��r��:��e�>�j[,��)���_�$M~.&�X[�#�p��k�1�h�z(�����m[�����MS?���Ԧ�ۅr����گ��µDI�@��1Oу��*G� Ü�$�t��y�3�P�m�.':YL2�7�tt?��Y��͓��eӿ��s-���S���_0��j1��!U)�a�T���'� �	�d�ً��Ԝ��            x������ � �      �   �  x��W�n�0<7_��B����/؋lY��	K;�n;�}(P���x�N����a�� )�PZ� ��h�~�)[�sCi�`�z]
3O-��A@��sU�lQ~�KJ1e>.iE/ݒ4�4[�z�X[P�t�R�?� ���!�i��S�M�f��$�1U-0R�O��Ke�HQ�AE]Q_ 6�Ɔ-�8g�chcI�ykH�:�?[`@][�T�H�Gz�K
�F����A�L�#�-��ׁ�d1e�=e�4�@s�)�C�4�FƍQ�bc� �kh��Ч�,���gTW�(�#�R%����i`���^J�d�*5��#�yh�Ď�i���r/�L4ߺ1�O�X�CS���i���~m-�Nm��0�܉�x���5�U�J���7�K"Q9�fmFJ*m
��=��#4&iA����`��5�^m�1P��ޱ�r~��Ibr.g��t	E��<&�@J�OM�B�$�ʳm�U��Α#���Wɥ��NIﲧm����k�J�+}A�5��Vn���������!vg��e���UI�l�rN<�����M,�����kuj�v�������ʪ��EK��(]0PW��2,K��=4����&�����UT\ѩ���z'vJ�*�)ʶ�7;�m��gK)�IJ�t`�M
cF;.�(�O/��y>��l#x��Χ����4k�b׃��Bc�D�ԈE.oK�����
x�:!ZZ��5pQdo��9-6����@m�Pz���WIDT�S[�d?m��m%O����Y!^KXt�mq=.0���vp���\;��?�S��G�'Ď�V7Lz���j�銅_Z�͇|>@��Ψ]��
eg�R.?�%��׌��M8�ؓ���$�u��|U"���}��f]�$B�M>g�ǖ�n��v���%
     