import { IconProps } from "./IconProps";

export default function InfoIcon({
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
            <path xmlns="http://www.w3.org/2000/svg" d="M12,24A12,12,0,1,0,0,12,12.013,12.013,0,0,0,12,24ZM12,5a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,12,5Zm-1,5h1a2,2,0,0,1,2,2v6a1,1,0,0,1-2,0V12H11a1,1,0,0,1,0-2Z"/>
        </svg>
    )
}
