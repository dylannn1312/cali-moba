import { IconProps } from "./IconProps";

export default function TransactionIcon({
    size,
    color,
    className
}: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size ?? 20}
            height={size ?? 20}
            fill={color ?? "currentColor"}
            className={className}
        >
            <path
                xmlns="http://www.w3.org/2000/svg"
                d="M8,0A5.006,5.006,0,0,0,3,5V23a1,1,0,0,0,1.564.825L6.67,22.386l2.106,1.439a1,1,0,0,0,1.13,0l2.1-1.439,2.1,1.439a1,1,0,0,0,1.131,0l2.1-1.438,2.1,1.437A1,1,0,0,0,21,23V5a5.006,5.006,0,0,0-5-5Zm6,14H8a1,1,0,0,1,0-2h6a1,1,0,0,1,0,2Zm3-5a1,1,0,0,1-1,1H8A1,1,0,0,1,8,8h8A1,1,0,0,1,17,9Z"
            ></path>

        </svg>
    )
}
