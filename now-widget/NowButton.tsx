import React, { useEffect, useState } from "react";
import { HiArrowRight } from "react-icons/hi2";

interface NowButtonProps {
  updated?: boolean;
  onClick?: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

const NowButton: React.FC<NowButtonProps> = ({
  updated = false,
  onClick,
  size = 100,
  color = "#333",
  backgroundColor = "transparent",
}) => {
  const [supportsTrig, setSupportsTrig] = useState(false);

  useEffect(() => {
    setSupportsTrig(CSS.supports("(top: calc(sin(1) * 1px))"));
  }, []);

  const text = "NOW . NOW . NOW .";
  const chars = text.split("");
  const totalChars = chars.length;

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const svgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    position: "relative",
    top: 0,
    left: 0,
    fill: "currentColor",
  };

  const textRingStyle: React.CSSProperties = {
    "--total": totalChars,
    "--character-width": 1,
    "--inner-angle": `calc((360 / var(--total)) * 1deg)`,
    "--radius": supportsTrig
      ? `calc((var(--character-width, 1) / sin(var(--inner-angle))) * -1.4ch)`
      : "-4ch",
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    animation: "spin 15s infinite linear",
  } as React.CSSProperties;

  const charStyle = (index: number): React.CSSProperties =>
    ({
      "--index": index,
      position: "absolute",
      top: "50%",
      left: "50%",
      fontSize: "1.1rem",
      fontWeight: "normal",
      color: color,
      transform: `
      translate(-50%, -50%)
      rotate(calc(var(--inner-angle) * var(--index)))
      translateY(var(--radius, -4ch))
    `,
    }) as React.CSSProperties;

