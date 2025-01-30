import { IconProps } from "./IconProps";

export default function ArrowDownIcon({
  size,
  color
}: IconProps) {
    return (
      <svg fill="none" height={(size as number ?? 14) / 2} width={size ?? 14} xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12.75 1.54001L8.51647 5.0038C7.77974 5.60658 6.72026 5.60658 5.98352 5.0038L1.75 1.54001"
          stroke={color ?? "currentColor"}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          xmlns="http://www.w3.org/2000/svg"
        />
      </svg>

    )
  }
