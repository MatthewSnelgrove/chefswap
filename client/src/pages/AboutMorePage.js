import React, { useState } from "react";
import { Drawer, Button, Box } from "@mui/material";
import FilterForm from "../components/FilterForm";

// test for FilterForm
function AboutUsPage(props) {
  // Note: Cuisine text state removed
  const [cuisineChecked, setCuisineChecked] = useState([]);
  const [rating, setRating] = useState(null);
  const [distance, setDistance] = useState(null);
  // const [username, setUsername] = useState(null);

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

  // MUI Responsive Drawer
  const [drawerState, setDrawerState] = useState(false);

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

  return (
    <div style={{ marginTop: 100, display: "flex" }}>
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
      {!drawerState ? (
        <Button onClick={toggleDrawer(true)}>Filter</Button>
      ) : null}
      lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum
    </div>
  );
}

export default AboutUsPage;
