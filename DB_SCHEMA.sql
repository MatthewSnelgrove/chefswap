PGDMP         7                z            chefswap    14.4 (Debian 14.4-1.pgdg110+1)    14.5 N    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
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
       public          postgres    false            �           1255    19012 �   get_profiles(character varying, double precision, double precision, integer, double precision, double precision, character varying[], character varying[], uuid, character varying, uuid, integer, double precision, integer)    FUNCTION     �  CREATE FUNCTION public.get_profiles(_username character varying, _origin_lat double precision, _origin_lng double precision, _max_distance integer, _min_rating double precision, _max_rating double precision, _cuisine_preferences character varying[], _cuisine_specialities character varying[], _matchable_with uuid, _order_by character varying, _key_account_uid uuid, _key_distance integer, _key_avg_rating double precision, _pag_limit integer) RETURNS TABLE(profile json)
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
	AND NOT (COALESCE(account.account_uid = _matchable_with, false))
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
       public         heap    postgres    false    3            �            1259    18861    rating    TABLE     z   CREATE TABLE public.rating (
    account_uid uuid NOT NULL,
    swapper_uid uuid NOT NULL,
    rating integer NOT NULL
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
    public          postgres    false    216   �       �          0    18672    address 
   TABLE DATA           ~   COPY public.address (address_uid, address1, address2, address3, city, province, postal_code, longitude, latitude) FROM stdin;
    public          postgres    false    217   ��       �          0    18676    circle 
   TABLE DATA           I   COPY public.circle (circle_uid, radius, latitude, longitude) FROM stdin;
    public          postgres    false    218   ��       �          0    18840    cuisine 
   TABLE DATA           *   COPY public.cuisine (cuisine) FROM stdin;
    public          postgres    false    225   ��       �          0    18680    cuisine_preference 
   TABLE DATA           U   COPY public.cuisine_preference (account_uid, preference, preference_num) FROM stdin;
    public          postgres    false    219   �       �          0    18683    cuisine_speciality 
   TABLE DATA           U   COPY public.cuisine_speciality (account_uid, speciality, speciality_num) FROM stdin;
    public          postgres    false    220   ��       �          0    18686    image 
   TABLE DATA           P   COPY public.image (image_uid, account_uid, image_name, "timestamp") FROM stdin;
    public          postgres    false    221   ��       �          0    18691    message 
   TABLE DATA           v   COPY public.message (message_uid, sender_uid, receiver_uid, message_content, "timestamp", system_message) FROM stdin;
    public          postgres    false    222   ��       �          0    18861    rating 
   TABLE DATA           B   COPY public.rating (account_uid, swapper_uid, rating) FROM stdin;
    public          postgres    false    226   ��       �          0    18697    session 
   TABLE DATA           4   COPY public.session (sid, sess, expire) FROM stdin;
    public          postgres    false    223   J�                 0    17930    spatial_ref_sys 
   TABLE DATA           X   COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
    public          postgres    false    212   `�       �          0    18702    swap 
   TABLE DATA           p   COPY public.swap (requester_uid, requestee_uid, request_timestamp, accept_timestamp, end_timestamp) FROM stdin;
    public          postgres    false    224   }�       "           2606    18716    account account_email_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_email_key UNIQUE (email);
 C   ALTER TABLE ONLY public.account DROP CONSTRAINT account_email_key;
       public            postgres    false    216            $           2606    18718    account account_passhash_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_passhash_key UNIQUE (passhash);
 F   ALTER TABLE ONLY public.account DROP CONSTRAINT account_passhash_key;
       public            postgres    false    216            &           2606    18720    account account_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (account_uid);
 >   ALTER TABLE ONLY public.account DROP CONSTRAINT account_pkey;
       public            postgres    false    216            )           2606    18722    account account_username_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_username_key UNIQUE (username);
 F   ALTER TABLE ONLY public.account DROP CONSTRAINT account_username_key;
       public            postgres    false    216            +           2606    18724    address address_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.address
    ADD CONSTRAINT address_pkey PRIMARY KEY (address_uid);
 >   ALTER TABLE ONLY public.address DROP CONSTRAINT address_pkey;
       public            postgres    false    217                       2606    18857    address address_province_check    CHECK CONSTRAINT     �  ALTER TABLE public.address
    ADD CONSTRAINT address_province_check CHECK (((province)::text = ANY (ARRAY['Ontario'::text, 'Quebec'::text, 'British Columbia'::text, 'Alberta'::text, 'Manitoba'::text, 'Saskatchewan'::text, 'Nova Scotia'::text, 'New Brunswick'::text, 'Newfoundland and Labrador'::text, 'Prince Edward Island'::text, 'Northwest Territories'::text, 'Yukon'::text, 'Nunavut'::text]))) NOT VALID;
 C   ALTER TABLE public.address DROP CONSTRAINT address_province_check;
       public          postgres    false    217    217            -           2606    18726    circle circle_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.circle
    ADD CONSTRAINT circle_pkey PRIMARY KEY (circle_uid);
 <   ALTER TABLE ONLY public.circle DROP CONSTRAINT circle_pkey;
       public            postgres    false    218            B           2606    18844    cuisine cuisine_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY public.cuisine
    ADD CONSTRAINT cuisine_pkey PRIMARY KEY (cuisine);
 >   ALTER TABLE ONLY public.cuisine DROP CONSTRAINT cuisine_pkey;
       public            postgres    false    225            /           2606    18728 D   cuisine_preference cuisine_preference_account_uid_preference_num_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_account_uid_preference_num_key UNIQUE (account_uid, preference_num);
 n   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_account_uid_preference_num_key;
       public            postgres    false    219    219                       2606    18729 :   cuisine_preference cuisine_preference_preference_num_check    CHECK CONSTRAINT     �   ALTER TABLE public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_preference_num_check CHECK (((preference_num >= 0) AND (preference_num < 6))) NOT VALID;
 _   ALTER TABLE public.cuisine_preference DROP CONSTRAINT cuisine_preference_preference_num_check;
       public          postgres    false    219    219            3           2606    18856 D   cuisine_speciality cuisine_speciality_account_uid_speciality_num_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_account_uid_speciality_num_key UNIQUE (account_uid, speciality_num);
 n   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_account_uid_speciality_num_key;
       public            postgres    false    220    220                       2606    18732 :   cuisine_speciality cuisine_speciality_speciality_num_check    CHECK CONSTRAINT     �   ALTER TABLE public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_speciality_num_check CHECK (((speciality_num >= 0) AND (speciality_num < 6))) NOT VALID;
 _   ALTER TABLE public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_speciality_num_check;
       public          postgres    false    220    220            7           2606    18734    image image_pkey 
   CONSTRAINT     U   ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (image_uid);
 :   ALTER TABLE ONLY public.image DROP CONSTRAINT image_pkey;
       public            postgres    false    221                       2606    18735    address latitude    CHECK CONSTRAINT     �   ALTER TABLE public.address
    ADD CONSTRAINT latitude CHECK (((latitude > ('-90'::integer)::double precision) AND (latitude < (90)::double precision))) NOT VALID;
 5   ALTER TABLE public.address DROP CONSTRAINT latitude;
       public          postgres    false    217    217                       2606    18736    address longitude    CHECK CONSTRAINT     �   ALTER TABLE public.address
    ADD CONSTRAINT longitude CHECK (((longitude > ('-180'::integer)::double precision) AND (longitude < (180)::double precision))) NOT VALID;
 6   ALTER TABLE public.address DROP CONSTRAINT longitude;
       public          postgres    false    217    217            9           2606    18740    message message_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_pkey PRIMARY KEY (message_uid);
 >   ALTER TABLE ONLY public.message DROP CONSTRAINT message_pkey;
       public            postgres    false    222                       2606    18917    rating rating_check    CHECK CONSTRAINT     o   ALTER TABLE public.rating
    ADD CONSTRAINT rating_check CHECK (((rating >= 1) AND (rating <= 5))) NOT VALID;
 8   ALTER TABLE public.rating DROP CONSTRAINT rating_check;
       public          postgres    false    226    226            D           2606    18906    rating rating_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_pkey PRIMARY KEY (account_uid, swapper_uid);
 <   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_pkey;
       public            postgres    false    226    226            <           2606    18742    session session_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);
 >   ALTER TABLE ONLY public.session DROP CONSTRAINT session_pkey;
       public            postgres    false    223            @           2606    18989    swap swap_pkey 
   CONSTRAINT     y   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT swap_pkey PRIMARY KEY (requester_uid, requestee_uid, request_timestamp);
 8   ALTER TABLE ONLY public.swap DROP CONSTRAINT swap_pkey;
       public            postgres    false    224    224    224            1           2606    18748 /   cuisine_preference user_cuisine_preference_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT user_cuisine_preference_pkey PRIMARY KEY (account_uid, preference);
 Y   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT user_cuisine_preference_pkey;
       public            postgres    false    219    219            5           2606    18750 /   cuisine_speciality user_cuisine_speciality_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT user_cuisine_speciality_pkey PRIMARY KEY (account_uid, speciality);
 Y   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT user_cuisine_speciality_pkey;
       public            postgres    false    220    220            :           1259    18751    IDX_session_expire    INDEX     J   CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);
 (   DROP INDEX public."IDX_session_expire";
       public            postgres    false    223            '           1259    18752    account_uid_index    INDEX     L   CREATE INDEX account_uid_index ON public.account USING btree (account_uid);
 %   DROP INDEX public.account_uid_index;
       public            postgres    false    216            =           1259    19025 $   swap_end_timestamp_lo_uid_hi_uid_key    INDEX     �   CREATE UNIQUE INDEX swap_end_timestamp_lo_uid_hi_uid_key ON public.swap USING btree (COALESCE(end_timestamp, '2001-09-11 08:45:00+00'::timestamp with time zone), lo_uid, hi_uid);
 8   DROP INDEX public.swap_end_timestamp_lo_uid_hi_uid_key;
       public            postgres    false    224    224    224            >           1259    19024 
   swap_index    INDEX     f   CREATE INDEX swap_index ON public.swap USING btree (requester_uid, requestee_uid, request_timestamp);
    DROP INDEX public.swap_index;
       public            postgres    false    224    224    224            R           2620    19010    swap swap_update_trigger    TRIGGER     �   CREATE TRIGGER swap_update_trigger BEFORE UPDATE OF accept_timestamp, end_timestamp ON public.swap FOR EACH ROW EXECUTE FUNCTION public.check_swap_timestamp_change();
 1   DROP TRIGGER swap_update_trigger ON public.swap;
       public          postgres    false    224    964    224    224            E           2606    18820     account account_address_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_address_uid_fkey FOREIGN KEY (address_uid) REFERENCES public.address(address_uid) NOT VALID;
 J   ALTER TABLE ONLY public.account DROP CONSTRAINT account_address_uid_fkey;
       public          postgres    false    217    4139    216            F           2606    18825    account account_circle_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_circle_uid_fkey FOREIGN KEY (circle_uid) REFERENCES public.circle(circle_uid) NOT VALID;
 I   ALTER TABLE ONLY public.account DROP CONSTRAINT account_circle_uid_fkey;
       public          postgres    false    4141    216    218            G           2606    18830 6   cuisine_preference cuisine_preference_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 `   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_account_uid_fkey;
       public          postgres    false    216    219    4134            H           2606    18845 5   cuisine_preference cuisine_preference_preference_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_preference_fkey FOREIGN KEY (preference) REFERENCES public.cuisine(cuisine) NOT VALID;
 _   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_preference_fkey;
       public          postgres    false    4162    225    219            I           2606    18835 6   cuisine_speciality cuisine_speciality_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 `   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_account_uid_fkey;
       public          postgres    false    216    220    4134            J           2606    18850 5   cuisine_speciality cuisine_speciality_speciality_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_speciality_fkey FOREIGN KEY (speciality) REFERENCES public.cuisine(cuisine) NOT VALID;
 _   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_speciality_fkey;
       public          postgres    false    4162    225    220            K           2606    18815    image image_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 F   ALTER TABLE ONLY public.image DROP CONSTRAINT image_account_uid_fkey;
       public          postgres    false    4134    216    221            N           2606    18768    swap match_account1_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT match_account1_uid_fkey FOREIGN KEY (requester_uid) REFERENCES public.account(account_uid);
 F   ALTER TABLE ONLY public.swap DROP CONSTRAINT match_account1_uid_fkey;
       public          postgres    false    224    216    4134            O           2606    18773    swap match_account2_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT match_account2_uid_fkey FOREIGN KEY (requestee_uid) REFERENCES public.account(account_uid);
 F   ALTER TABLE ONLY public.swap DROP CONSTRAINT match_account2_uid_fkey;
       public          postgres    false    224    216    4134            L           2606    18778 !   message message_receiver_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_receiver_uid_fkey FOREIGN KEY (receiver_uid) REFERENCES public.account(account_uid);
 K   ALTER TABLE ONLY public.message DROP CONSTRAINT message_receiver_uid_fkey;
       public          postgres    false    216    222    4134            M           2606    18783    message message_sender_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_sender_uid_fkey FOREIGN KEY (sender_uid) REFERENCES public.account(account_uid);
 I   ALTER TABLE ONLY public.message DROP CONSTRAINT message_sender_uid_fkey;
       public          postgres    false    216    4134    222            P           2606    18907    rating rating_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) NOT VALID;
 H   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_account_uid_fkey;
       public          postgres    false    226    4134    216            Q           2606    18912    rating rating_swapper_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_swapper_uid_fkey FOREIGN KEY (swapper_uid) REFERENCES public.account(account_uid) NOT VALID;
 H   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_swapper_uid_fkey;
       public          postgres    false    226    4134    216            �   V
  x�}WWn#I��>��E��~5�(GJ��� ���-R�	���W�#�+�E�,�.I�Ef�x�""Ib�%�W� .�E�y�D"��c:��++�q��3a�M$P��u�{ΐ��o�	�4�dR�'�rw����}�X��,��"�lC���8y>��_���G�X8��&cF1��De�*aUFr��?0�K�vV
1��S��H���3Ԫ�����PLF��CTc����`�FI)5��¡t��f41/�����2"+�B��p��3��`T�������9�G�^Q�0;#yy/�8�����L۽�����ƫX瘛�)��R&9ۀvPI�9�$��H�&��}��1���K�p	UG=�&%Ϡ�F�l����b�l���Ϸ�06�1��X,C�ʀt��-1��g����ۼ�a�7���&Q��s�x<?�m���9k�N%��'q2(&�ߺ��X�ب������bF!�D�ƀ���$��B����c���沭&&UBk/�,v�h�v�� ��1e��&�A"�$��Ϥ'�uU~��tz:>�9j�V���mk��qw|�l�{*��#k�A���C_�.��@U9��[��R�-u4�-�A{1rJ;���c̺}��B�%ASy�F�@�R��1#��n��������G���3����&��������"I1I�hE`T~p{�mrr�xp�oj=5��3=(zG���Mn��s��ˋ���\��r|�'t_%�e�\T�ȹ � �Bq�X͹���$n��LFF	%�4���K�¨)�NP%˄��	���2$#$�3�I��~�d�<]��ܕ`*��)Q������2¥ (�sd`[k�G�����z +/�~BҹDL� �T�dKih��OB����Nx���&wLPR/� m�gE-���D��=��s]'�M7m6���T(��\�/Tz[��0;	m��j�ˌ2�#O)m@�-���� �H*y��
{e�&�X�-�(E� nK�"1�C��]�c���^a��ҤD4��8a�zG��{,j�e�tq|>��.�g���8�W�ͳ���c�e]���Xn�_�'�E���
ƈ�
�;��}��W`��WB����]�A��D#T9\����8���k����'\1�q}B�Q #��`����nG�Ie�ǋ+@@�M  �鰣HM�d�X�!��/�}�~{Tt���Q1���ne�I�ӆ��l϶���\�ͫ��JT
����/e�E0X���\Y��"@j��������<�� � ��Q��'&j��e��-�?�*m$��!_ʢ9�0�"��J��^ZUm;�����������%�)NDKԗ�8��̚�`7����狜�����C?E�94;��}���R)@Y�n�+�-��bG��h����z?�+��Ͽ���_�d�Q���f�^W⥸A�Gh��:#�@� �ʕ� D(wjJ���y��Cl 
3ǐ�1�<�& ��<[a���;����>q*��
�$�d��ڻ���(��4�w`�O�\�S��Z琕���|�9X�����)�b���؞5����7��(��`�;�_� ��q!�Dc.�F����j81��X%����x�q^�7�A������&.o���KL��&*�@`P~����A��uy{�9W���gŶ�=��_�O�s{��[��1��֍���;6���gPV�47�7������B���G�f���rP�Q{ �+�a��eps�t�vQ*쵋� +��?w�0
����u� @_)�-�N�
���]sp}���.��\���sF�@^���W��D8=���Y���%O�V��x�3��K�[�ߖ2�	l!�&HK+�.^S�R`{�12�U���( ��0	�LĈ=��}����S����b:YMsB�!���!��G'Ȭ�BLV@�	L;���1���h�:�_����?�-��[�.Z���5o\���5���b>����Mh�ȧcE�V(�
\e�r7
O��8V�Ee5��_�,8k	��1�A	����H&��
.S������}I!p�1�4HC0º�������r��+�[x4��/A�ed	��^T�߬g �(��p� �Q� �	� ���8g@�Uܟ���b��� =����7�������m�z[�Ǜe�ڸ��t����z{=).�NMYIl ��B��R^�8VUBr�wN=	��S�eeiC��@v���/Oҋf�Z=��)�Hf��<@u"L��������oޟ�P4�]��ϰ���_��A�&]� e!�q���u��!��W�s�(�$L2*�qČ0�ޗ�1��Lx����;���Vs�O���>a}zt<i�b���~�������)���Ҹ^<N���]�\.�WD_��)�)�	� ��k  38qR�q���@ \��	c��b���b���qU,V��� G�����������Ĳ�/���
E�A;X��Ew}9��W���dlb�|���:��ޙ������m���}�]��cF��`]%�*�@��oK��<H�ɔ�,�d8P�	2�X����������      �     x��W�n[G]_}�6]R��̐���Y$N�$h6A��*K�l��ߗWv^HdqG�+A�!y��U�!s��c��s�H �UJ�)�1y��Ϸ����Ǿ?��������[���7m�.��{��[��p�؏����~v<����ӕ��q�a��q�4żAA��WIE�o<�@�1@���()���BU�i��?��z��?�&��	Ї<%����
G�TI��b{
uPB�}�K�y���q{���Y_v�۲�/{�E&t4��a$"	+�r��$�b� ��@Z�ѓ���i�_:*�뭱QG#ȃ���j��R���m�vx�����t�+�x�͉=mSr!�'�! ;ZaTT�Q2��d�)YU��O)���������Q�������������͗��-Mp�xI�s���H09�+�Z��h-��d'a��2�57ߗ81�31L�4�v���G�һ<\m��}��V�
[�L.���¢��=YL�fV#,&P�3J�:[4z^4 IdoX����<%�,t4��,�E����R4C�k�h`�moU�-i�U=���2t�)��܍�EZ�E&S�r_�,J�h��app)f�X�MXH�)+u�k�fR�) q�ұ�ei�RGO�`]����V��k�nHPm�,�Vl5i���u��ƛ�Ԟ�=��)�P�MU���3���pYiKj#�E���=��jw� 1`�<s#�`�V��H�dCn���PmVc��EP��F��g�,���r�Ho%�P�	�w���$|�����T�)�W��]����X�N��&HɫRl�62�1�Y�f|��y�޳��gY�@!�E���
d�Y`cޏ셽.+j��K����x��L�D�(�̌��Y���ݙw��r8��^���=򛔂���k��1�gNu�9�)d3�����.T�G�9|r]�芤�^ـ����d���f���Z��TkMX����o��
~t�ԙKN�,6��(B.���H����\&��u}~���=�izg���fC=�}�龭��+-Gm��tI/��x�N��%��;�"����ڛ��wd�����[�Tt�֜��ߞ����o���;���,��;��]̠�֧D
��'S��J0*w3F�W��.��OƜU���n}�s����_�n��Ĺ�F�S|�r���ˊ�ݷ2��bK��3T������������&��|�@����63c�:�@Z�2{��������+���'^Y2�VF0���V�]2O�j�!sae6��M�Ć��i^����j�Y���      �   �  x�UV�Q9����S�i)��`|�¾�f��ʭ��.3��ܼ�&+Z�(q�,!�������Pw�VE�^�X�5qk�&q��u�mEHZQګ�I\��3���j�O��~���I��iYz��9T(��y�¿����I�4��6�j��>�J�=4���<��b󨌢3�j���?X�k`y�7��a��*-�Bl�"��)_1���Z�V4ku�t�e��6�{;�%�ˍ�ܢ6k!I.�*aoa���^U�/W^��U��qx���&v�8��f}�ɻU����������j)�_��9�삭x��\s޻lRe���pM0�_H0f^C���,[�yW��vH`�cjӂ�οa=��ab'��aE�<�����ﶋխ`��2Z��ᱧ�>~�M4�M���C�7v���+�Le�y��J�>�v,:�\}��{�^��_�%���PS5|i\�90�)d�
0��J����U��E�Q�-����U�k1Z�N�� � ���ˋ����#�bKj�Y���������g�zgBgYK2�͹�;���Z���C�&�W9�P��W]I2i�TR�W��]D�}��>�Ut�r#���\���!ݝ�U!k���� G�
Sa	H��-�0��W.��QY�r��xe��^#wE;3��r��L�g}1�O(*6#�Y�`�'��2K�+O^q�b��'��mǃ��1h���b�H�,�V�=<6�"��vfˌs>hgPUKRz�è.
"B�~a���}��R~��P捯�c�D	�����6�o�NW쮯Qv�.�h��$|��p���ޜ��*��a�F�*���eU�����0ز�.{�����>���_���Ua8�X̳
�Z˃���p<sx�^����A��<�z���t�����Ų��HU,���$\�� XG�=$�ӝ��	ӒKz��L-STV��2�v���*c�AaT���c�titS�R���)�a3 ��@�6�>�~T�;g Kϟ�5qC���v�x�ܒu$-J��Q稭~KFtJ�"q�',�"��&����ֵ00V:���?��X��C;��H�댭�`���l�?��B���@c�m��o�3��� �YAo3���B�:Hvp�MQ�jwV�F:�g�QϘ��}ɴ��n����\ɡ;����e�,A:�@�����Ma��9A�"D�,��ǋa�yg��B���]�ۂ��;ϸ�n�TP�Sw���H�s[�b{R[�8HZ�5�^��bܡ�h��=�%e�bI�hm���p覆�;�q �0�Y����.7!����+Q�ð�ߘ��>P
��[G��}"4�p��Q\� 2��W]��ʛ���a� ��ݾ�}ц�#<��g��V6��-�U(9��ڷ"a`��`�V��i�?����[R��ͱ�V����3`�w�ߤh-�Uض��'���B+l�׿����1z�      �   a   x��;
�0D�9����D��f1Y?Qb��M����(5B:�&K�L�5moR+�F��2���
�.��س���'X�'k�Ab$���љ�K��#$q      �   �   x����nC1Fq�.����-��6ipĉc��TP��w�K
o��;_a%�ա�l�+A�e���(��v�k�hc�<@����.��ԉ}�VZ8������~א������ٵ��� 1u���a��+�LŪ�Zi���>j3�
.ف�4hXܸ����,~:�o=ʑg�xt���fUj�PW�$�����b���?_b�E*��      �   �   x��й1�:��N�[D%�'b�Q��sS���5�V��Bt��|V�c,�{7���x�#�x�����P@D`�89/U��F���f�d~&��\_|0|{k�b��O�"��{b�%*6�J��)�����43�i?ƿ�Eދc����> �Æo      �     x����n#G���S�K@�dk�1�C.�6Q�Ȑm$y������swu�T��W��f��}P1mĒ<��Y��q��8�YE��f"I�E�l��k�\s3�"E/�*W�Z%�^Kk��:��?^N��_�翇�^��UI'�lG����&���n�B�x����J����y��/�.��S�"��$j%7�9֜A�����{���2�ş�^/ϟ��t��np��h:��'�J�����cS��r�;-S��* ÙX1ֶ�+b/�I-]�.S�,��j�g�/�2������IX�U���8e�z���r�)n���-,�Lr�25g
��t��v)zqB5�p��A-��̊sh���]�����j�m����!\k� c�'(;//���G0۳C8J:����1���a��6�����R|�yW���8(F���Ь0'�$�-��C�����t����{z8=�~�B�{��z�|`�.沒�R.+ncg��u�2�,�:v��6"���F[��q%��]�,%����b��(������b�d�/�7;����G��7�%�gr�1֢[r��<����jrSϖt'i[��wm�y����ϧ3��9S8�rճrK�N�6)�-*q�&��Z����dm��
�L�F�}`Y���1#��r���x�UյCri̾(�������(��
���f��P-��7�I��:����6'w�����w���<� �b��so�H�Z���O�o������O���-8j�SC)��0�&�H	�4q>Л��FW��s�����q�N�ĆĽ[��t����r�g��$�:���kG�����$����e��ؼ�����PF}�ؐ���|}�����1�u�|���n�yÂn�:Z~�BEhQ�tb[�V�5�۰�W���)TE3Ε��\P5���C,�,�cT$��h��-�f���y��'�CTM�߆���0?�:#�D�A�>)Y��Q)���X��"�Q�~��!�e&\���p_�7�� �^ʪ��E��1q������v��8����������pww��.?      �      x������ � �      �   I   x����0 ���E_	��G��G�ݖ��r���R3�cTj�\�n<�=�F���QV3F�F��T���� �c;�      �     x�ŔKo�0F�ͯe�S?��;«�&}� E#!�P��@U���͌F���x�I�ё�w�*�n_���� �5DC��A�������ӎ�b�Jm�i�j���&�u{a�>�����U���ʦ�RD(��x
@v$�v�~O�}i�ez��eUm���w���Ҽpm�l��>��Ub{�	������Y�"�&�P�yƘ�u���b�Aa���R������h�^�dz�1�y��O(�*J溍�2.�F(�L ��,P��M R&���wF{
���(�Ҡ��r�/�p7��-���qi ���\�,�T"�c���׈�҄
)���֠Z��p�}ɟ��"�`��{h�h��������/<�g4Q�X��������d���ng��'�Ο�4�3% \q����s����b��z\��̛��n�	GO�jX�g3�M���ñ��|4P�s��u��|܍t��A�'��m���ۺ��gV��$�~´���X���h�r            x������ � �      �     x���K��JE��*<`���bio��w�Ke�щ-2�Lz�T7��$ŕQ�"�5��Z��hyNL��%�\ٰB�e��b�k&�4*��.�E"@��Fq�(�1>���ҏ��V����iIiA��@p�0z;���m�^a)9BT����fn5����󦼱D�F���R�㒆��k��Cfq�n 3h���AV��%d"\0)��������U�����M�1P���7,�D��\Pԝ��Om�˦(sq0�w\R�4.^A2�[>*���B�2M��U��M)h���Ȓ��d|f^���f��X߁�i��૽� $Odw�M(h~��ϣ���Sz�>�J������-�_��;-oѩߣ����t�ɍxo��>�ƷH�F���nx-��|Z���Tj��qѾ�2��HM��ف��J�k�a(c��ީ��A�\�3C�s�TP��3�b��s�0��d���/и����o�sd��6�������C�X k��4K�ܤ�~�ǹ9}q>�_�c����Ίxt0d��R
���*��c�e�
2�����BJ/��z
�G�h��:�T�����9��g������N�4b���R��՞+֢N�uBDK�>�F_�_2�i-5����PFi��U��&�Ou̾p^\���N��k�ԩu��ݣ[�ψ/q�rvٯ%���$��{����������%_A��������?�������h��6��:�玘C���#\�ן���S     