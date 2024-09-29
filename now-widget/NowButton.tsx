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
        className="now-relative now-w-100px now-h-100px now-rounded-full now-bg-transparent now-border-none now-cursor-pointer now-overflow-visible"
        onClick={onClick}
      >
        <div className="now-absolute now-left-0 now-top-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            style={svgStyle}
          >
            {/* SVG Paths */}
          </svg>
          <span style={textRingStyle}>
            {chars.map((char, index) => (
              <span key={index} style={charStyle(index)}>
                {index === 4 && updated ? "NEW" : char}
              </span>
            ))}
          </span>
          <HiArrowRight
            className="now-absolute now-top-1-2 now-left-1-2 now-transform now--translate-x-1-2 now--translate-y-1-2"
            style={{
              width: `${size * 0.3}px`,
              height: `${size * 0.3}px`,
              fill: color,
            }}
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
