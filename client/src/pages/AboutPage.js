import React from "react";
import Typewriter from "../components/Homepage/Typewriter";
import "./styles/AboutPage.scss";

/**
 * Page at "/"
 */
function AboutPage() {
  return (
    <div className="AboutPage">
      <main className="intro-desc">
        <h1 className="about-header">
          <Typewriter arr={["Connect", "Meet", "Cook", "Eat"]} />
          with aspiring <br></br> chefs of any level.
        </h1>
      </main>
    </div>
  )
}

export default AboutPage