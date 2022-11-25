import { React, useEffect, useState, useContext } from "react";
import UserProfileContainer from "../components/UserProfileContainer";
import { useParams } from "react-router-dom";

function UserInfoPage() {
  const [user, setUser] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(
        `http://localhost:3001/api/v1/accounts/?username=${id}`
      );

      if (!response.ok) {
        console.log(response.status);
      } else {
        const json = await response.json();
        setUser(json[0].profile);
      }
    };
    fetchUser();
  }, []);

  return (
    <>
      {user ? <UserProfileContainer user={user} /> : ''}
    </>
  );
}

export default UserInfoPage;
