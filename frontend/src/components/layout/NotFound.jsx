import { useState, useEffect, useRef } from "react";

const bricks = [
  { id: 1, x: 5, y: 8, rotation: -15, color: "#FFD600", size: 1.2 },
  { id: 2, x: 88, y: 5, rotation: 25, color: "#222", size: 0.9 },
  { id: 3, x: 15, y: 75, rotation: 40, color: "#FFD600", size: 1 },
  { id: 4, x: 85, y: 70, rotation: -30, color: "#222", size: 1.1 },
  { id: 5, x: 3, y: 40, rotation: 10, color: "#FFD600", size: 0.8 },
  { id: 6, x: 5, y: 55, rotation: -45, color: "#222", size: 0.7 },
  { id: 7, x: 92, y: 45, rotation: 35, color: "#FFD600", size: 0.9 },
  { id: 8, x: 70, y: 82, rotation: -20, color: "#222", size: 1 },
  { id: 9, x: 25, y: 88, rotation: 50, color: "#FFD600", size: 0.8 },
];

const quips = [
  "Looks like this page stepped on itself",
  "Even minifigs have bad days",
  "404: Page disassembled itself in protest",
  "This page snapped... right off the board",
  "We looked everywhere. Even under the couch",
  "Still clicking? Bold move, human",
  "The minifig is NOT okay. Stop pressing it",
  "404: Patience also not found",
];

let steamId = 0;

function SteamPuff({ x, y, id, onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(id), 1200);
    return () => clearTimeout(t);
  }, [id, onDone]);

  const size = 20 + Math.random() * 28;
  const dx = (Math.random() - 0.5) * 90;
  const dy = -(50 + Math.random() * 70);

  return (
    <div
      className="steam-puff"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        "--dx": `${dx}px`,
        "--dy": `${dy}px`,
      }}
    />
  );
}

