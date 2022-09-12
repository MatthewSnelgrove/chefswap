import React from 'react';
import FilterForm from '../components/FilterForm';
import Navbar from "../components/Navbar";
import SwapResultsContainer from "../components/SwapResultsContainer";
import "./FindSwapPage.scss";

function FindSwapPage() {
  return (
    <div className="find-swap-page">
      <Navbar />
      <div className="find-swap-content">
        <FilterForm />
        <SwapResultsContainer />
      </div>
    </div>
  )
}

export default FindSwapPage