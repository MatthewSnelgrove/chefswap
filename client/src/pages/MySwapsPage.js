import React from 'react';
import Navbar from "../components/Navbar";
import SwapList from "../components/SwapList";
import MySwapSwitch from '../components/MySwapSwitch';

function MySwapsPage() {
  const people = [
  ]

  people[0] = {
    date: "10/10/2020",
    img: "covid-victor.jpg",
    username: "bigsucc69ioijndiqwndiqwondiqwndoqwidnoqwindoqwidnqowidnqwoidnoid",
    distance: "4km",
    id: 1
  }

  people[1] =  {
    date: "10/10/2021",
    img: "covid-victor.jpg",
    username: "iliketoes420",
    distance: "4km",
    id: 2
  }
  
  return (
    <div>
      <Navbar />
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <h1 className="px-5">Swaps</h1>
        <div className="px-5">
          <MySwapSwitch hl={"swaps"} />
        </div>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", justifyContent: "center"}}>
        <div>
          <SwapList data = {people} type={"Pending"} />
        </div>
        <div>
          <SwapList data = {people} type={"Ongoing"} />
        </div>
        <div>
          <SwapList data = {people} type={"Past"} />
        </div>
      </div>
      
    </div>
  )
}

export default MySwapsPage