function FloatingBrick({ x, y, rotation, color, size, delay }) {
  return (
    <div
      className="floating-brick"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotation}deg) scale(${size})`,
        animationDuration: `${3 + delay}s`,
        animationDelay: `${delay * 0.5}s`,
      }}
    >
      <svg width="48" height="28" viewBox="0 0 48 28">
        <rect x="0" y="8" width="48" height="20" rx="3" fill={color} />
        <rect x="4" y="0" width="14" height="10" rx="3" fill={color} />
        <rect x="30" y="0" width="14" height="10" rx="3" fill={color} />
        <rect
          x="0"
          y="8"
          width="48"
          height="3"
          rx="1"
          fill={color === "#FFD600" ? "#e6c000" : "#111"}
          opacity="0.4"
        />
      </svg>
    </div>
  );
}

const getAngerStatus = (level) => {
  if (level >= 6) return "raging";
  if (level >= 3) return "very-angry";
  if (level > 0) return "angry";
  return "normal";
};

function RobotFace({ angerLevel }) {
  const [blink, setBlink] = useState(false);
  const angerStatus = getAngerStatus(angerLevel);

  useEffect(() => {
    if (angerStatus === "raging") return;
    const iv = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 2500);
    return () => clearInterval(iv);
  }, [angerStatus]);

  const browSlant =
    angerStatus === "raging"
      ? 15
      : angerStatus === "very-angry"
        ? 10
        : angerStatus === "angry"
          ? 5
          : 0;

  return (
    <div className="robot-head-container">
      <div className="robot-head" data-anger={angerStatus}>
        {/* Studs */}
        {[25, 65, 105].map((lx, i) => (
          <div key={i} className="robot-stud" style={{ left: lx }} />
        ))}

        {/* Angry eyebrows */}
        {angerLevel > 0 && (
          <div className="robot-brows">
            <div
              className="robot-brow"
              style={{
                transform: `rotate(${browSlant}deg)`,
                transformOrigin: "right center",
              }}
            />
            <div
              className="robot-brow"
              style={{
                transform: `rotate(-${browSlant}deg)`,
                transformOrigin: "left center",
              }}
            />
          </div>
        )}

        {/* Eyes */}
        <div
          className="robot-eyes-container"
          style={{ paddingTop: angerLevel > 0 ? 38 : 32 }}
        >
          {[0, 1].map((i) => (
            <div
              key={i}
              className="robot-eye"
              style={{
                height: angerStatus === "raging" ? 8 : blink ? 3 : 28,
                borderRadius: angerStatus === "raging" || blink ? 2 : 6,
              }}
            >
              {!blink && angerStatus === "normal" && (
                <div className="robot-eye-pupil" />
              )}
              {!blink && angerStatus !== "normal" && (
                <div className="robot-eye-pupil-angry" />
              )}
            </div>
          ))}
        </div>

        {/* Mouth */}
        <div
          className="robot-mouth"
          data-anger={angerLevel > 0 ? angerStatus : undefined}
        >
          <div className="robot-tongue" />
          {angerStatus === "very-angry" && (
            <div className="robot-teeth-container">
              {[0, 1, 2, 3].map((t) => (
                <div key={t} className="robot-tooth" />
              ))}
            </div>
          )}
        </div>

        {/* Speech bubble */}
        <div className="robot-speech-bubble">
          {angerStatus === "raging"
            ? "💢"
            : angerStatus === "very-angry"
              ? "😤"
              : angerStatus === "angry"
                ? "😠"
                : "??"}
        </div>
      </div>
    </div>
  );
}

export default function NotFound() {
  const [quipIndex, setQuipIndex] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [steamPuffs, setSteamPuffs] = useState([]);
  const robotRef = useRef(null);
  const sceneRef = useRef(null);

  const angerStatus = getAngerStatus(clickCount);

  const removePuff = (id) => setSteamPuffs((p) => p.filter((s) => s.id !== id));

  const handleBtnClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    setShaking(true);
    setQuipIndex((prev) => (prev + 1) % quips.length);
    setTimeout(() => setShaking(false), 600);

    const robotRect = robotRef.current?.getBoundingClientRect();
    const sceneRect = sceneRef.current?.getBoundingClientRect();
    const cx =
      robotRect && sceneRect
        ? robotRect.left - sceneRect.left + robotRect.width / 2
        : 300;
    const cy = robotRect && sceneRect ? robotRect.top - sceneRect.top : 200;

    const count = newCount >= 6 ? 7 : newCount >= 3 ? 5 : 3;
    const puffs = Array.from({ length: count }, () => ({
      id: ++steamId,
      x: cx + (Math.random() - 0.5) * 70,
      y: cy + 10,
    }));
    setSteamPuffs((p) => [...p, ...puffs]);
  };

  return (
    <div ref={sceneRef} className="not-found-scene" data-anger={angerStatus}>
      {angerStatus === "raging" && <div className="rage-overlay" />}

      {/* Lightning */}
      {[
        { pos: "top:15%;left:60%" },
        { pos: "top:25%;left:72%" },
        { pos: "top:20%;left:40%" },
      ].map(({ pos }, i) => {
        const styleObj = Object.fromEntries(
          pos.split(";").map((s) => s.split(":")),
        );
        return (
          <div
            key={i}
            className="lightning-bolt"
            style={{
              ...styleObj,
              animationDuration: `${angerStatus === "raging" ? 0.5 + i * 0.15 : 1.5 + i * 0.7}s`,
              animationDelay: `${i * 0.35}s`,
            }}
          />
        );
      })}

      {/* Background bricks */}
      {bricks.map((b, i) => (
        <FloatingBrick key={b.id} {...b} delay={i * 0.5} />
      ))}

      {/* Steam puffs */}
      <div className="steam-puffs-container">
        {steamPuffs.map((p) => (
          <SteamPuff key={p.id} {...p} onDone={removePuff} />
        ))}
      </div>

      {/* Main content */}
      <div
        className="not-found-content"
        style={{ animation: shaking ? "shake 0.6s ease" : "none" }}
      >
        <div className="not-found-404" data-anger={angerStatus}>
          404
        </div>

        <div ref={robotRef} className="robot-wrapper">
          <RobotFace angerLevel={clickCount} />
        </div>

        <h1 className="not-found-title" data-anger={angerStatus}>
          {angerStatus === "raging"
            ? "🔥 THE MINIFIG HAS HAD ENOUGH 🔥"
            : "Uh-Oh! This Build Fell Apart"}
        </h1>

        <p key={quipIndex} className="not-found-quip" data-anger={angerStatus}>
          {quips[quipIndex]}
        </p>

        <p className="not-found-desc">
          {angerStatus === "raging"
            ? "Seriously. Stop clicking. The minifig is overheating🌡️"
            : "The page you're looking for snapped right off the board. Even the best builders misplace a piece sometimes"}
        </p>

        <div className="not-found-btns">
          <a href="/" style={{ textDecoration: "none" }}>
            <button className="home-btn">🏠 Back to Home</button>
          </a>
          <button
            className="quip-btn"
            data-anger={angerStatus}
            onClick={handleBtnClick}
          >
            {angerStatus === "raging"
              ? "💢 STOP CLICKING!"
              : "🎲 Another Excuse"}{" "}
            {clickCount > 0 ? `(${clickCount})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
