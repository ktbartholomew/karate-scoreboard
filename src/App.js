import { useEffect, useRef, useState } from "react";
import "./App.css";

const LEFT = "left";
const RIGHT = "right";

const useTimer = ({ time = 0 }) => {
  const [remaining, setRemaining] = useState(time);
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    if (!running) {
      return;
    }

    const i = setInterval(() => {
      if (remaining === 0) {
        setRunning(false);
      }

      setRemaining(Math.max(0, remaining - (Date.now() - startTime)));
    }, 17);

    return () => {
      clearInterval(i);
    };
  }, [running]);

  return {
    remaining,
    running,
    start: () => {
      setRunning(true);
      setStartTime(Date.now());
    },
    stop: () => {
      setRunning(false);
    },
    reset: () => {
      setRunning(false);
      setRemaining(time);
    },
  };
};

const timeString = (milliseconds) => {
  return `${Math.floor(milliseconds / (1000 * 60))}:${(
    Math.floor(milliseconds / 1000) % 60
  )
    .toString()
    .padStart(2, "0")}.${(Math.floor(milliseconds / 100) % 10)
    .toString()
    .padStart(1, "0")}`;
};

function CountdownTimer({ timer, delay }) {
  return (
    <span
      style={{
        color: timer.remaining <= 15000 ? "hsl(0deg, 100%, 75%)" : "inherit",
        fontFamily: "monospace",
      }}
    >
      {timeString(timer.remaining)}
    </span>
  );
}

