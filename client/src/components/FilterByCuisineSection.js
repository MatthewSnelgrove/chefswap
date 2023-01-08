import React from "react";
// import CuisineSearch from "./CuisineSearch";
// import CuisineSearchList from "./CuisineSearchList";
// import PropTypes from "prop-types";
import "../general.scss";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Tooltip } from "@mui/material";

/**
 * Container component for filtering swap results by cuisine name
 * @use CuisineSearch, CuisineSearchList
 * @param cuisineTyped Cuisine name typed into search bar
 * @param cuisineChecked Array of cuisine names ticked off by user
 * @param fcns... For handling onchange
 */
export default function FilterByCuisineSection(props) {
  if (!props.cuisineChecked || !props.onTickedChange) {
    console.error("Missing function props in FilterByCuisineSection");
    return null;
  }

  // Example tag data
  // TODO: Replace with actual tags
  const tags = [
    { title: "American" },
    { title: "Chinese" },
    { title: "French" },
    { title: "Greek" },
    { title: "Indian" },
    { title: "Italian" },
    { title: "Japanese" },
    { title: "Korean" },
    { title: "Mediterranean" },
    { title: "Mexican" },
    { title: "Middle Eastern" },
    { title: "Thai" },
    { title: "Vietnamese" },
    { title: "Other" },
  ];

  // Handles the onChange event for the Autocomplete component
  function handleTagSelection(event, value) {
    const newTags = value.map((tag) => tag.title);
    props.onTickedChange(newTags);
  }

  return (
    <>
      <div
        className="filter-form-header"
        style={{ display: "flex", alignItems: "center", gap: 15 }}
      >
        <h2>What?</h2>
        <Tooltip
          title="Filter by what cuisine specialties you want your swap partner to have."
          arrow
          placement="right"
        >
          <img
            src="/info.svg"
            alt="Tooltip for cuisine filter"
            className="filter-form-tooltip"
          />
        </Tooltip>
      </div>
      <Autocomplete
        multiple
        id="tags-outlined"
        options={tags}
        getOptionLabel={(option) => option.title}
        filterSelectedOptions
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Cuisine Specialties"
            placeholder="Cuisines"
          />
        )}
        onChange={handleTagSelection}
        isOptionEqualToValue={(option, value) => option.title === value.title}
      />
    </>
  );
}
