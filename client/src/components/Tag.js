import React from 'react';
import "./Tag.css"

function Tag(props) {
  return (
    <div className="tag">
        {props.cuisine}
    </div>
  )
}

export default Tag