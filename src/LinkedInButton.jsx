import React from 'react';
import styled from 'styled-components';

const LinkedInButton = () => {
  const handleClick = () => {
    window.open(
      'https://www.linkedin.com/in/greyston-bellino-512724162/',
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <StyledWrapper>
      <button className="Btn" type="button" onClick={handleClick} aria-label="LinkedIn">
        <span className="svgContainer">
          <svg viewBox="0 0 448 512" fill="white" aria-hidden>
            <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
          </svg>
        </span>
        <span className="BG" />
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .Btn {
    width: clamp(38px, 5vw, 45px);
    height: clamp(38px, 5vw, 45px);
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background-color: transparent;
    position: relative;
    /* overflow: hidden; */
    border-radius: 7px;
    cursor: pointer;
    transition: all .3s;
    margin-left: clamp(0.45rem, 1.4vw, 0.8rem);
  }

  .svgContainer {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    backdrop-filter: blur(0px);
    letter-spacing: 0.8px;
    border-radius: 10px;
    transition: all .3s;
    border: 1px solid rgba(156, 156, 156, 0.466);
  }

  .svgContainer svg {
    height: clamp(1.25em, 2.1vw, 1.6em);
    width: auto;
  }

  @media (max-width: 640px) {
    .Btn {
      width: clamp(30px, 8vw, 36px);
      height: clamp(30px, 8vw, 36px);
    }

    .svgContainer svg {
      height: clamp(0.92em, 3.8vw, 1.08em);
    }
  }

  .BG {
    position: absolute;
    content: "";
    width: 100%;
    height: 100%;
    background: #181818;
    z-index: -1;
    border-radius: 10px;
    pointer-events: none;
    transition: all .3s;
  }

  .Btn:hover .BG {
    transform: rotate(35deg);
    transform-origin: bottom;
  }

  .Btn:hover .svgContainer {
    background-color: rgba(156, 156, 156, 0.466);
    backdrop-filter: blur(4px);
  }
`;

export default LinkedInButton;
