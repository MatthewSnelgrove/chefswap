import React from "react";
import "./styles/AnimatedImg.scss";

/**
 * Image that animates up
 * @param {*} props
 * @param {String} src Image src
 * @param {String} alt Image alt text
 * @param {Number} size 0 < size < 100 (in %)
 * @param {Array} position Absolute position from reference image [<left>, <bottom>] (in %)
 * @param {Number} delay Animation delay in seconds
 * @param {Number} rotate Degrees rotated
 * @param {Number} section Section #
 */
function AnimatedImg({ REF, src, alt, size, position = [0, 0], delay = 0, rotate = 0, section, children }) {

  // If no position (position of image is reference)
  if (REF) {
    let style = {
      transitionDelay: `${delay}s`,
    };

    try {
      style.left = `${position[0]}%`;
      style.bottom = `${position[1]}%`;
    } catch (error) {
      console.log(error);

      style.left = 0;
      style.bottom = 0;
    }

    return (
      <div className="AnimatedImgContainer"
        style={{
          width: `${size}%`,
          transform: `rotate(${rotate}deg)`,
        }}>
        <img
          src={src}
          alt={alt}
          className={`AnimatedImg section${section}`}
          style={style} />

        {children}

      </div>
    );
  }

  // If position exists (position of image references another)
  else {
    let style = {
      width: `${size}%`,
      position: "absolute",
      transform: `rotate(${rotate}deg)`,
      transitionDelay: `${delay}s`,
    };

    try {
      style.left = `${position[0]}%`;
      style.bottom = `${position[1]}%`;
    } catch (error) {
      console.log(error);

      style.left = 0;
      style.bottom = 0;
    }

    return (
      <img
        src={src}
        alt={alt}
        className={`AnimatedImg section${section}`}
        style={style} />
    );
  }

}

export default AnimatedImg;