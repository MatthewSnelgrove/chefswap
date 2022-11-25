import React, { useEffect, useState } from "react";
import Typewriter from "../components/Homepage/Typewriter";
import StyledBtn from "../components/Homepage/StyledBtn";
import AnimatedImg from "../components/Homepage/AnimatedImg";
import "./styles/AboutPage.scss";

/**
 * Page at "/"
 */
function AboutPage() {
  const [section, setSection] = useState(1);

  const animationTimes = {
    pan: 0.2,
    onions: 0.55,
    potato: 0.58,
    carrot: 0.61,
    broccoli: 0.64,
  };

  function handleScrollY() {
    console.log(`Section = ${section}`);    // test
    // Animate intro section (1)
    if (window.scrollY < window.innerHeight / 2) {
      if (section !== 1) {
        setSection(1);
        return 1;
      }
    }
    // Animate demo section (2)
    else if (window.scrollY < window.innerHeight * 3 / 2) {
      if (section !== 2) {
        setSection(2);
        return 2;
      }
    }
  }

  useEffect(() => {
    window.onscroll = handleScrollY;

    if (section === 1) {
      animateSection(1, 10);
    }

    if (section === 2) {
      animateSection(1, -10);
    }

    return () => {
      window.onscroll = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // Animate section num in or out of frame
  function animateSection(num, up = 0) {
    let imgs = document.querySelectorAll(`.section${num}`);
    imgs.forEach(img => {
      img.style.bottom = `${parseInt(img.style.bottom) + up}%`;
      img.style.opacity = (up >= 0) ? 1 : 0;
    });
  }

  return (
    <>
      <div className="AboutPage">
        <main className="intro-main">
          <h1 className="about-header">
            <Typewriter arr={["Connect", "Meet", "Cook", "Eat"]} />
            with talented <br></br> chefs of every level.
          </h1>
          <div className="about-blurb">
            Chefswap helps users across Canada connect with each other through a love for cooking and eating!
          </div>
          <StyledBtn arrowed text="START SWAPPING" link="/signup" />
        </main>

        <div className="graphic" style={{
          position: "relative",
          flex: "1",
          paddingTop: "10%",
        }}>
          <AnimatedImg
            REF
            src={process.env.PUBLIC_URL + "/pan-graphic.png"}
            alt="Frying pan tossing ingredients"
            size={80}
            rotate={-5}
            delay={animationTimes.pan}
            section={1}>
            <AnimatedImg
              src={process.env.PUBLIC_URL + "/broccoli.png"}
              alt="Broccoli"
              position={[50, 85]}
              size={15}
              delay={animationTimes.broccoli}
              section={1} />
            <AnimatedImg
              src={process.env.PUBLIC_URL + "/carrot.png"}
              alt="Carrot"
              position={[37, 130]}
              size={20}
              rotate={20}
              delay={animationTimes.carrot}
              section={1} />
            <AnimatedImg
              src={process.env.PUBLIC_URL + "/onions.png"}
              alt="Onions"
              position={[5, 100]}
              size={25}
              rotate={-20}
              delay={animationTimes.onions}
              section={1} />
            <AnimatedImg
              src={process.env.PUBLIC_URL + "/potato.png"}
              alt="Potato"
              position={[22, 43]}
              size={18}
              rotate={130}
              delay={animationTimes.potato}
              section={1} />
          </AnimatedImg>
        </div>

        <div className="github-msg">
          Made with ❤️ on&nbsp;
          <a
            href="https://github.com/MatthewSnelgrove/chefswap"
            target="_blank"
            rel="noreferrer">
            GitHub!
          </a>
        </div>
      </div>

      <div className="product-demo-section">

      </div>
    </>
  )
}

export default AboutPage;
