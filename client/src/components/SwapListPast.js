import {React, useState, useEffect } from "react";
import SwapListBlueprint from "./SwapListBlueprint";
import SwapListing from "./SwapListing";
import "../pages/styles/MySwapsPage.css"
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { createTheme } from "@mui/system";
import { ThemeProvider } from "@emotion/react";
import FilterByRating from "./FilterByRating";
import { changeAvgRating } from "../utils/changeFunctions"
import { getMultipleRatings } from "../utils/fetchFunctions"

function getUserDateList(swapListPast) {
  let userDateList = {}
  swapListPast.forEach((user) => {
    if (userDateList[user.username]) {
      userDateList[user.username] = [...userDateList[user.username], user]
    }
    else {
      userDateList[user.username] = [user]
    }
  })
  return userDateList
}

function SwapListPast(props) {
  const [curUser, setCurUser] = useState({username: ""})
  const [ratingList, setRatingList] = useState([])
  const loading = global.config.userStates.loading
  const userDateList = getUserDateList(props.swapListPast)
  const fontTheme = createTheme({
    typography: {
      fontFamily: [  '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      'sans-serif'].join(","),
    }
  })

  useEffect(() => {
    if (props.user == loading) {return}
    getMultipleRatings(getUserDateList(props.swapListPast), props.user, setRatingList)
  }, [props.swapListPast])

  return (
      <SwapListBlueprint type={"Ended"} data={props.swapListPast}>
        <div id="accordionExample">
          {Object.entries(userDateList).map((swapData) => (
            <Accordion disableGutters={true}>
              <SwapListing
                key={swapData[1][0].accountUid}
                cuisineSpecialities={swapData[1][0].cuisineSpecialities}
                distance={swapData[1][0].distance}
                date={swapData[1][0].date}
                username={swapData[0]}
                pfpLink={swapData[1][0].pfpLink}
                rating={swapData[1][0].rating}
                numRatings={swapData[1][0].numRatings}
                finalColJsx = { 
                <>
                  <AccordionSummary aria-controls="panel1a-content" id="panel1a-header"  expandIcon={<ExpandMoreIcon />}></AccordionSummary>
                  <button title="Change users rating" data-bs-toggle="modal" data-bs-target="#RatingModal" className="base-btn-lightblue" onClick={(e) => {
                    setCurUser(swapData[1][0])
                  }}>{ratingList[swapData[0]] ? "Change rating": "Rate this user"}</button>
                </>
                }
              />
              <AccordionDetails>
                <ThemeProvider theme={fontTheme}>
                  <Typography>
                      Previous Swaps:
                  </Typography>
                  {swapData[1].map((specificSwap) => 
                    <FormatTypography time={specificSwap.requestTimestamp}></FormatTypography>
                  )}
                </ThemeProvider>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
        <RatingModal user={props.user} curUser={curUser} ratingList={ratingList} setRatingList={setRatingList} />
      </SwapListBlueprint>
  )
}

function FormatTypography(props) {
  const date= new Date(props.time)
  
  return (
    <Typography >
      <div className="typography-text-container">
        <span>{date.toLocaleTimeString()}</span>
        <span>{date.toLocaleDateString()}</span>
      </div>
    </Typography>
  )
}

function RatingModal(props) {
  const [rating, setRating] = useState(1)
  useEffect(() => {
    if (props.curUser == null) {return}
    const rating = props.ratingList[props.curUser.username]
    if (rating) {
      setRating(rating.rating)
    }
    else {
      setRating(1)
    }
  }, [props.curUser])

  return (
    <div class="modal fade" id="RatingModal" aria-hidden="true" aria-labelledby="exampleModalToggleLabel" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalToggleLabel">{props.ratingList[props.curUser.username] ? "Change rating": "Add new review"}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <FilterByRating rating={rating} onRatingChange={setRating} ratingText={false}></FilterByRating>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary"  data-bs-toggle="modal"  data-bs-dismiss="modal" onClick={(e) => {
              changeAvgRating(props.user.accountUid, props.curUser.accountUid, rating, props.curUser.username).then(() => {
                props.setRatingList((prevRatingList) => {
                  const curRating = prevRatingList[props.curUser.username]
                  if (curRating) {
                    curRating.rating = rating
                  }
                  else {
                    prevRatingList[props.curUser.username] = {rating: rating}
                  } 
                  return Object.assign({}, prevRatingList) 
                })
              })
            }}>Confirm rating and close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SwapListPast;