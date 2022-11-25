PGDMP     3                
    z            chefswap    14.4 (Debian 14.4-1.pgdg110+1)    14.5 I    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
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
                        false    3            �           1255    18662 �   get_address_uid(character varying, character varying, character varying, character varying, character varying, character varying)    FUNCTION       CREATE FUNCTION public.get_address_uid(f_address1 character varying, f_address2 character varying, f_address3 character varying, f_city character varying, f_province character varying, f_postal_code character varying) RETURNS uuid
    LANGUAGE sql
    AS $$
SELECT address_uid FROM address WHERE address1=f_address1 AND 
((address2=f_address2) OR (COALESCE(address2, f_address2) IS NULL)) AND 
((address3=f_address3) OR (COALESCE(address3, f_address3) IS NULL)) AND 
city=f_city AND province=f_province AND postal_code=f_postal_code;
$$;
 �   DROP FUNCTION public.get_address_uid(f_address1 character varying, f_address2 character varying, f_address3 character varying, f_city character varying, f_province character varying, f_postal_code character varying);
       public          postgres    false            �            1259    18663    account    TABLE     7  CREATE TABLE public.account (
    account_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(30) NOT NULL,
    email character varying(80) NOT NULL,
    address_uid uuid NOT NULL,
    passhash character(60) NOT NULL,
    create_time timestamp with time zone DEFAULT now() NOT NULL,
    update_time timestamp with time zone DEFAULT now() NOT NULL,
    bio character varying(500) NOT NULL,
    circle_uid uuid NOT NULL,
    pfp_name character varying(200),
    avg_rating double precision,
    num_ratings integer DEFAULT 0 NOT NULL
);
    DROP TABLE public.account;
       public         heap    postgres    false    3            �            1259    18676    circle    TABLE     �   CREATE TABLE public.circle (
    circle_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    radius double precision NOT NULL,
    latitude double precision,
    longitude double precision
);
    DROP TABLE public.circle;
       public         heap    postgres    false    3            �            1259    18680    cuisine_preference    TABLE     �   CREATE TABLE public.cuisine_preference (
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
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
    DROP TABLE public.image;
       public         heap    postgres    false    3            �            1259    18861    rating    TABLE     �   CREATE TABLE public.rating (
    lo_uid uuid NOT NULL,
    hi_uid uuid NOT NULL,
    lo_rating integer,
    hi_rating integer,
    CONSTRAINT rating_uid_check CHECK ((lo_uid < hi_uid))
);
    DROP TABLE public.rating;
       public         heap    postgres    false            �            1259    18885    account_profile    VIEW     P
  CREATE VIEW public.account_profile AS
 WITH lo_rating AS (
         SELECT rating.lo_uid,
            sum(rating.lo_rating) AS rating_sum,
            count(rating.lo_uid) AS rating_count
           FROM public.rating
          GROUP BY rating.lo_uid
        ), hi_rating AS (
         SELECT rating.hi_uid,
            sum(rating.hi_rating) AS rating_sum,
            count(rating.hi_uid) AS rating_count
           FROM public.rating
          GROUP BY rating.hi_uid
        ), combined_rating AS (
         SELECT ((lo_rating.rating_sum + hi_rating.rating_sum) / (lo_rating.rating_count + hi_rating.rating_count)) AS avg_rating,
            (lo_rating.rating_count + hi_rating.rating_count) AS rating_count
           FROM (lo_rating
             JOIN hi_rating ON ((lo_rating.lo_uid = hi_rating.hi_uid)))
        ), temp_image_table AS (
         SELECT image.account_uid,
            json_agg(json_build_object('image_uid', image.image_uid, 'account_uid', image.account_uid, 'image_link', ('https://storage.googleapis.com/chefswap_0'::text || (image.image_name)::text), 'timestamp', image."timestamp")) AS images
           FROM public.image
          GROUP BY image.account_uid
        ), temp_preference_table AS (
         SELECT cuisine_preference.account_uid,
            json_agg(cuisine_preference.preference) AS preferences
           FROM public.cuisine_preference
          GROUP BY cuisine_preference.account_uid
        ), temp_speciality_table AS (
         SELECT cuisine_speciality.account_uid,
            json_agg(cuisine_speciality.speciality) AS specialities
           FROM public.cuisine_speciality
          GROUP BY cuisine_speciality.account_uid
        )
 SELECT json_strip_nulls(json_build_object('account_uid', account.account_uid, 'username', account.username, 'create_time', account.create_time, 'update_time', account.update_time, 'bio', account.bio, 'pfp_link', ('https://storage.googleapis.com/chefswap_0'::text || (account.pfp_name)::text), 'avg_rating', account.avg_rating, 'num_ratings', account.num_ratings, 'circle', json_build_object('radius', circle.radius, 'latitude', circle.latitude, 'longitude', circle.longitude), 'images', COALESCE(temp_image_table.images, '[]'::json), 'cuisine_preferences', COALESCE(temp_preference_table.preferences, '[]'::json), 'cuisine_specialities', COALESCE(temp_speciality_table.specialities, '[]'::json))) AS profile
   FROM ((((public.account
     LEFT JOIN public.circle USING (circle_uid))
     LEFT JOIN temp_image_table USING (account_uid))
     LEFT JOIN temp_preference_table USING (account_uid))
     LEFT JOIN temp_speciality_table USING (account_uid));
 "   DROP VIEW public.account_profile;
       public          postgres    false    221    218    218    218    219    219    220    220    221    216    216    216    226    216    216    226    226    226    221    221    216    216    216    218    216            �            1259    18672    address    TABLE     �  CREATE TABLE public.address (
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
       public         heap    postgres    false    3            �            1259    18880    account_view    VIEW     �  CREATE VIEW public.account_view AS
 WITH lo_rating AS (
         SELECT rating.lo_uid,
            sum(rating.lo_rating) AS rating_sum,
            count(rating.lo_uid) AS rating_count
           FROM public.rating
          GROUP BY rating.lo_uid
        ), hi_rating AS (
         SELECT rating.hi_uid,
            sum(rating.hi_rating) AS rating_sum,
            count(rating.hi_uid) AS rating_count
           FROM public.rating
          GROUP BY rating.hi_uid
        ), combined_rating AS (
         SELECT ((lo_rating.rating_sum + hi_rating.rating_sum) / (lo_rating.rating_count + hi_rating.rating_count)) AS avg_rating,
            (lo_rating.rating_count + hi_rating.rating_count) AS rating_count
           FROM (lo_rating
             JOIN hi_rating ON ((lo_rating.lo_uid = hi_rating.hi_uid)))
        ), temp_image_table AS (
         SELECT image.account_uid,
            json_agg(json_build_object('image_uid', image.image_uid, 'account_uid', image.account_uid, 'image_link', ('https://storage.googleapis.com/chefswap_0'::text || (image.image_name)::text), 'timestamp', image."timestamp")) AS images
           FROM public.image
          GROUP BY image.account_uid
        ), temp_preference_table AS (
         SELECT cuisine_preference.account_uid,
            json_agg(cuisine_preference.preference) AS preferences
           FROM public.cuisine_preference
          GROUP BY cuisine_preference.account_uid
        ), temp_speciality_table AS (
         SELECT cuisine_speciality.account_uid,
            json_agg(cuisine_speciality.speciality) AS specialities
           FROM public.cuisine_speciality
          GROUP BY cuisine_speciality.account_uid
        )
 SELECT json_strip_nulls(json_build_object('account_uid', account.account_uid, 'username', account.username, 'create_time', account.create_time, 'update_time', account.update_time, 'bio', account.bio, 'pfp_link', ('https://storage.googleapis.com/chefswap_0'::text || (account.pfp_name)::text), 'avg_rating', account.avg_rating, 'num_ratings', account.num_ratings, 'circle', json_build_object('radius', circle.radius, 'latitude', circle.latitude, 'longitude', circle.longitude), 'images', COALESCE(temp_image_table.images, '[]'::json), 'cuisine_preferences', COALESCE(temp_preference_table.preferences, '[]'::json), 'cuisine_specialities', COALESCE(temp_speciality_table.specialities, '[]'::json))) AS profile,
    account.email,
    json_strip_nulls(json_build_object('address1', address.address1, 'address2', address.address2, 'address3', address.address3, 'city', address.city, 'province', address.province, 'postal_code', address.postal_code, 'latitude', address.latitude, 'longitude', address.longitude)) AS address
   FROM (((((public.account
     LEFT JOIN public.circle USING (circle_uid))
     LEFT JOIN temp_image_table USING (account_uid))
     LEFT JOIN temp_preference_table USING (account_uid))
     LEFT JOIN temp_speciality_table USING (account_uid))
     LEFT JOIN public.address USING (address_uid));
    DROP VIEW public.account_view;
       public          postgres    false    217    226    226    226    226    221    221    221    221    220    220    219    219    218    218    218    218    217    217    217    217    217    217    217    217    216    216    216    216    216    216    216    216    216    216    216            �            1259    18840    cuisine    TABLE     L   CREATE TABLE public.cuisine (
    cuisine character varying(30) NOT NULL
);
    DROP TABLE public.cuisine;
       public         heap    postgres    false            �            1259    18691    message    TABLE     H  CREATE TABLE public.message (
    message_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sender_uid uuid NOT NULL,
    receiver_uid uuid NOT NULL,
    message_content character varying(300) NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    system_message boolean DEFAULT false NOT NULL
);
    DROP TABLE public.message;
       public         heap    postgres    false    3            �            1259    18697    session    TABLE     �   CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);
    DROP TABLE public.session;
       public         heap    postgres    false            �            1259    18702    swap    TABLE     [  CREATE TABLE public.swap (
    requester_uid uuid NOT NULL,
    requestee_uid uuid NOT NULL,
    request_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    accept_timestamp timestamp with time zone,
    end_timestamp timestamp with time zone,
    lo_uid uuid GENERATED ALWAYS AS (
CASE
    WHEN (requester_uid < requestee_uid) THEN requester_uid
    ELSE requestee_uid
END) STORED,
    hi_uid uuid GENERATED ALWAYS AS (
CASE
    WHEN (requester_uid < requestee_uid) THEN requestee_uid
    ELSE requester_uid
END) STORED,
    CONSTRAINT swap_check CHECK ((requester_uid <> requestee_uid))
);
    DROP TABLE public.swap;
       public         heap    postgres    false            �          0    18663    account 
   TABLE DATA           �   COPY public.account (account_uid, username, email, address_uid, passhash, create_time, update_time, bio, circle_uid, pfp_name, avg_rating, num_ratings) FROM stdin;
    public          postgres    false    216   �{       �          0    18672    address 
   TABLE DATA           ~   COPY public.address (address_uid, address1, address2, address3, city, province, postal_code, longitude, latitude) FROM stdin;
    public          postgres    false    217   g�       �          0    18676    circle 
   TABLE DATA           I   COPY public.circle (circle_uid, radius, latitude, longitude) FROM stdin;
    public          postgres    false    218   �       �          0    18840    cuisine 
   TABLE DATA           *   COPY public.cuisine (cuisine) FROM stdin;
    public          postgres    false    225   ��       �          0    18680    cuisine_preference 
   TABLE DATA           U   COPY public.cuisine_preference (account_uid, preference, preference_num) FROM stdin;
    public          postgres    false    219   �       �          0    18683    cuisine_speciality 
   TABLE DATA           U   COPY public.cuisine_speciality (account_uid, speciality, speciality_num) FROM stdin;
    public          postgres    false    220   ݊       �          0    18686    image 
   TABLE DATA           P   COPY public.image (image_uid, account_uid, image_name, "timestamp") FROM stdin;
    public          postgres    false    221   ��       �          0    18691    message 
   TABLE DATA           v   COPY public.message (message_uid, sender_uid, receiver_uid, message_content, "timestamp", system_message) FROM stdin;
    public          postgres    false    222   ��       �          0    18861    rating 
   TABLE DATA           F   COPY public.rating (lo_uid, hi_uid, lo_rating, hi_rating) FROM stdin;
    public          postgres    false    226   ��       �          0    18697    session 
   TABLE DATA           4   COPY public.session (sid, sess, expire) FROM stdin;
    public          postgres    false    223   Ϗ       	          0    17930    spatial_ref_sys 
   TABLE DATA           X   COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
    public          postgres    false    212   #�       �          0    18702    swap 
   TABLE DATA           p   COPY public.swap (requester_uid, requestee_uid, request_timestamp, accept_timestamp, end_timestamp) FROM stdin;
    public          postgres    false    224   @�       %           2606    18716    account account_email_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_email_key UNIQUE (email);
 C   ALTER TABLE ONLY public.account DROP CONSTRAINT account_email_key;
       public            postgres    false    216            '           2606    18718    account account_passhash_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_passhash_key UNIQUE (passhash);
 F   ALTER TABLE ONLY public.account DROP CONSTRAINT account_passhash_key;
       public            postgres    false    216            )           2606    18720    account account_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (account_uid);
 >   ALTER TABLE ONLY public.account DROP CONSTRAINT account_pkey;
       public            postgres    false    216            ,           2606    18722    account account_username_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_username_key UNIQUE (username);
 F   ALTER TABLE ONLY public.account DROP CONSTRAINT account_username_key;
       public            postgres    false    216            .           2606    18724    address address_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.address
    ADD CONSTRAINT address_pkey PRIMARY KEY (address_uid);
 >   ALTER TABLE ONLY public.address DROP CONSTRAINT address_pkey;
       public            postgres    false    217                       2606    18857    address address_province_check    CHECK CONSTRAINT     �  ALTER TABLE public.address
    ADD CONSTRAINT address_province_check CHECK (((province)::text = ANY (ARRAY['Ontario'::text, 'Quebec'::text, 'British Columbia'::text, 'Alberta'::text, 'Manitoba'::text, 'Saskatchewan'::text, 'Nova Scotia'::text, 'New Brunswick'::text, 'Newfoundland and Labrador'::text, 'Prince Edward Island'::text, 'Northwest Territories'::text, 'Yukon'::text, 'Nunavut'::text]))) NOT VALID;
 C   ALTER TABLE public.address DROP CONSTRAINT address_province_check;
       public          postgres    false    217    217            0           2606    18726    circle circle_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.circle
    ADD CONSTRAINT circle_pkey PRIMARY KEY (circle_uid);
 <   ALTER TABLE ONLY public.circle DROP CONSTRAINT circle_pkey;
       public            postgres    false    218            D           2606    18844    cuisine cuisine_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY public.cuisine
    ADD CONSTRAINT cuisine_pkey PRIMARY KEY (cuisine);
 >   ALTER TABLE ONLY public.cuisine DROP CONSTRAINT cuisine_pkey;
       public            postgres    false    225            2           2606    18728 D   cuisine_preference cuisine_preference_account_uid_preference_num_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_account_uid_preference_num_key UNIQUE (account_uid, preference_num);
 n   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_account_uid_preference_num_key;
       public            postgres    false    219    219                       2606    18729 :   cuisine_preference cuisine_preference_preference_num_check    CHECK CONSTRAINT     �   ALTER TABLE public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_preference_num_check CHECK (((preference_num >= 0) AND (preference_num < 6))) NOT VALID;
 _   ALTER TABLE public.cuisine_preference DROP CONSTRAINT cuisine_preference_preference_num_check;
       public          postgres    false    219    219            6           2606    18856 D   cuisine_speciality cuisine_speciality_account_uid_speciality_num_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_account_uid_speciality_num_key UNIQUE (account_uid, speciality_num);
 n   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_account_uid_speciality_num_key;
       public            postgres    false    220    220                       2606    18732 :   cuisine_speciality cuisine_speciality_speciality_num_check    CHECK CONSTRAINT     �   ALTER TABLE public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_speciality_num_check CHECK (((speciality_num >= 0) AND (speciality_num < 6))) NOT VALID;
 _   ALTER TABLE public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_speciality_num_check;
       public          postgres    false    220    220                       2606    18879    rating hi_rating_check    CHECK CONSTRAINT     x   ALTER TABLE public.rating
    ADD CONSTRAINT hi_rating_check CHECK (((hi_rating >= 1) AND (hi_rating <= 5))) NOT VALID;
 ;   ALTER TABLE public.rating DROP CONSTRAINT hi_rating_check;
       public          postgres    false    226    226            :           2606    18734    image image_pkey 
   CONSTRAINT     U   ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (image_uid);
 :   ALTER TABLE ONLY public.image DROP CONSTRAINT image_pkey;
       public            postgres    false    221                       2606    18735    address latitude    CHECK CONSTRAINT     �   ALTER TABLE public.address
    ADD CONSTRAINT latitude CHECK (((latitude > ('-90'::integer)::double precision) AND (latitude < (90)::double precision))) NOT VALID;
 5   ALTER TABLE public.address DROP CONSTRAINT latitude;
       public          postgres    false    217    217                        2606    18878    rating lo_rating_check    CHECK CONSTRAINT     x   ALTER TABLE public.rating
    ADD CONSTRAINT lo_rating_check CHECK (((lo_rating >= 1) AND (lo_rating <= 5))) NOT VALID;
 ;   ALTER TABLE public.rating DROP CONSTRAINT lo_rating_check;
       public          postgres    false    226    226                       2606    18736    address longitude    CHECK CONSTRAINT     �   ALTER TABLE public.address
    ADD CONSTRAINT longitude CHECK (((longitude > ('-180'::integer)::double precision) AND (longitude < (180)::double precision))) NOT VALID;
 6   ALTER TABLE public.address DROP CONSTRAINT longitude;
       public          postgres    false    217    217            <           2606    18740    message message_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_pkey PRIMARY KEY (message_uid);
 >   ALTER TABLE ONLY public.message DROP CONSTRAINT message_pkey;
       public            postgres    false    222            F           2606    18866    rating rating_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_pkey PRIMARY KEY (lo_uid, hi_uid);
 <   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_pkey;
       public            postgres    false    226    226            ?           2606    18742    session session_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);
 >   ALTER TABLE ONLY public.session DROP CONSTRAINT session_pkey;
       public            postgres    false    223            A           2606    18860    swap swap_pkey 
   CONSTRAINT     y   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT swap_pkey PRIMARY KEY (requester_uid, requestee_uid, request_timestamp);
 8   ALTER TABLE ONLY public.swap DROP CONSTRAINT swap_pkey;
       public            postgres    false    224    224    224            4           2606    18748 /   cuisine_preference user_cuisine_preference_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT user_cuisine_preference_pkey PRIMARY KEY (account_uid, preference);
 Y   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT user_cuisine_preference_pkey;
       public            postgres    false    219    219            8           2606    18750 /   cuisine_speciality user_cuisine_speciality_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT user_cuisine_speciality_pkey PRIMARY KEY (account_uid, speciality);
 Y   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT user_cuisine_speciality_pkey;
       public            postgres    false    220    220            =           1259    18751    IDX_session_expire    INDEX     J   CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);
 (   DROP INDEX public."IDX_session_expire";
       public            postgres    false    223            *           1259    18752    account_uid_index    INDEX     L   CREATE INDEX account_uid_index ON public.account USING btree (account_uid);
 %   DROP INDEX public.account_uid_index;
       public            postgres    false    216            B           1259    18858    unique_swap_constraint    INDEX     v   CREATE UNIQUE INDEX unique_swap_constraint ON public.swap USING btree (lo_uid, hi_uid) WHERE (end_timestamp IS NULL);
 *   DROP INDEX public.unique_swap_constraint;
       public            postgres    false    224    224    224            G           2606    18820     account account_address_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_address_uid_fkey FOREIGN KEY (address_uid) REFERENCES public.address(address_uid) NOT VALID;
 J   ALTER TABLE ONLY public.account DROP CONSTRAINT account_address_uid_fkey;
       public          postgres    false    216    4142    217            H           2606    18825    account account_circle_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_circle_uid_fkey FOREIGN KEY (circle_uid) REFERENCES public.circle(circle_uid) NOT VALID;
 I   ALTER TABLE ONLY public.account DROP CONSTRAINT account_circle_uid_fkey;
       public          postgres    false    4144    218    216            I           2606    18830 6   cuisine_preference cuisine_preference_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 `   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_account_uid_fkey;
       public          postgres    false    219    216    4137            J           2606    18845 5   cuisine_preference cuisine_preference_preference_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_preference
    ADD CONSTRAINT cuisine_preference_preference_fkey FOREIGN KEY (preference) REFERENCES public.cuisine(cuisine) NOT VALID;
 _   ALTER TABLE ONLY public.cuisine_preference DROP CONSTRAINT cuisine_preference_preference_fkey;
       public          postgres    false    225    4164    219            K           2606    18835 6   cuisine_speciality cuisine_speciality_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 `   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_account_uid_fkey;
       public          postgres    false    220    4137    216            L           2606    18850 5   cuisine_speciality cuisine_speciality_speciality_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cuisine_speciality
    ADD CONSTRAINT cuisine_speciality_speciality_fkey FOREIGN KEY (speciality) REFERENCES public.cuisine(cuisine) NOT VALID;
 _   ALTER TABLE ONLY public.cuisine_speciality DROP CONSTRAINT cuisine_speciality_speciality_fkey;
       public          postgres    false    225    220    4164            M           2606    18815    image image_account_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_account_uid_fkey FOREIGN KEY (account_uid) REFERENCES public.account(account_uid) ON DELETE CASCADE NOT VALID;
 F   ALTER TABLE ONLY public.image DROP CONSTRAINT image_account_uid_fkey;
       public          postgres    false    221    4137    216            P           2606    18768    swap match_account1_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT match_account1_uid_fkey FOREIGN KEY (requester_uid) REFERENCES public.account(account_uid);
 F   ALTER TABLE ONLY public.swap DROP CONSTRAINT match_account1_uid_fkey;
       public          postgres    false    216    224    4137            Q           2606    18773    swap match_account2_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.swap
    ADD CONSTRAINT match_account2_uid_fkey FOREIGN KEY (requestee_uid) REFERENCES public.account(account_uid);
 F   ALTER TABLE ONLY public.swap DROP CONSTRAINT match_account2_uid_fkey;
       public          postgres    false    224    216    4137            N           2606    18778 !   message message_receiver_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_receiver_uid_fkey FOREIGN KEY (receiver_uid) REFERENCES public.account(account_uid);
 K   ALTER TABLE ONLY public.message DROP CONSTRAINT message_receiver_uid_fkey;
       public          postgres    false    216    222    4137            O           2606    18783    message message_sender_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_sender_uid_fkey FOREIGN KEY (sender_uid) REFERENCES public.account(account_uid);
 I   ALTER TABLE ONLY public.message DROP CONSTRAINT message_sender_uid_fkey;
       public          postgres    false    216    4137    222            R           2606    18872    rating rating_hi_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_hi_uid_fkey FOREIGN KEY (hi_uid) REFERENCES public.account(account_uid);
 C   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_hi_uid_fkey;
       public          postgres    false    216    226    4137            S           2606    18867    rating rating_lo_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_lo_uid_fkey FOREIGN KEY (lo_uid) REFERENCES public.account(account_uid);
 C   ALTER TABLE ONLY public.rating DROP CONSTRAINT rating_lo_uid_fkey;
       public          postgres    false    216    4137    226            �   [  x�m�YRI��ۧ�#�6QMee�zrc@`v�b�p�
!��F�	��6W�#L6o3��Pdu-_���Ʀ=+J&��̂N�$�1x]J���L���7~4����2EXm|a���dJ�9aӂCq`x_���w��{>���ă�Ԍ?��^��&����NB_����ַ�9�������0n{\���UK�7p�=��/���i.��N�ru4�tF@H���I�%�z&���l��b�E�$s*�I27���Y*<��R���,���r���-\��\�Q���\T_�*�=��
X)Y1�hY�1�LΠO�>c�n{�#��
���E
&��kKE����/�<�����>��0�����<�l���n�OԊx�lo�l�sm��t9ĻĠ'D�^P��h�/8���^]+���.;�l���J��Y͌uȤ7����T1%nx�����̎9m�5���3E�$�s�q���~bx��c^ �g^	δ��*�d|2ďף�.Vʹ����hP��w{X?����T�^ss|r||=]��'���3s&�ǡ�]L�����LD�N` }�j�%�do�bq�����>�{s����m�����,��@l,R{� rF#T^�hx�s�Ti�iP@�1$�+p�F2��]y�4q��������x4-xf�#*� �%kFJ� �R_��K����!w��l,t"̆d��" 7�.�f6?
W�]ۺ:ݸ�x�y��6iW>����������}��ښ~�|�[_Ά�q��ND�sc�%��׶�=0}�L-��RwY��T.�2Xf���K	Yp�K!梹�6�._�Ah%}`�*R���y$94��$�R=��q��P%��ʤ!�1���f�A0��Hs@T�<��2��O�dp��=�~�}h��<�GJm��ǵk�����x�7�˧���Ne��%҉ш_T��٪�,����l�s�hW���T ��;�BHR���	D�di�1 �ವ�V�oO5����}����ǭd�INT!g�ژ�
�4���i�>�X��˰��uu��m^6n���/;�/.?��ts0�������$U��������}$�z��Vχ�t�.����za6�q:�����?�UEg��J,[$A���!�(��$�m��,Y2�����	4�
��P� �.���i�H�_X��20,�H�D��W9���(.�/qV�v6_��YK���Ŵ�$���b�L��µ%m�X,^э�І�J��FԘd����I�:>��h���a��Jo�ą(��a8�+�vk:��g�`4�K��K�kNKrsJ��;��뽽��fg��R�P)�(I@-f�n,��t��*�d�ِ�t�)j�9i�DL�;�&N�G�j�����/��7o��M"      �   �  x��VˎG<��B?@��M��G{�S�b/��/�-d-ڕ�}8�:�:����0*�*��:ZF�Tz�=�$�j�ͥ}����_�~OOˇ���p��O����ӳ]���Mz��������J�(;iRR�	x9Lq���z.��Ka�ӱ���e���v�?����}�wg뷯�^?|��n�v�~�����}�>�����}���h���1�y�r@Ō%��T�� Ձ�3�b�a����������}�?\�����}�Ku�׏���~C����b��{V䠴�"�NC�V�#��@�F��{X�mg%��@U/9����[�V�3�MSh��~bl@�լ�f�/���%m
�vL�f1�'d0�&�?2G�P�rL�����`ء�'[{w����х�Շf�A	} ��Go�mIGBk�Pt��{�e!�R�H���6dj���[�@�.�3��T�R�M��b�#��R��u�	$3���D��E��Q����SW���b���z�V�d{ccgXtU�nꂉn4m�6R���/��SZ�U5�	id�M*���F�	Hia����t�-Ui#t����S�Tȫ6h��i������ղm94Q�}U��a#HXJ�Cֺ)`����d�nN��N �c���¶��U�M�V|[t��W3�D�Ѷu�L�Ӎ�{kT��]�;�]Ҩ)��G�7�r?��z9��@�%���sr��qF�t��5*`��|,�@(�Zx�<|�����|�y�;�}��ǧ�e6N�G�Y~�Oh\3M(%��L���ۉ;�{]�o^Y%�Y�-O�"��X����r|>>}�ߝ��������A<�`�����iڕ�O����t�;�iN>��u]��M[�Ӱ:o�.�\^��d�{��q�^
��p��v8��
      �   Z  x�UU�m$;���E^"�$^��3�^�=��چa�X�D�	/�����5K��g�f��e��f��\�T��
��)�$"�j�Vt[}ע�Q��*}������L���D�H���
 W����}p�bd�Yk�Ôsm�'�'��?�N>'���qԚ��G����K���<p]+�<���L-����H��!�_�y87IjU�^%�,U�5�&W����Xa`oaX�*c�㔳�y~�5i�j�U�qe1&w���g��p*�7%��O)���/� �*Y㴫��5O^	�nIw)k���\�׋���7�i�u���aq�Ɓ/`��U=O��V�MR����F�8}��i-q�����Ӓ�ܒ�n�u�m?X�4� ���	�����g�n�e�����-��]=;\y�i�	�%���s)H���~��������\9�	�/Z�:y�TL2�W��]T��t�1���UA������o�|L�4�̀9m"&�`�~��!j�︤[�Jb�q�S�:	p�k��� g6��"R���>O)�([R���ГYI`��W��c�Zd��u3J�����x;.>щT�{/�����M5`;�]�`G"*
�-��vJ�t�s�C�MM6��ê�#&Rp�����"}�bJu�2���l�>�� ���&�� >��/!p��(�U�?�)-v�I�0�l��n϶����[`�@`��^,G��E��˻�P7e�պ�����>�S5���1ln�@_c�LR��
�Cה6�ͦ��L{�?�`�!T(�GZ�[j	�[/�5,5i[�F���zP�'��
@`x����⌆a�{i�~δ2u eČ��$���sx<S�J#�����c�t�-u��M�&^��
p��X5</��ǲ�4�[����.�+�!Hy��k$��{����H�b�9(�),z��Z��_%�9bQ�"d��1Rq�j�[����P5� g�r�s*+J����@��R�:cۂ*`�ߑ��'�]��@� �~��7��"V!��ZEȚ�:��o�^\|?���l��i�S�W��� T0�ףo��������9���ư]GA���F������]���3���D'Ԋ�*�?���2_��      �   a   x��;
�0D�9����D��f1Y?Qb��M����(5B:�&K�L�5moR+�F��2���
�.��س���'X�'k�Ab$���љ�K��#$q      �   �   x��ѽNC1�9y�8��vA݊���ı�u@L}zn{%��O�9�9	i���
i�N,�hij��Ur�_s~8�y_��M���U7����_�es�k�]S� �ۀơʐ�m֚�;���4��#u\���䨸�Q�}hH1����>�6$�Z���Tl�T�!`R�
��ijD�%����N/�a��e��F#�v.������ߞ��?��6      �   �   x���;1E�:ًQ>N�[4H�4N��h
D5��3, �ѕ���I�
�:�K�BW�c�ܻ9��[����&،K%��JL�wl���9>[��C�4������<fYL�ZJQD��^��c�R�znD�̴�W�A���1���d[�c���d�;k�z�      �   �  x����n#G�k�)T�	� 9�Re pE� �뢜m�I�>\��|�*ڙ������<�J��T���p��5)W�뀽zRr��d��}�T���J�м8�&@)eȮ��`FY���5.k��ٟ�����ޟ��_����@'�('���g�?#>,�)�g���@�aJ�6Y�7��!V�ԑ:�L�j����ϱ�L����������\W�G�^_>�Ke�U���/���G�5ꄬ�@-+�Ձca�kU��K8�P4��L��.�[�B��D`)��M�ck�$�4�ԯs���yyܱY���}�J;*�)��VKF�U��
�@�֠`���Z��e%�m�CɞF�a�����-�Ǚ��`5�t�d�MĲ����B��Ƭ�a񼾞g�߳���҉ʦ$�dg�2��k��#̙qm�a#&2��m��>�dӪ���2͐�T�FDB��3���t�|�Ja՛�}�O�5b���U�b��I�ט����	������� �&�X0B���?�����O��������_�/oߴ�"$;j��%�zk��t�BX] [<h,:kVq���>Tu�+X�ZN!��0�JD99����y~��턺!���X��P�1T]y�K	�G�ǜ���0Zk#��q��gYLЀ�{X9U�&''�K��MY[�9!�Z}�^���򝱁űX�D�1[d������0�!x_l�=\q[om5����jjv.c�=VՊ�[�A���|	?�J[�\�f�a+�f�R��$Y�9Za���4{�K�h9zN�8Ɗ�Ҭ��L5w�5V_�^z�<� V�j*;X��1��*kW�"��,V�����3�b3-�\�tQ��z�g�˜�����Ct��R�)�-��fJ�����?��خ���ۑ? �[��Rs�#��SE7b^.��5żk�_!k�Z� ����0t�k/�]}�1�(ȷ���ګ/���4�`xxE�oR��j,��G\����9�U�����>��cVE�ܾl����      �      x������ � �      �      x������ � �      �   D  x����N�@ E��+̬�g;3�Bx�U0%�fڙBh�Z	�n�h�J�]��ޛ}��I�Ȋ��=�>�z�e��0m��uq����3���*��M�+��2��6�U��m ��1$nH��Ha��Ro	ڠ��a���)l��2�m�o��r�,܂K�8��r����LSì�R�2��(א�YC����K����`E�b�yE�4,��?z���z^�0��/G�ԛ�ݏ�+Dg��?�!�W�;��W����Ea�~R�݇���Y�=Pt�����yJ�U~2�1��	'	d�(�k`b�l�#�&�o?�Ê!��8�'޲�      	      x������ � �      �   �   x���=n�0��>E��%J��	�Жx�#�i�������h��٠���bF�s����QC��l	�)9PAlf)�02���h7ݸ�T�#.��9k��Ii1��i�mD�c�sR1�4�/��Z����K����SS����?�}�_�����W�H�s	���ȡMD�(�?덥�u+��R�w�綮�K]n     