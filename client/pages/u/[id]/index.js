import { React, useEffect, useState } from "react";
import UserProfileContainer from "../../../components/UserProfileContainer";
import Head from "next/head";
import global_vars from "../../../utils/config";
import { useRouter } from "next/router";
// import { useParams } from "react-router-dom";

function UserInfoPage({ user }) {
  const router = useRouter();
  const { id } = router.query;
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const response = await fetch(
  //       `https://chefswap-server.fly.dev/api/v1/accounts/?username=${id}`
  //     );

  //     if (!response.ok) {
  //       console.log(response.status);
  //     } else {
  //       const json = await response.json();
  //       console.log(json);
  //       setUser(json[0].profile);
  //     }
  //   };
  //   fetchUser();
  // }, []);

  return (
    <>
      <Head>
        <title>{`Chefswap | ${id ? id + "'s profile" : "Loading..."}`}</title>
      </Head>

      {user ? <UserProfileContainer user={user} /> : <></>}
    </>
  );
}

export default UserInfoPage;

export async function getStaticPaths() {
  const server = global_vars.serverUrl;
  const response = await fetch(`${server}/api/v1/accounts/`);
  const users = await response.json();

  const paths = users.map((user) => ({
    params: {
      id: `${user.profile.username}`,
    },
  }));

  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const { id } = params;
  const server = global_vars.serverUrl;

  const response = await fetch(`${server}/api/v1/accounts?username=${id}`);
  const similarUsers = await response.json();
  if (similarUsers.length === 0) return { notFound: true };

  const user = similarUsers[0].profile;
  // TODO: page crashes when username doesn't exist in db
  if (user?.username !== id) return { notFound: true };

  return {
    props: { user },
    revalidate: 30,
  };
}