  return (
    <div style={containerStyle}>
      <button
        style={{
          position: "relative",
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          backgroundColor: backgroundColor,
          border: "none",
          cursor: "pointer",
          overflow: "visible",
        }}
        onClick={onClick}
      >
        <div className="absolute left-0 top-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            style={svgStyle}
          >
            <circle cx="49.97" cy="10.646" r="2.5" />
            <path d="M25,16.265c-1.11,0.82-1.36,2.38-0.55,3.5c0.489,0.67,1.25,1.03,2.029,1.03c0.511,0,1.021-0.16,1.471-0.48  c1.109-0.82,1.359-2.38,0.54-3.5C27.68,15.706,26.12,15.456,25,16.265z" />
            <path d="M62.33,15.085c1.05,0,2.04-0.67,2.38-1.73c0.43-1.32-0.3-2.73-1.61-3.15c-1.31-0.43-2.72,0.29-3.149,1.61  c-0.42,1.31,0.3,2.72,1.609,3.15C61.81,15.045,62.069,15.085,62.33,15.085z" />
            <path d="M37.609,15.095c0.261,0,0.521-0.04,0.78-0.12c1.311-0.43,2.03-1.84,1.601-3.15c-0.431-1.31-1.841-2.03-3.15-1.6  c-1.31,0.42-2.03,1.83-1.6,3.15C35.58,14.425,36.56,15.095,37.609,15.095z" />
            <path d="M16.16,29.155c0.439,0.33,0.96,0.48,1.47,0.48c0.77,0,1.53-0.35,2.02-1.02c0.82-1.12,0.57-2.69-0.55-3.5  s-2.68-0.56-3.49,0.55C14.8,26.785,15.04,28.345,16.16,29.155z" />
            <path d="M12.72,35.905c-1.31-0.42-2.72,0.29-3.15,1.61c-0.43,1.31,0.29,2.72,1.601,3.15c0.26,0.08,0.52,0.12,0.78,0.12  c1.05,0,2.029-0.67,2.38-1.73h-0.011C14.75,37.745,14.03,36.335,12.72,35.905z" />
            <path d="M74.95,16.235c-1.12-0.81-2.681-0.56-3.49,0.55c-0.811,1.12-0.57,2.68,0.55,3.5v-0.01c0.44,0.33,0.96,0.48,1.47,0.48  c0.771,0,1.53-0.36,2.021-1.03C76.31,18.605,76.06,17.045,74.95,16.235z" />
            <path d="M88.03,40.725c0.26,0,0.52-0.04,0.779-0.12c1.311-0.43,2.03-1.84,1.601-3.16c-0.431-1.31-1.841-2.03-3.15-1.6  c-1.31,0.43-2.03,1.84-1.6,3.15C86,40.055,86.979,40.725,88.03,40.725z" />
            <path d="M80.859,25.075c-1.119,0.81-1.359,2.38-0.55,3.49c0.49,0.67,1.25,1.03,2.03,1.03c0.51,0,1.02-0.16,1.47-0.48  c1.11-0.81,1.36-2.38,0.54-3.49c0-0.01,0-0.01,0-0.01C83.54,24.505,81.979,24.265,80.859,25.075z" />
            <path d="M92.5,50.646c0-0.66-0.271-1.3-0.73-1.77c-0.93-0.93-2.609-0.93-3.54,0c-0.46,0.47-0.729,1.11-0.729,1.77  c0,0.66,0.27,1.3,0.729,1.77c0.471,0.46,1.11,0.73,1.771,0.73s1.3-0.27,1.77-0.73C92.229,51.945,92.5,51.305,92.5,50.646z" />
            <path d="M72.05,80.975c-1.11,0.82-1.36,2.38-0.55,3.5c0.49,0.67,1.25,1.02,2.03,1.02c0.51,0,1.02-0.15,1.47-0.47  c1.109-0.82,1.359-2.38,0.55-3.5C74.729,80.416,73.17,80.166,72.05,80.975z" />
            <path d="M90.43,63.775c0.43-1.31-0.29-2.72-1.61-3.14c-1.31-0.43-2.72,0.29-3.14,1.6c-0.43,1.31,0.29,2.72,1.601,3.15  c0.26,0.08,0.52,0.12,0.77,0.12C89.109,65.505,90.09,64.835,90.43,63.775z" />
            <path d="M19.14,76.215c1.11-0.81,1.36-2.38,0.54-3.49c-0.81-1.12-2.37-1.36-3.49-0.55c-1.12,0.82-1.359,2.38-0.54,3.49  c0,0.01,0,0.01,0,0.01c0.48,0.67,1.25,1.02,2.021,1.02C18.18,76.695,18.689,76.545,19.14,76.215z" />
            <path d="M62.39,91.195c0.25,0,0.51-0.04,0.771-0.13c1.31-0.42,2.029-1.83,1.6-3.15c-0.42-1.31-1.84-2.03-3.15-1.6  c-1.31,0.42-2.029,1.84-1.6,3.15C60.35,90.525,61.33,91.195,62.39,91.195z" />
            <path d="M80.899,76.175c0.44,0.32,0.96,0.48,1.471,0.48c0.77,0,1.529-0.36,2.02-1.03c0.811-1.12,0.561-2.68-0.55-3.5  c-1.12-0.81-2.68-0.56-3.49,0.56C79.53,73.795,79.78,75.365,80.899,76.175z" />
            <path d="M11.96,65.565c0.26,0,0.52-0.04,0.78-0.12c1.31-0.43,2.029-1.84,1.6-3.15v-0.01c-0.43-1.31-1.84-2.02-3.15-1.6  c-1.31,0.43-2.029,1.84-1.6,3.16C9.93,64.896,10.91,65.565,11.96,65.565z" />
            <path d="M24.5,81.565c-0.811,1.12-0.57,2.68,0.55,3.49c0.44,0.32,0.96,0.48,1.47,0.48c0.771,0,1.53-0.36,2.021-1.04  c0.81-1.11,0.56-2.68-0.55-3.49C26.87,80.195,25.31,80.445,24.5,81.565z" />
            <path d="M36.899,91.085c0.25,0.08,0.511,0.12,0.771,0.12c1.06,0,2.03-0.67,2.38-1.73c0.42-1.31-0.3-2.72-1.61-3.15  c-1.319-0.42-2.729,0.3-3.149,1.61C34.859,89.255,35.58,90.666,36.899,91.085z" />
            <circle cx="50.03" cy="90.646" r="2.5" />
            <path d="M7.5,50.646c0,0.66,0.27,1.3,0.729,1.77c0.471,0.46,1.11,0.73,1.771,0.73s1.3-0.27,1.77-0.73c0.46-0.47,0.73-1.11,0.73-1.77  c0-0.66-0.271-1.3-0.73-1.77c-0.93-0.93-2.6-0.93-3.54,0C7.77,49.345,7.5,49.985,7.5,50.646z" />
          </svg>
          <span style={textRingStyle}>
            {chars.map((char, index) => (
              <span key={index} style={charStyle(index)}>
                {index === 4 && updated ? "NEW" : char}
              </span>
            ))}
          </span>
          <HiArrowRight
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: `${size * 0.3}px`,
              height: `${size * 0.3}px`,
              fill: color,
            }}
            fill={color}
          />
        </div>
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </button>
    </div>
  );
};

export default NowButton;
