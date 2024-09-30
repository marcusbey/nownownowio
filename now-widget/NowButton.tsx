import React, { useEffect, useRef, useState } from "react";
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
  const [isNear, setIsNear] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSupportsTrig(CSS.supports("(top: calc(sin(1) * 1px))"));
  }, []);

  const nowText = updated
    ? "NOW.NEW.NOW.NEW.NOW.NEW."
    : "NOW.NOW.NOW.NOW.NOW.NOW.";

  const chars = nowText.split("");
  const totalChars = chars.length;
  const [textRingSpeed, setTextRingSpeed] = useState(60);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const buttonCenterX = rect.left + rect.width / 2;
        const buttonCenterY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(e.clientX - buttonCenterX, 2) +
            Math.pow(e.clientY - buttonCenterY, 2),
        );
        const proximityThreshold = 200; // Adjust this value to change the proximity sensitivity
        setIsNear(distance < proximityThreshold);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      if (isNear || isHovered) {
        setTextRingSpeed((prevSpeed) => {
          const targetSpeed = isHovered ? 5 : 30;
          const newSpeed = prevSpeed + (targetSpeed - prevSpeed) * 0.1;
          return Math.abs(newSpeed - targetSpeed) < 0.1
            ? targetSpeed
            : newSpeed;
        });
      } else {
        setTextRingSpeed((prevSpeed) => {
          const newSpeed = prevSpeed + (60 - prevSpeed) * 0.1;
          return Math.abs(newSpeed - 60) < 0.1 ? 60 : newSpeed;
        });
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isNear, isHovered]);

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
    animation: `spin ${textRingSpeed}s linear infinite`,
    transition: "animation-duration 0.3s ease-in-out",
  } as React.CSSProperties;

  const charStyle = (index: number): React.CSSProperties =>
    ({
      "--index": index,
      position: "absolute",
      top: "50%",
      left: "50%",
      fontSize: "1.1rem",
      fontWeight: "bold",
      background: `linear-gradient(45deg, ${color}, #FF4500)`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      color: "transparent",
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
        ref={buttonRef}
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
              <span key={index} style={charStyle(index)} className="now-text">
                {char}
              </span>
            ))}
          </span>
          <HiArrowRight
            style={{
              position: "absolute",
              width: `${size * 0.3}px`,
              height: `${size * 0.3}px`,
              fill: color,
            }}
          />
        </div>
      </button>
    </div>
  );
};

export default NowButton;
