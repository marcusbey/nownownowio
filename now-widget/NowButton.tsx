import React, { useEffect, useState } from "react";
import { HiArrowRight } from "react-icons/hi2";

interface NowButtonProps {
  updated?: boolean;
  onClick?: () => void;
  size?: number;
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

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
    animation: `spin ${isHovered ? "60s" : "15s"} linear infinite`,
    transition: "animation-duration 2s ease-in-out",
  } as React.CSSProperties;

  const charStyle = (index: number): React.CSSProperties =>
    ({
      "--index": index,
      position: "absolute",
      top: "50%",
      left: "50%",
      fontSize: "1.1rem",
      fontWeight: "normal",
      color: "#333", // Dark gray color
      transform: `
      translate(-50%, -50%)
      rotate(calc(var(--inner-angle) * var(--index)))
      translateY(var(--radius, -4ch))
    `,
    }) as React.CSSProperties;

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
        className="now-relative now-cursor-pointer now-overflow-hidden"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: "transparent",
          border: "none",
          padding: 0,
          outline: "none", // Remove focus outline
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
              fill: "#333", // Changed to dark gray to match the text
            }}
          />
        </div>
      </button>
    </div>
  );
};

export default NowButton;
