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
  color = "red",
  backgroundColor = "transparent",
}) => {
  const [supportsTrig, setSupportsTrig] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setSupportsTrig(CSS.supports("(top: calc(sin(1) * 1px))"));
  }, []);

  const nowText = updated
    ? "NEW.NEW.NEW.NEW.NEW.NEW."
    : "NOW.NOW.NOW.NOW.NOW.NOW.";

  const chars = nowText.split("");
  const totalChars = chars.length;

  const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "none",
    border: "none",
    background: backgroundColor,
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
  };

  const charStyle = (index: number): React.CSSProperties => ({
    "--index": index,
    position: "absolute",
    top: "50%",
    left: "50%",
    fontSize: "1.1rem",
    fontWeight: "bold",
    background: `linear-gradient(45deg, ${color}, #FF4500)`,
    WebkitBackgroundClip: "nowText",
    WebkitTextFillColor: "transparent",
    backgroundClip: "nowText",
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
          background: backgroundColor,
          border: "none",
          padding: 0,
          outline: "none",
          boxShadow: "none",
          position: "relative",
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
              fill: color, // Use the passed color prop
            }}
          />
        </div>
      </button>
    </div>
  );
};

export default NowButton;
