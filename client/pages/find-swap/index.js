import React, { useEffect, useState, useRef, useCallback } from "react";
import FilterForm from "../../components/FilterForm";
import OnlyLoggedIn from "../../components/OnlyLoggedIn";
import SwapResultsContainer from "../../components/SwapResultsContainer";
import styles from "../../styles/FindSwapPage.module.scss";
import { useUser } from "../../components/useUser";
import { fetchSpecific } from "../../utils/fetchFunctions";
import { useSwapSearch } from "../../components/useSwapSearch";
import { Box, Drawer, Button } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import global_vars from "../../utils/config";
import Head from "next/head";

// distance: (user.profile.distance / 1000).toFixed(1),
// avg_rating: user.profile.avgRating
function filterForDisplay(users) {
  console.log(users);
  return users.map((user) => {
    return {
      avg_rating: user.profile.avgRating,
      cuisineSpecialities: user.profile.cuisineSpecialities,
      distance: user.profile.distance / 1000,
      pfpLink: user.profile.pfpLink,
      username: user.profile.username,
      accountUid: user.profile.accountUid,
      numRatings: user.profile.numRatings,
    };
  });
}

/**
 * /find-swaps page
 * @use Navbar, FilterForm, SwapsResultsContainer
 */
export default function FindSwapPage(props) {
  const user = useUser();
  const loading = global_vars.userStates.loading;

  // State for filter form
  const [cuisineChecked, setCuisineChecked] = useState([]);
  const [rating, setRating] = useState(null);
  const [distance, setDistance] = useState(null);
  // const [username, setUsername] = useState(null);

  const [userAddress, setUserAddress] = useState(null);
  const [orderBy, setOrderBy] = useState("distanceAsc");
  const [userObserver, setUserObserver] = useState(null);
  const [searchState, searchDispatch, isLoading] = useSwapSearch(
    userObserver,
    user,
    userAddress,
    {
      distance: distance,
      rating: rating,
      cuisineChecked: cuisineChecked,
      orderBy: orderBy,
    }
  );
  const observer = useRef();
  const innerRefData = useRef();
  const lastUser = useCallback(
    (node) => {
      if (isLoading) {
        return;
      }
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
    },
    [isLoading]
  );

  /* MUI Responsive Drawer */
  const [drawerState, setDrawerState] = useState(false);
  console.log(drawerState);

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && event.key !== "Escape") {
      return;
    }

    setDrawerState(open);
  };

  const filterSidebar = (
    <Box
      sx={{ width: 300 }}
      role="presentation"
      onKeyDown={toggleDrawer(false)}
    >
      <FilterForm
        cuisineChecked={cuisineChecked}
        rating={rating}
        distance={distance}
        // username={username}
        onTickedChange={handleTickedChange}
        onRatingChange={handleRatingChange}
        onDistanceChange={handleDistanceChange}
        // onUsernameChange={handleUsernameChange}
      />
    </Box>
  );

  const { window } = props;
  const container =
    window !== undefined ? () => window.document.body : undefined;

  const drawerWidth = 301;

  useEffect(() => {
    if (user == loading) {
      return;
    }
    fetchSpecific(user.accountUid, "address", setUserAddress);
  }, [user]);

  if (user == loading || userAddress == null) {
    return (
      <>
        <Head>
          <title>Chefswap | Find a swap</title>
        </Head>
      </>
    );
  }

  /* FUNCTIONS FOR FILTER FORM */
  function handleTickedChange(value) {
    console.log(`Cuisine ticked off: ${value}`);
    setCuisineChecked(value);
  }

  function handleRatingChange(value) {
    console.log(`Rating changed to ${value}`);
    setRating(value);
  }

  function handleDistanceChange(value) {
    console.log(`Distance changed to ${value}`);
    setDistance(value);
  }

  // function handleUsernameChange(value) {
  //   console.log(`Username changed to ${value}`);
  //   setUsername(value);
  // }

  return (
    <>
      <Head>
        <title>Chefswap | Find a swap</title>
      </Head>
      <OnlyLoggedIn>
        <div className={styles.find_swap_page}>
          <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            aria-label="Filter options"
          >
            <Drawer
              container={container}
              variant="temporary"
              open={drawerState}
              onClose={toggleDrawer(false)}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
              className="mui-filter-sidebar"
              sx={{
                display: { xs: "block", sm: "none" },
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: drawerWidth,
                },
              }}
            >
              {filterSidebar}
            </Drawer>
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: "none", sm: "block" },
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: drawerWidth,
                },
              }}
              open
            >
              {filterSidebar}
            </Drawer>
          </Box>
          <div className={styles.find_swap_content}>
            {!drawerState ? (
              <div
                style={{
                  position: "absolute",
                  left: "-15px",
                  top: "50%",
                  bottom: "50%",
                }}
              >
                <Button
                  fullWidth
                  color="warning"
                  onClick={toggleDrawer(true)}
                  sx={{ borderRadius: 999 }}
                  size="large"
                >
                  <KeyboardArrowRightIcon />
                </Button>
              </div>
            ) : null}
            <SwapResultsContainer
              searchState={filterForDisplay(searchState)}
              searchDispatch={searchDispatch}
              setOrderBy={setOrderBy}
              user={user}
              lastUser={lastUser}
              numLoadedUsers={searchState.length}
              innerRefData={innerRefData}
            />
          </div>
        </div>
      </OnlyLoggedIn>
    </>
  );
}
