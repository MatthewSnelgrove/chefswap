import React, { useEffect } from "react";
import Typewriter from "../components/Homepage/Typewriter";
import StyledBtn from "../components/Homepage/StyledBtn";
import AnimatedImg from "../components/Homepage/AnimatedImg";
import "./styles/AboutPage.scss";

/**
 * Page at "/"
 */
function AboutPage() {

  function handleScrollY() {
    // Animate intro section
    if (window.scrollY < window.innerHeight / 2) {
      console.log("On first page");
    }

    // Animate demo section
    else if (window.scrollY < window.innerHeight * 3 / 2) {
      console.log("On second page");
    }
  }

  useEffect(() => {
    window.onscroll = handleScrollY;

    return () => {
      window.onscroll = null;
    };
  });

  return (
    <>
      <div className="AboutPage">
        <main className="intro-main">
          <h1 className="about-header">
            <Typewriter arr={["Connect", "Meet", "Cook", "Eat"]} />
            with aspiring <br></br> chefs of any level.
          </h1>
          <div className="about-blurb">
            Chefswap helps users across Canada connect with <br></br> each other — through cooking!
          </div>
          <StyledBtn arrowed text="START SWAPPING" link="/signup" />
        </main>

        <div className="graphic" style={{
          position: "relative",
          flex: "1",
          paddingTop: "10%",
        }}>
          <AnimatedImg
            src={process.env.PUBLIC_URL + "/pan-graphic.png"}
            alt="Frying pan tossing ingredients"
            size={80}
            rotate={-5}
            delay={0.5}>
            <AnimatedImg
              src={process.env.PUBLIC_URL + "/broccoli.png"}
              alt="Broccoli"
              position={[50, 95]}
              size={15}
              delay={0.55} />
            <AnimatedImg
              src={process.env.PUBLIC_URL + "/carrot.png"}
              alt="Carrot"
              position={[37, 140]}
              size={20}
              rotate={20}
              delay={0.55} />
            <AnimatedImg
              src={process.env.PUBLIC_URL + "/onions.png"}
              alt="Onions"
              position={[5, 110]}
              size={25}
              rotate={-20}
              delay={0.55} />
            <AnimatedImg
              src={process.env.PUBLIC_URL + "/potato.png"}
              alt="Potato"
              position={[22, 53]}
              size={18}
              rotate={130}
              delay={0.55} />
          </AnimatedImg>
        </div>

      </div>

      <div className="product-demo-section">

      </div>
    </>
  )
}

export default AboutPage