import { useMemo } from "react";

interface AnalogClockProps {
  hours: number;
  minutes: number;
  seconds: number;
  color: string;
  digitalTime: string;
  ampm?: string;
  size?: number;
  fontFamily?: string;
  fontWeight?: number;
  thickness?: number; // 1-5, default 3
}

const AnalogClock = ({ hours, minutes, seconds, color, digitalTime, ampm, size = 300, fontFamily = "ui-monospace, monospace", fontWeight = 700, thickness = 3 }: AnalogClockProps) => {
  const cx = 150;
  const cy = 150;
  const r = 140;

  const angles = useMemo(() => {
    const secAngle = (seconds / 60) * 360 - 90;
    const minAngle = ((minutes + seconds / 60) / 60) * 360 - 90;
    const hourAngle = (((hours % 12) + minutes / 60) / 12) * 360 - 90;
    return { secAngle, minAngle, hourAngle };
  }, [hours, minutes, seconds]);

  const handEnd = (angle: number, length: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + length * Math.cos(rad), y: cy + length * Math.sin(rad) };
  };

  const hourEnd = handEnd(angles.hourAngle, r * 0.5);
  const minEnd = handEnd(angles.minAngle, r * 0.7);
  const secEnd = handEnd(angles.secAngle, r * 0.85);

  // Tick marks
  const ticks = useMemo(() => {
    const marks = [];
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * 360 - 90;
      const rad = (angle * Math.PI) / 180;
      const isHour = i % 5 === 0;
      const outerR = r - 2;
      const innerR = isHour ? r - (10 + thickness * 2) : r - (4 + thickness);
      marks.push({
        x1: cx + innerR * Math.cos(rad),
        y1: cy + innerR * Math.sin(rad),
        x2: cx + outerR * Math.cos(rad),
        y2: cy + outerR * Math.sin(rad),
        isHour,
        key: i,
      });
    }
    return marks;
  }, []);

  // Hour numbers
  const hourNumbers = useMemo(() => {
    const nums = [];
    for (let i = 1; i <= 12; i++) {
      const angle = (i / 12) * 360 - 90;
      const rad = (angle * Math.PI) / 180;
      const numR = r - 26;
      nums.push({
        x: cx + numR * Math.cos(rad),
        y: cy + numR * Math.sin(rad),
        num: i,
      });
    }
    return nums;
  }, []);

  return (
    <svg
      viewBox="0 0 300 300"
      width={size}
      height={size}
      style={{ maxWidth: "100%", maxHeight: "100%" }}
    >
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${color}40`} strokeWidth={2 + thickness} />

      {/* Tick marks */}
      {ticks.map(t => (
        <line
          key={t.key}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.isHour ? `${color}90` : `${color}40`}
          strokeWidth={t.isHour ? 1.5 + thickness * 0.8 : 0.5 + thickness * 0.5}
          strokeLinecap="round"
        />
      ))}

      {/* Hour numbers */}
      {hourNumbers.map(n => (
        <text
          key={n.num}
          x={n.x}
          y={n.y}
          fill={`${color}70`}
          fontSize="18"
          fontFamily={fontFamily}
          fontWeight={fontWeight}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {n.num}
        </text>
      ))}

      {/* Hour hand */}
      <line
        x1={cx} y1={cy} x2={hourEnd.x} y2={hourEnd.y}
        stroke={color}
        strokeWidth={3 + thickness * 1.5}
        strokeLinecap="round"
      />

      {/* Minute hand */}
      <line
        x1={cx} y1={cy} x2={minEnd.x} y2={minEnd.y}
        stroke={color}
        strokeWidth={2 + thickness}
        strokeLinecap="round"
      />

      {/* Second hand */}
      <line
        x1={cx} y1={cy} x2={secEnd.x} y2={secEnd.y}
        stroke={`${color}CC`}
        strokeWidth={0.5 + thickness * 0.5}
        strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3 + thickness} fill={color} />

      {/* Digital time in center */}
      <text
        x={cx}
        y={cy + 38}
        fill={`${color}90`}
        fontSize="18"
        fontFamily={fontFamily}
        fontWeight={fontWeight}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {digitalTime}
      </text>

      {/* AM/PM */}
      {ampm && (
        <text
          x={cx}
          y={cy + 54}
          fill={`${color}50`}
          fontSize="10"
          fontFamily={fontFamily}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {ampm}
        </text>
      )}
    </svg>
  );
};

export default AnalogClock;
