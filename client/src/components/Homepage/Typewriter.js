import React, { useState, useEffect } from "react";
import "./styles/Typewriter.scss";

function Typewriter2({ arr }) {
  const [word, setWord] = useState("");
  const [backspacing, setBackspacing] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let timeout;
    // Backspace
    if (backspacing) {
      timeout = setTimeout(() => {
        if (word === "") {
          if (index === arr.length - 1) setIndex(0);
          else setIndex(idx => idx + 1);
          setBackspacing(false);
        }
        else {
          setWord(word => { return word.slice(0, -1) });
        }
      }, 90);
    }
    // Write
    else if (word.length !== arr[index].length) {
      timeout = setTimeout(() => {
        setWord(word => { return word + arr[index][word.length] });
      }, 130);
    }
    // Complete
    else {
      timeout = setTimeout(() => {
        setBackspacing(true);
      }, 2000);
    }

    return () => clearTimeout(timeout);
  });

  return (
    <span className="Typewriter">{word}</span>
  )
}

export default Typewriter2