type Props = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
};

export default function CircularProgress({
  percentage,
  size = 140,
  strokeWidth = 9,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const color =
    percentage >= 90
      ? "#F59E0B" // gold
      : percentage >= 80
      ? "#10B981" // green
      : percentage >= 60
      ? "#F97316" // orange
      : "#EF4444"; // red

  const label =
    percentage >= 90
      ? "Excellent!"
      : percentage >= 80
      ? "Great job!"
      : percentage >= 60
      ? "Good effort"
      : "Keep studying";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible" }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.7s ease" }}
        />
        {/* Percentage text */}
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          dy=".3em"
          fontSize={size * 0.2}
          fontWeight="700"
          fill={color}
          fontFamily="inherit"
        >
          {percentage}%
        </text>
      </svg>
      <span className="text-sm font-medium" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
