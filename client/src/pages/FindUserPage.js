import { React, useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "../components/useUser";
import { useParams } from "react-router-dom";
import OnlyLoggedIn from "../components/OnlyLoggedIn";
import "../pages/styles/FindUserPage.css";
import SwapListing from "../components/SwapListing";
import { fetchSpecific } from "../../utils/fetchFunctions";
import { useUsernameSearch } from "../components/useUsernameSearch";
import { newSwapRequest } from "../../utils/changeFunctions";
import SearchBy from "../components/SearchBy";
import global_vars from "../../utils/config";

function FindUserPage(props) {
  const { usernameQuery } = useParams();
  const user = useUser();
  const [userAddress, setUserAddress] = useState(null);
  const [userObserver, setUserObserver] = useState(null);
  const [users, setUsers] = useUsernameSearch(
    userAddress,
    usernameQuery,
    userObserver
  );
  const loading = global_vars.userStates.loading;
  const observer = useRef();
  const innerRefData = useRef();
  const lastUser = useCallback((node) => {
    if (observer.current) {
      observer.current.disconnect();
    }
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setUserObserver(innerRefData.current);
      }
    });
    if (node) {
      observer.current.observe(node);
    }
  }, []);

  useEffect(() => {
    if (user == loading) {
      return;
    }
    fetchSpecific(user.accountUid, "address", setUserAddress);
  }, [user]);

  return (
    <OnlyLoggedIn>
      <div className="navbar-margin container search-user-container">
        <SearchBy
          containerStyle={{
            marginBottom: "10px",
            display: "flex",
            flexWrap: "wrap",
          }}
          textStyle={{ fontSize: "30px", marginRight: "10px" }}
          inputStyle={{ fontSize: "30px", display: "flex" }}
        />
        <div className="users-container">
          {users.map((otherUser, index) => {
            const profile = otherUser.profile;
            return (
              <SwapListing
                innerRef={index + 1 == users.length ? lastUser : null}
                innerRefData={index + 1 == users.length ? innerRefData : null}
                pfpLink={profile.pfpLink}
                username={profile.username}
                distance={profile.distance / 1000}
                rating={profile.avgRating}
                cuisineSpecialities={profile.cuisineSpecialities}
                key={profile.username}
                accountUid={profile.accountUid}
                numRatings={profile.numRatings}
                similarity={profile.similarity}
                finalColJsx={
                  <>
                    <button
                      style={{ border: "0px" }}
                      onClick={(e) => {
                        createNewSwapRequest(
                          user,
                          profile.accountUid,
                          profile.username,
                          setUsers
                        );
                      }}
                    >
                      <span
                        style={{ fontSize: "60px" }}
                        class="material-symbols-outlined small-swap-button"
                      >
                        swap_horiz
                      </span>
                    </button>
                    <button
                      className="swap-button"
                      onClick={(e) => {
                        createNewSwapRequest(
                          user,
                          profile.accountUid,
                          profile.username,
                          setUsers
                        );
                      }}
                    >
                      <span className="swap-text">Send Swap Request</span>
                    </button>
                  </>
                }
              />
            );
          })}
        </div>
      </div>
    </OnlyLoggedIn>
  );
}

function createNewSwapRequest(user, requesteeUid, requesteeUsername, setUsers) {
  // newSwapRequest(user.accountUid, requesteeUid, requesteeUsername).then(() => {
  setUsers((curUsers) =>
    curUsers.filter((otherUser) => otherUser.profile.accountUid != requesteeUid)
  );
  // })
}

export default FindUserPage;
