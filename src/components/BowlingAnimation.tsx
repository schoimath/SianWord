type Props = {
  state: "idle" | "rolling" | "strike" | "spare" | "open" | "bonus";
  pinsDown: number;
};

const pins = [
  { number: 1, className: "pin-1" },
  { number: 2, className: "pin-2" },
  { number: 3, className: "pin-3" },
  { number: 4, className: "pin-4" },
  { number: 5, className: "pin-5" },
  { number: 6, className: "pin-6" },
  { number: 7, className: "pin-7" },
  { number: 8, className: "pin-8" },
  { number: 9, className: "pin-9" },
  { number: 10, className: "pin-10" },
];

export function BowlingAnimation({ state, pinsDown }: Props) {
  return (
    <div className={`lane ${state}`} aria-label="볼링 애니메이션">
      <div className="lane-lines" />
      <div className="ball" aria-hidden="true" />
      <div className="pins" aria-hidden="true">
        {pins.map((pin, index) => (
          <span key={pin.number} className={`${pin.className} ${index < pinsDown ? "down" : ""}`}>
            {pin.number}
          </span>
        ))}
      </div>
    </div>
  );
}
