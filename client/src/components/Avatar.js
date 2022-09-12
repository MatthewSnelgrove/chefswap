import React, { Component } from 'react';
import PropTypes from 'prop-types';
import "./styles/Avatar.scss";

/**
 * Takes in user data to display user profile picture
 * @param pfpURL URL to profile picture
 * @param size Width and height size in px
 */
export default class Avatar extends Component {
  render() {
    const pfpURL = this.props.avatarURL;
    const size = this.props.size;
    const style = {
      width: `${size}px`,
      height: `${size}px`,
      objectFit: "cover",
    };

    return (
      <div className="avatar-container">
        <img src={pfpURL} alt="Avatar" className="avatar" style={style} />
      </div>
    )
  }
}

Avatar.propTypes = {
  avatarURL: PropTypes.string,
  size: PropTypes.number,
};

Avatar.defaultProps = {
  avatarURL: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
  size: 30,
};
