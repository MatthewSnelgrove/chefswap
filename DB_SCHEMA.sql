PGDMP     *                    z            chefswap    14.4 (Debian 14.4-1.pgdg110+1)    14.5 L    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
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
            json_agg(json_build_object('image_uid', image.image_uid, 'account_uid', image.account_uid, 'image_link', 'https://storage.googleapis.com/chefswap_0'::text || image.image_name::text, 'timestamp', image."timestamp")) AS images
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
       public          postgres    false    5            �           1255    18940    get_single_account(uuid)    FUNCTION     Z
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
            json_agg(json_build_object('image_uid', image.image_uid, 'account_uid', image.account_uid, 'image_link', 'https://storage.googleapis.com/chefswap_0'::text || image.image_name::text, 'timestamp', image."timestamp")) AS images
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
            json_agg(json_build_object('image_uid', image.image_uid, 'account_uid', image.account_uid, 'image_link', 'https://storage.googleapis.com/chefswap_0'::text || image.image_name::text, 'timestamp', image."timestamp")) AS images
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
    public          postgres    false    216   �       �          0    18672    address 
   TABLE DATA           ~   COPY public.address (address_uid, address1, address2, address3, city, province, postal_code, longitude, latitude) FROM stdin;
    public          postgres    false    217   L�       �          0    18676    circle 
   TABLE DATA           I   COPY public.circle (circle_uid, radius, latitude, longitude) FROM stdin;
    public          postgres    false    218   �       �          0    18840    cuisine 
   TABLE DATA           *   COPY public.cuisine (cuisine) FROM stdin;
    public          postgres    false    225   ��       �          0    18680    cuisine_preference 
   TABLE DATA           U   COPY public.cuisine_preference (account_uid, preference, preference_num) FROM stdin;
    public          postgres    false    219   �       �          0    18683    cuisine_speciality 
   TABLE DATA           U   COPY public.cuisine_speciality (account_uid, speciality, speciality_num) FROM stdin;
    public          postgres    false    220   ��       �          0    18686    image 
   TABLE DATA           P   COPY public.image (image_uid, account_uid, image_name, "timestamp") FROM stdin;
    public          postgres    false    221   ��       �          0    18691    message 
   TABLE DATA           v   COPY public.message (message_uid, sender_uid, receiver_uid, message_content, "timestamp", system_message) FROM stdin;
    public          postgres    false    222   ��       �          0    18861    rating 
   TABLE DATA           B   COPY public.rating (account_uid, swapper_uid, rating) FROM stdin;
    public          postgres    false    226   �       �          0    18697    session 
   TABLE DATA           4   COPY public.session (sid, sess, expire) FROM stdin;
    public          postgres    false    223   ]�                 0    17930    spatial_ref_sys 
   TABLE DATA           X   COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
    public          postgres    false    212   ��       �          0    18702    swap 
   TABLE DATA           p   COPY public.swap (requester_uid, requestee_uid, request_timestamp, accept_timestamp, end_timestamp) FROM stdin;
    public          postgres    false    224   ��       "           2606    18716    account account_email_key 
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
       public            postgres    false    218            C           2606    18844    cuisine cuisine_pkey 
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
       public          postgres    false    226    226            E           2606    18906    rating rating_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_pkey PRIMARY KEY (account_uid, swapper_uid);
 <   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_pkey;
       public            postgres    false    226    226            <           2606    18742    session session_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);
 >   ALTER TABLE ONLY public.session DROP CONSTRAINT session_pkey;
       public            postgres    false    223            >           2606    18950    swap swap_lo_uid_hi_uid_key 
   CONSTRAINT     `   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT swap_lo_uid_hi_uid_key UNIQUE (lo_uid, hi_uid);
 E   ALTER TABLE ONLY public.swap DROP CONSTRAINT swap_lo_uid_hi_uid_key;
       public            postgres    false    224    224            @           2606    18989    swap swap_pkey 
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
       public            postgres    false    216            A           1259    19002    unique_swap_constraint    INDEX     v   CREATE UNIQUE INDEX unique_swap_constraint ON public.swap USING btree (lo_uid, hi_uid) WHERE (end_timestamp IS NULL);
 *   DROP INDEX public.unique_swap_constraint;
       public            postgres    false    224    224    224            S           2620    19010    swap swap_update_trigger    TRIGGER     �   CREATE TRIGGER swap_update_trigger BEFORE UPDATE OF accept_timestamp, end_timestamp ON public.swap FOR EACH ROW EXECUTE FUNCTION public.check_swap_timestamp_change();
 1   DROP TRIGGER swap_update_trigger ON public.swap;
       public          postgres    false    224    965    224    224            F           2606    18820     account account_address_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_address_uid_fkey FOREIGN KEY (address_uid) REFERENCES public.address(address_uid) NOT VALID;
 J   ALTER TABLE ONLY public.account DROP CONSTRAINT account_address_uid_fkey;
       public          postgres    false    217    4139    216            G           2606    18825    account account_circle_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_circle_uid_fkey FOREIGN KEY (circle_uid) REFERENCES public.circle(circle_uid) NOT VALID;
 I   ALTER TABLE ONLY public.account DROP CONSTRAINT account_circle_uid_fkey;
       public          postgres    false    216    218    4141            H           2606    18830 6   cuisine_preference cuisine_preference_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 `   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_account_uid_fkey;
       public          postgres    false    219    216    4134            I           2606    18845 5   cuisine_preference cuisine_preference_preference_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_preference_fkey FOREIGN KEY (preference) REFERENCES public.cuisine(cuisine) NOT VALID;
 _   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_preference_fkey;
       public          postgres    false    219    4163    225            J           2606    18835 6   cuisine_speciality cuisine_speciality_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 `   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_account_uid_fkey;
       public          postgres    false    216    220    4134            K           2606    18850 5   cuisine_speciality cuisine_speciality_speciality_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_speciality_fkey FOREIGN KEY (speciality) REFERENCES public.cuisine(cuisine) NOT VALID;
 _   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_speciality_fkey;
       public          postgres    false    225    4163    220            L           2606    18815    image image_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 F   ALTER TABLE ONLY public.image DROP CONSTRAINT image_account_uid_fkey;
       public          postgres    false    4134    221    216            O           2606    18768    swap match_account1_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT match_account1_uid_fkey FOREIGN KEY (requester_uid) REFERENCES public.account(account_uid);
 F   ALTER TABLE ONLY public.swap DROP CONSTRAINT match_account1_uid_fkey;
       public          postgres    false    216    224    4134            P           2606    18773    swap match_account2_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT match_account2_uid_fkey FOREIGN KEY (requestee_uid) REFERENCES public.account(account_uid);
 F   ALTER TABLE ONLY public.swap DROP CONSTRAINT match_account2_uid_fkey;
       public          postgres    false    216    4134    224            M           2606    18778 !   message message_receiver_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_receiver_uid_fkey FOREIGN KEY (receiver_uid) REFERENCES public.account(account_uid);
 K   ALTER TABLE ONLY public.message DROP CONSTRAINT message_receiver_uid_fkey;
       public          postgres    false    4134    216    222            N           2606    18783    message message_sender_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_sender_uid_fkey FOREIGN KEY (sender_uid) REFERENCES public.account(account_uid);
 I   ALTER TABLE ONLY public.message DROP CONSTRAINT message_sender_uid_fkey;
       public          postgres    false    222    216    4134            Q           2606    18907    rating rating_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) NOT VALID;
 H   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_account_uid_fkey;
       public          postgres    false    226    216    4134            R           2606    18912    rating rating_swapper_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_swapper_uid_fkey FOREIGN KEY (swapper_uid) REFERENCES public.account(account_uid) NOT VALID;
 H   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_swapper_uid_fkey;
       public          postgres    false    216    226    4134            �   )	  x�}W�R"[}��
n�}�8��
q��!nD��yL(����~�_�O蝨�e�h�	�{���Z)�e�G����rLX$H�1Pm�fY��K����2別�d�J�i�#ɉsF$�"����OB���� ���;�n�4��b��w��]!�n���j�n��͎o�ʹ��(��(�`RŦJT.���%�(�`Ze�*pN�(Kv��2�m⪲������S�)"׉�3if<�+��S���J�v�"�Ia8�1�����gA=M~_��s�����9����o$1Βƈ+J��p �HD[�`Lg�|�A�}�	�m"�"��C�s���%'L�Dx� w<?_��:�����h.c}w��D5D��xqrq3_�Xb������(De�aUFr����)e�Y)`��FNa�@#�G�O�P�R,��7����I���q�2�8��6�Rj6o�C����hb^z�|��eDVR�0\�Sg�Y
F�`����EZC{����s2�W�����ˉۨ�ӟ�E�ko��uD���?�2�ip�İ�Nu�%��F:`���v�q,�@^��ЅqԣhR��o���q�L�+���}�c�8	KÃeH[��s"�%�|������=~�7�������"*޾v��N��vg{����L�^ߊ���n~���b�c����%�6E��/w��R4L?	.��$r��^`����r�&&UBk/��o�hv6���1e���#�L�><���}��2�,��lrq{���~���j��ior�jO�*����6���C/�ǁ�]�~#��r�+����[�hTF9��b�vZ��ǘu���B�%ASy�F���R��1+��~�������s?�d*Q-�M�Y� �C�*�$�$��Uyாkqr�tt�ok}5~0=,�'���mn���s�ˋ��~!T{5��Sz��K.�T�\�� V��J	TsndY����`�I;F�@I3�a9蒶��@J�t�2�������4���	;�Lp��_�8]����,�J0�Ĕ(a���]7�e�KA�3쑁�Z�<
N�H$h��{ Yyy�����%b��H�R%[�H�8$|�j�MHv�����g���d��i�;/jyW�o�∾>�൧��9�n����O�H��*<����Jo%O�����y��c�G�$Rڀ�[��{�s"��V�@(�e�X�b��ܢ%�-�B���염�~�B{K�BQiR"	�B�0I�#@���톺8���旋�Q�tZ=���y�������Y{z*w/?���S�����	����ٯP�
��J��㽞|H?���h��*�+����c��x���>�����+0N��O�2
d$��2┽��8�����zqh��	 ��s:�(�B� Y�=@�����kܝ��nyR�j��;�~��w�#";�ݱﵖq���Oe%�&ܔ"¿���R�\���Yjϕ��,��Aqcr� 8��6�?@��U��'&j������� ��@Z#	��*P���9�	6VJ�Ҫj�Y�f�L���]��mQm�X]�t~;ou��6��_.s�?oL7���)*@ �aع��iݗ�H�"��pQ�n5�8���Y�-g��ƃ����}�ɒ�8JP���J��L
v�#��b�M Y�J�J	��f��#5�XQ�O�|��� v�!�#$<'� 6��
ͥ���{F�ĩ �+����)j�RRH'��"Ҥ>�m=�r�I�k_@Vz���w�.�puv�x�vg��]�.�cg�|Z�Lv_�c������R �ǅA��LYW�q�ĈOk�,�K
��9�y)�k����	�M\�$W��LT
����$��Å���a{&��a0ϋݠw���8i>�-��z�i�٧����4o'wS���~�=���*����9��R�crX�"W0��!�-%�u@¸bV	[GJ� �@��
{�bxc�����=%�%�p���y����������y��=���G�/��k���F�>����+�7�"��qmi���a�S����<�W��%���/�f'��C��[� �)vZ)0�����@���&�( ��0	�LĈ=�6��}ܧ��/ֳ�l��������C,*��N�Y������v��3|w}�w�1�ڴ���`�(�*��!�]�����ܺfc�o����b�拏М����
ep�We�r�
σ�$V�ee=���,8k	��1�A	����H&��
.S������}I!p�1�4HC0º�S�����j�SW�ʿ}��?�2�      �   �  x��V�n[7]S_�M��!9���>�S41�MP`���: �1����8/���� ��gxΙí�F��A}�^=�N>Ǆ�j�M�n�p3�E�q�޾Z^�����pt���?���5�d�Iv�S�\N;,	 7�P�P�e�l0b0���E�Ҝ.���q���^���q~�:�{��ތ����._\|�C���~�ܫ�}qz�?<���U����i!P��쀁@�(�<M�>��|͘�Y�L����PU眽}��".?�s�%H��wPQ��L�jd?J�=�W�! �,�$w�н8��������㻺��G�fB�J� "�M�r�K��s��Y�{�刬Q����uT�0z'��2}��L;oo	[��=u����t���=vwqW���G��RYN,)�@VHX�/���u���a���9ct�l��w{;���I�w��z��T�\�7��+:_i9�+rI��B.b(���X�y*���ى<SȾ�:������ƘI�+�s��u�~�C�a�\0���`��3X7k�d��!�"�iU��(�i�5�B�qa	�`�U�3E��;�Ka��Ag���
_�6�������f�z	}��d;z�u[:h��%G3�b���٫�0-V�EW,�h=I��Ŕ��P��J�\�f,�՜��5S7���<R�<`$�ueʀ��`C��4.6h^Z�arR����6�x�b
�}|cL4�i��
�#��S�����b��1N����ֵ��6bBF���r���2'S�6B��2i��<'{Z��'o�V}5�Nņ��wXR �Y=Z�Ö}�Hq]pH"�y2�[K�c�2c� �n�ᯟ��6}���p�A��mL���mgf��j�����Ϧ��m�#�!q�uHI��*6���G���m��)�)꺦F�,��� ��R#����D�1��,�X��^�-�:w5����th�@�5��ģ�+%�x��\���?K��<Ѧ��+.wS;C.��<JL�1�s���TD5*�,^�lǂ�X��k�2��W�?l�<��xp�8����zww�=-��+^������-[XaTK�䏉71���F�u�G{��8[���Wf��6�����/��ϐ*K=mf�V/�H��6�ڙz�Lo��7x.�%^���VL�H ��e�kC K_�6�r��P�$K�b�b7�ܲ��z��6��?h�k�      �   �  x�UVIr1<���b%��y�\���	��Zr��p؎jt���͋l����g�2��~�*�}i�8�ĝ�U��B,���qk�&��u�mEHZQګ�I\��gr�/���ֈ�7� �is�C&e|N���Ӭ̡B��ϓ?���~v�9�H�j��>�J�=4���y��bX󨌢3�j�Y1�����
oN�Y�����|	�I� �����f�����[��ʘ�x�s��a�&f�L~��+Ug�'Fw�]Kߊͭ��N�b�H���/����Em�B�\諄����/{U~\y��W�:���l :v�8��f}��W�Z5<[�����;�Z
Ek���z�>���^p-�Hr^b�T���P�	N�����Y��R��,[�y�ueH`�cjӂ���zVM��N�?ˊyTq	,[;�m��a���8ξ��>��M���Xj
�a��t����JS�k�[	2 N��\֎EG���/�2�ײ�7��~��B7�A?��J�<�,V�\`)��־�ʿi���U��Z�L�*�5	j�|N��倆����w�+�ב�1Nq%�Ȅ������ӳ���ƙ0m֒�qs.�r�Ǹ֤1�м���c��SW�L�%���<s�y� �z�Ǹ
t.��l?����"��"#��Zf��u+�%��~��"�ƿqY/�Fe}���8�+g<{��pf���r!�l���b:�TT\FH����Drm�FO��c-+��b��B'�J��ミ���^����0�T��|]9B!�������N�l�q·�&��%)��aU�a]p�pG�>zQ���C�7~2�}
%@�B����%�>|Suz��v}��Ð�i�D�O"��ex���^�FÔ���a����Py��^VU�E޲@Z�5Wtٳ��>���q=8 �tY7WE�<c1�*�~aQ]b"�T��{����W��M��K57�kO��,�u]�F��xvЋ'� �:��PSot�H&$ BK魟3�LpY%�˘�q�sh|��P�㯎�K�+�G�S�#a 9Z��vnX},��&��`K���5qC����n�d�\�:j#}ês�V?�Em�mE��c��'"�&��'����ֵ(0Q>�/w_NfEI@o��hG�@�?gl]`��ײ���>P>��'ܕ_0g�T�A�9��^f,�Bq:z���T|�Q��4�����^�_1"��V�@(�.FA�K�̠�|��u�wtd�P�벑b$k�����W��$�k2�x��N��BTc�xs�'�V�XD]g�+�_��u(F!�{̐��5��.��>LY�x� �M!�vd��mE�[[`U�-��?��h��]\���,��B󕺐p8K+������[�@dޢA��o��}�~�ҟ����� �Wz      �   a   x��;
�0D�9����D��f1Y?Qb��M����(5B:�&K�L�5moR+�F��2���
�.��س���'X�'k�Ab$���љ�K��#$q      �   �   x��ѱNC1����]��8N��#���
�1��Хc����Z���P,*$J^Lsg/��eK���ٷ�f���>7:�В�h�B>�)2$�2[�o����X�/��*ǐ%�ؐ[����{P��0��`���H���6!�8�݉<ZW�N١D��SUp-��C����tz=z��{h�͎ n.)����ߟB�崓S      �   �   x��ѽ�0�9y��q��vAl 1�8q"*P�ԧ���?��l�[R--��K���1�,Ckn�.x���E&�{�9+�D�L� ��!H�����N2��m�!�77���^]��ô,�І?�P�be`)X;��@
���L�_:���z&�4�u����/ɟ7��'QM�3      �     x����n#G���S�K@�dk�1�C.�6Q�Ȑm$y������swu�T��W��f��}P1mĒ<��Y��q��8�YE��f"I�E�l��k�\s3�"E/�*W�Z%�^Kk��:��?^N��_�翇�^��UI'�lG����&���n�B�x����J����y��/�.��S�"��$j%7�9֜A�����{���2�ş�^/ϟ��t��np��h:��'�J�����cS��r�;-S��* ÙX1ֶ�+b/�I-]�.S�,��j�g�/�2������IX�U���8e�z���r�)n���-,�Lr�25g
��t��v)zqB5�p��A-��̊sh���]�����j�m����!\k� c�'(;//���G0۳C8J:����1���a��6�����R|�yW���8(F���Ь0'�$�-��C�����t����{z8=�~�B�{��z�|`�.沒�R.+ncg��u�2�,�:v��6"���F[��q%��]�,%����b��(������b�d�/�7;����G��7�%�gr�1֢[r��<����jrSϖt'i[��wm�y����ϧ3��9S8�rճrK�N�6)�-*q�&��Z����dm��
�L�F�}`Y���1#��r���x�UյCri̾(�������(��
���f��P-��7�I��:����6'w�����w���<� �b��so�H�Z���O�o������O���-8j�SC)��0�&�H	�4q>Л��FW��s�����q�N�ĆĽ[��t����r�g��$�:���kG�����$����e��ؼ�����PF}�ؐ���|}�����1�u�|���n�yÂn�:Z~�BEhQ�tb[�V�5�۰�W���)TE3Ε��\P5���C,�,�cT$��h��-�f���y��'�CTM�߆���0?�:#�D�A�>)Y��Q)���X��"�Q�~��!�e&\���p_�7�� �^ʪ��E��1q������v��8����������pww��.?      �      x������ � �      �   I   x����0 ���E_	��G��G�ݖ��r���R3�cTj�\�n<�=�F���QV3F�F��T���� �c;�      �   H  x���]k�0�����\��$�ɝ��?6����Z[�j��)��u7�n'�\>pޗ�7�i���.��� VA׺��g�`n�U�.ȤiZ�.(=��0��P��ME<���k [f���H!  ��(h)MO�j�ܚӱzt���E6N��t��е��1�))f�_�k�s+��������XЀ[<)=���[5�S�S�8��`�=�b<�/�`!�N����(�/�tw����QD6��w���̣��0��aXS��������'zB��y2>�zF�fv�L���ä|�k?�W�D��y�ʏ���yk:������            x������ � �      �   �   x���;n!@�SL��l����6R��(�D�{��E����O�y���2YkƷ|VgC�:[�P0x�X�#�j0�("��;KWIT�r������;�E��
҆�;�0�:'��쇉�CF���.-�wӧIr�l�/�/h�pi;�e�J����F�e�2���X��۳�����8Bie5�5 1�1��%�;�d'�]KR�g����L��%T��$��vO۶} ����     