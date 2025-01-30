import { IconProps } from "./IconProps";

export default function ArrowLeftIcon({
    size,
    color,
    className
}: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size ?? 35}
            height={size ?? 35}
            fill={color ?? "currentColor"}
            className={className}
        >
            <path
                xmlns="http://www.w3.org/2000/svg"
                d="M10.957,12.354a.5.5,0,0,1,0-.708l4.586-4.585a1.5,1.5,0,0,0-2.121-2.122L8.836,9.525a3.505,3.505,0,0,0,0,4.95l4.586,4.586a1.5,1.5,0,0,0,2.121-2.122Z"
            ></path>

        </svg>

    )
}
