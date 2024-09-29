import React, { useEffect, useState } from "react";
import { HiArrowRight } from "react-icons/hi2";

interface NowButtonProps {
  updated?: boolean;
  onClick?: () => void;
  size?: number;
}

/* Extend CSSProperties to include custom CSS variables */
interface ExtendedCSSProperties extends React.CSSProperties {
  [key: string]: string | number;
}

const NowButton: React.FC<NowButtonProps> = ({
  updated = false,
  onClick,
  size = 100,
}) => {
  const [supportsTrig, setSupportsTrig] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setSupportsTrig(CSS.supports("(top: calc(sin(1) * 1px))"));
  }, []);

  const text = "NOW.NOW.NOW.NOW.NOW.NOW.";
  const chars = text.split("");
  const totalChars = chars.length;

  const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "none",
    border: "none",
    background: "transparent",
  };

  const textRingStyle: ExtendedCSSProperties = {
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
    animation: `spin ${isHovered ? "60s" : "15s"} linear infinite`,
    transition: "animation-duration 2s ease-in-out",
  };

  const charStyle = (index: number): ExtendedCSSProperties => ({
    "--index": index,
    position: "absolute",
    top: "50%",
    left: "50%",
    fontSize: "1.1rem",
    fontWeight: "bold",
    background: "linear-gradient(45deg, #FF0000, #FF4500)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    color: "transparent",
    transform: `
      translate(-50%, -50%)
      rotate(calc(var(--inner-angle) * var(--index)))
      translateY(var(--radius, -4ch))
    `,
  });

  const contentStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <div style={containerStyle}>
      <button
        id="now-widget-button"
        className="now-widget-relative now-widget-cursor-pointer now-widget-overflow-hidden"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: "transparent",
          border: "none",
          padding: 0,
          outline: "none",
          boxShadow: "none",
        }}
      >
        <div style={contentStyle}>
          <span style={textRingStyle} className="text-ring">
            {chars.map((char, index) => (
              <span key={index} style={charStyle(index)}>
                {char}
              </span>
            ))}
          </span>
          <HiArrowRight
            style={{
              position: "absolute",
              width: `${size * 0.3}px`,
              height: `${size * 0.3}px`,
              fill: "#FF0000", // Red color for the arrow
            }}
          />
        </div>
      </button>
    </div>
  );
};

export default NowButton;
