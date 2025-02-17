import { IconProps } from "./IconProps";

export default function EnterIcon({
  size,
  color,
  className
}: IconProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size ?? 20}
      height={size ?? 20}
      fill={color ?? "currentColor"}
      className={className}
      x={"0px"}
      y={"0px"}
    >
      <g xmlns="http://www.w3.org/2000/svg">
        <path d="M170.699,448H72.757c-4.814-0.012-8.714-3.911-8.725-8.725V72.725c0.012-4.814,3.911-8.714,8.725-8.725h97.941   c17.673,0,32-14.327,32-32s-14.327-32-32-32H72.757C32.612,0.047,0.079,32.58,0.032,72.725v366.549   C0.079,479.42,32.612,511.953,72.757,512h97.941c17.673,0,32-14.327,32-32S188.372,448,170.699,448z" />
        <path d="M480.032,224l-290.987,0.576l73.941-73.941c12.501-12.495,12.506-32.758,0.011-45.259s-32.758-12.506-45.259-0.011   l-82.752,82.752c-37.491,37.49-37.491,98.274-0.001,135.764c0,0,0.001,0.001,0.001,0.001l82.752,82.752   c12.501,12.495,32.764,12.49,45.259-0.011s12.49-32.764-0.011-45.259l-72.811-72.789L480.032,288   c17.673-0.035,31.971-14.391,31.936-32.064S497.577,223.965,479.904,224H480.032z"></path>
      </g>

    </svg>
  )
}