function useKeyboardEvents({
  c1Penalty,
  c2Penalty,
  setAdvantage,
  decrement,
  increment,
  resetTimer,
  toggleTimer,
  changeMatchTime,
}) {
  const [sequenceStart, setSequenceStart] = useState("");

  useEffect(() => {
    let sequenceTimeout;

    const clearSequence = () => {
      clearTimeout(sequenceTimeout);
      sequenceTimeout = setTimeout(() => {
        setSequenceStart("");
      }, 2000);
    };

    /**
     *
     * @param {KeyboardEvent} e
     * @returns
     */
    const listener = (e) => {
      switch (e.code) {
        case "Space":
          if (!e.altKey && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
            return toggleTimer();
          }
          break;
        case "KeyR":
          if (!e.altKey && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
            return resetTimer();
          }
          break;
        case "Digit1":
          setSequenceStart("Digit1");
          clearSequence();
          return;
        case "Digit2":
          setSequenceStart("Digit2");
          clearSequence();
          return;
        case "KeyS":
          setAdvantage("");
          setSequenceStart("KeyS");
          clearSequence();
          return;
        case "KeyT":
          if (!e.altKey && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
            return changeMatchTime();
          }
          return;
        case "ArrowLeft":
          switch (sequenceStart) {
            case "Digit1":
              return c1Penalty(LEFT);
              break;
            case "Digit2":
              return c2Penalty(LEFT);
              break;
            case "KeyS":
              return setAdvantage(LEFT);
              break;
            default:
          }
          break;
        case "ArrowRight":
          switch (sequenceStart) {
            case "Digit1":
              return c1Penalty(RIGHT);
              break;
            case "Digit2":
              return c2Penalty(RIGHT);
              break;
            case "KeyS":
              return setAdvantage(RIGHT);
              break;
            default:
          }
          break;
        case "KeyQ":
          if (!e.altKey && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
            return increment(LEFT);
          }

          if (e.altKey && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
            return decrement(LEFT);
          }
          break;
        case "KeyP":
          if (!e.altKey && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
            return increment(RIGHT);
          }
          if (e.altKey && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
            return decrement(RIGHT);
          }
          break;
        default:
      }
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [toggleTimer]);
}

function App() {
  const [matchTime, setMatchTime] = useState(60000);
  const timer = useTimer({ time: matchTime });

  const [advantage, setAdvantage] = useState("");

  const [bluePoints, setBluePoints] = useState(0);
  const [blueC1Penalties, setBlueC1Penalties] = useState(0);
  const [blueC2Penalties, setBlueC2Penalties] = useState(0);

  const [redPoints, setRedPoints] = useState(0);
  const [redC1Penalties, setRedC1Penalties] = useState(0);
  const [redC2Penalties, setRedC2Penalties] = useState(0);

  useKeyboardEvents({
    changeMatchTime: () => {
      const answer = prompt(
        "Set the new match time, in seconds",
        Math.round(matchTime / 1000).toString()
      );

      if (!answer) {
        return;
      }

      try {
        setMatchTime(parseInt(answer, 10) * 1000);
        timer.reset();
      } catch (e) {
        return;
      }
    },
    decrement: (side) => {
      switch (side) {
        case LEFT:
          setBluePoints((prev) => Math.max(0, prev - 1));
          break;
        case RIGHT:
          setRedPoints((prev) => Math.max(0, prev - 1));
          break;
        default:
      }
    },
    increment: (side) => {
      switch (side) {
        case LEFT:
          setBluePoints((prev) => prev + 1);
          break;
        case RIGHT:
          setRedPoints((prev) => prev + 1);
          break;
        default:
      }
    },
    c1Penalty: (side) => {
      switch (side) {
        case LEFT:
          setBlueC1Penalties((prev) => Math.min(4, prev + 1));
          break;
        case RIGHT:
          setRedC1Penalties((prev) => Math.min(4, prev + 1));
          break;
        default:
      }
    },
    c2Penalty: (side) => {
      switch (side) {
        case LEFT:
          setBlueC2Penalties((prev) => Math.min(4, prev + 1));
          break;
        case RIGHT:
          setRedC2Penalties((prev) => Math.min(4, prev + 1));
          break;
        default:
      }
    },
    setAdvantage: (side) => {
      setAdvantage(side);
    },
    toggleTimer: () => {
      timer.running ? timer.stop() : timer.start();
    },
    resetTimer: () => {
      setAdvantage("");
      setBluePoints(0);
      setRedPoints(0);
      setBlueC1Penalties(0);
      setBlueC2Penalties(0);
      setRedC1Penalties(0);
      setRedC2Penalties(0);
      timer.reset();
    },
  });

  return (
    <div className="App">
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
        }}
      >
        <div style={{ flex: "0 0 50%", color: "hsl(210deg, 100%, 75%)" }}>
          <div style={{ fontSize: "3vh", padding: "0.25em 0" }}>
            {advantage === LEFT ? "\u2605 SENSHU" : "\u00a0"}
          </div>
          <div style={{ fontSize: "50vh", lineHeight: "1" }}>{bluePoints}</div>
          <div>
            <div style={{ fontSize: "3vh", fontWeight: "bold" }}>
              {"\u25cf ".repeat(blueC1Penalties)}
              {"\u25cb ".repeat(Math.max(0, 4 - blueC1Penalties))}
            </div>
            <div style={{ fontSize: "3vh", fontWeight: "bold" }}>
              {"\u25cf ".repeat(blueC2Penalties)}
              {"\u25cb ".repeat(Math.max(0, 4 - blueC2Penalties))}
            </div>
          </div>
        </div>
        <div style={{ flex: "0 0 50%", color: "hsl(0deg, 100%, 75%)" }}>
          <div style={{ fontSize: "3vh", padding: "0.25em 0" }}>
            {advantage === RIGHT ? "\u2605 SENSHU" : "\u00a0"}
          </div>
          <div style={{ fontSize: "50vh", lineHeight: "1" }}>{redPoints}</div>
          <div>
            <div style={{ fontSize: "3vh", fontWeight: "bold" }}>
              {"\u25cf ".repeat(redC1Penalties)}
              {"\u25cb ".repeat(Math.max(0, 4 - redC1Penalties))}
            </div>
            <div style={{ fontSize: "3vh", fontWeight: "bold" }}>
              {"\u25cf ".repeat(redC2Penalties)}
              {"\u25cb ".repeat(Math.max(0, 4 - redC2Penalties))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ fontSize: "20vh" }}>
        <CountdownTimer timer={timer} delay={120000} />
      </div>
      <div
        style={{
          fontSize: "90%",
          position: "fixed",
          left: "0",
          bottom: "0",
          width: "100vw",
          height: "2rem",
          color: "#aaa",
        }}
      >
        <span style={{ marginRight: "1rem" }}>
          <kbd>Space</kbd> Start/stop timer
        </span>
        <span style={{ marginRight: "1rem" }}>
          <kbd>Q</kbd> / <kbd>P</kbd> +1 Point
        </span>
        <span style={{ marginRight: "1rem" }}>
          <kbd>{"\u2325"}</kbd> + <kbd>Q</kbd> / <kbd>P</kbd> -1 Point
        </span>
        <span style={{ marginRight: "1rem" }}>
          <kbd>1</kbd> + <kbd>&larr;</kbd> / <kbd>&rarr;</kbd> C1 Penalty
        </span>
        <span style={{ marginRight: "1rem" }}>
          <kbd>2</kbd> + <kbd>&larr;</kbd> / <kbd>&rarr;</kbd> C2 Penalty
        </span>
        <span style={{ marginRight: "1rem" }}>
          <kbd>R</kbd> Reset
        </span>
        <span style={{ marginRight: "1rem" }}>
          <kbd>T</kbd> Match Time
        </span>
      </div>
    </div>
  );
}

export default App;
