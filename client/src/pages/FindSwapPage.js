import React, { Component } from 'react';
import FilterForm from '../components/FilterForm';
import Navbar from "../components/Navbar";
import SwapResultsContainer from "../components/SwapResultsContainer";
import "./styles/FindSwapPage.scss";

/**
 * /find-swaps page
 * @use Navbar, FilterForm, SwapsResultsContainer
 */
export default class FindSwapPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cuisineTyped: "",
      cuisineChecked: [],
      rating: 1,
      distance: 100,
    };

    this.handleTypedChange = this.handleTypedChange.bind(this);
    this.handleTickedChange = this.handleTickedChange.bind(this);
    this.handleRatingChange = this.handleRatingChange.bind(this);
    this.handleDistanceChange = this.handleDistanceChange.bind(this);
  }

  handleTypedChange(cuisineText) {
    this.setState({
      cuisineTyped: cuisineText,
    });
  }

  handleTickedChange(cuisineName, cuisineCheckedBool) {
    this.setState((state) => {
      // If cuisine is newly checked
      if (cuisineCheckedBool) {
        let newCuisineCheckedList = state.cuisineChecked.slice();
        newCuisineCheckedList.push(cuisineName);
        return {
          cuisineChecked: newCuisineCheckedList,
        };
      }

      // If cuisine is newly unchecked
      else {
        let newCuisineCheckedList = state.cuisineChecked.filter(cuisine => cuisine !== cuisineName);
        return {
          cuisineChecked: newCuisineCheckedList,
        }
      }
    });
  }

  handleRatingChange(minRating) {
    console.log("min rating state changed");
    this.setState({
      rating: minRating,
    });
  }

  handleDistanceChange(maxDist) {
    this.setState({
      distance: maxDist,
    });
  }

  render() {
    return (
      <div className="find-swap-page">
        <Navbar />
        <div className="find-swap-content">
          <FilterForm cuisineTyped={this.state.cuisineTyped} cuisineChecked={this.state.cuisineChecked}
            rating={this.state.rating} distance={this.state.distance}
            onTypedChange={this.handleTypedChange} onTickedChange={this.handleTickedChange}
            onRatingChange={this.handleRatingChange} onDistanceChange={this.handleDistanceChange} />
          <SwapResultsContainer cuisineChecked={this.state.cuisineChecked} rating={this.state.rating}
            distance={this.state.distance} />
        </div>
      </div>
    )
  }
}
