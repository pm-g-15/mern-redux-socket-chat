import React, { useState } from "react";
import { useSpring, animated, config } from "react-spring";

import "./PortfolioLink.scss";

const PortfolioLink = () => {
  const [displayLink, setDisplayLink] = useState(true);

  const toggleDisplay = () => {
    setDisplayLink(!displayLink);
  };

  const reverseAnimationProps = useSpring({
    top: "6rem",
    position: "absolute",
    zIndex: "4",
    right: displayLink ? -300 : 0,
    opacity: displayLink ? 0 : 1,
    config: config.wobbly,
  });

  return (
    <>
      <animated.div style={reverseAnimationProps}>
        <div className="app-openportfoliolink" onClick={toggleDisplay}>
          open portfolio link
        </div>
      </animated.div>
    </>
  );
};

export default PortfolioLink;
