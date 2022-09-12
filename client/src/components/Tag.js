import React from 'react';
import "./styles/Tag.css"

function Tag(props) {
  return (
    <div className="tag">
      {props.cuisine}
    </div>
  )
}

export default Tag