import React from "react";
import type { ComponentPropsWithoutRef } from "react";

export type LogoSvgProps = ComponentPropsWithoutRef<"svg"> & { size?: number };

export const LogoSvg = ({ size = 24, ...props }: LogoSvgProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 330 330"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <mask id="path-1-inside-1_5_6" fill="white">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M165 261C218.019 261 261 218.019 261 165C261 111.981 218.019 69 165 69C111.981 69 69 111.981 69 165C69 218.019 111.981 261 165 261ZM165 231C201.451 231 231 201.451 231 165C231 128.549 201.451 99 165 99C128.549 99 99 128.549 99 165C99 201.451 128.549 231 165 231Z"
                />
            </mask>
            <g filter="url(#filter0_i_5_6)">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M165 261C218.019 261 261 218.019 261 165C261 111.981 218.019 69 165 69C111.981 69 69 111.981 69 165C69 218.019 111.981 261 165 261ZM165 231C201.451 231 231 201.451 231 165C231 128.549 201.451 99 165 99C128.549 99 99 128.549 99 165C99 201.451 128.549 231 165 231Z"
                    fill="url(#paint0_linear_5_6)"
                />
            </g>
            <path
                d="M165 261V262V261ZM69 165L68 165V165H69ZM165 231L165 232L165 231ZM99 165L98 165V165L99 165ZM260 165C260 217.467 217.467 260 165 260L165 262C218.572 262 262 218.572 262 165L260 165ZM165 70C217.467 70 260 112.533 260 165L262 165C262 111.428 218.572 68 165 68L165 70ZM70 165C70 112.533 112.533 70 165 70L165 68C111.428 68 68 111.428 68 165L70 165ZM165 260C112.533 260 70 217.467 70 165L68 165C68 218.572 111.428 262 165 262L165 260ZM230 165C230 200.899 200.899 230 165 230L165 232C202.003 232 232 202.003 232 165L230 165ZM165 100C200.899 100 230 129.101 230 165L232 165C232 127.997 202.003 98 165 98L165 100ZM100 165C100 129.101 129.101 100 165 100L165 98C127.997 98 98 127.997 98 165L100 165ZM165 230C129.101 230 100 200.899 100 165L98 165C98 202.003 127.997 232 165 232L165 230Z"
                fill="url(#paint1_linear_5_6)"
                mask="url(#path-1-inside-1_5_6)"
            />
            <g filter="url(#filter1_i_5_6)">
                <circle
                    cx="165"
                    cy="24"
                    r="24"
                    fill="url(#paint2_linear_5_6)"
                />
            </g>
            <g filter="url(#filter2_i_5_6)">
                <circle
                    cx="24"
                    cy="165"
                    r="24"
                    fill="url(#paint3_linear_5_6)"
                />
            </g>
            <g filter="url(#filter3_i_5_6)">
                <circle
                    cx="24"
                    cy="165"
                    r="24"
                    fill="url(#paint4_linear_5_6)"
                />
            </g>
            <g filter="url(#filter4_i_5_6)">
                <circle
                    cx="306"
                    cy="165"
                    r="24"
                    fill="url(#paint5_linear_5_6)"
                />
            </g>
            <g filter="url(#filter5_i_5_6)">
                <circle
                    cx="287"
                    cy="93"
                    r="24"
                    fill="url(#paint6_linear_5_6)"
                />
            </g>
            <g filter="url(#filter6_i_5_6)">
                <circle
                    cx="234"
                    cy="43"
                    r="24"
                    fill="url(#paint7_linear_5_6)"
                />
            </g>
            <g filter="url(#filter7_i_5_6)">
                <circle cx="93" cy="43" r="24" fill="url(#paint8_linear_5_6)" />
            </g>
            <g filter="url(#filter8_i_5_6)">
                <circle cx="43" cy="93" r="24" fill="url(#paint9_linear_5_6)" />
            </g>
            <g filter="url(#filter9_i_5_6)">
                <circle
                    cx="43"
                    cy="237"
                    r="24"
                    fill="url(#paint10_linear_5_6)"
                />
            </g>
            <g filter="url(#filter10_i_5_6)">
                <circle
                    cx="93"
                    cy="287"
                    r="24"
                    fill="url(#paint11_linear_5_6)"
                />
            </g>
            <g filter="url(#filter11_i_5_6)">
                <circle
                    cx="234"
                    cy="287"
                    r="24"
                    fill="url(#paint12_linear_5_6)"
                />
            </g>
            <g filter="url(#filter12_i_5_6)">
                <circle
                    cx="287"
                    cy="237"
                    r="24"
                    fill="url(#paint13_linear_5_6)"
                />
            </g>
            <g filter="url(#filter13_i_5_6)">
                <circle
                    cx="165"
                    cy="306"
                    r="24"
                    fill="url(#paint14_linear_5_6)"
                />
            </g>
            <defs>
                <filter
                    id="filter0_i_5_6"
                    x="69"
                    y="69"
                    width="192"
                    height="196"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="4.7" />
                    <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_5_6"
                    />
                </filter>
                <filter
                    id="filter1_i_5_6"
                    x="141"
                    y="0"
                    width="48"
                    height="52"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="4.7" />
                    <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_5_6"
                    />
                </filter>
                <filter
                    id="filter2_i_5_6"
                    x="0"
                    y="141"
                    width="48"
                    height="52"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="4.7" />
                    <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_5_6"
                    />
                </filter>
                <filter
                    id="filter3_i_5_6"
                    x="0"
                    y="141"
                    width="48"
                    height="52"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="4.7" />
                    <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_5_6"
                    />
                </filter>
                <filter
                    id="filter4_i_5_6"
                    x="282"
                    y="141"
                    width="48"
                    height="52"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="4.7" />
                    <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_5_6"
                    />
                </filter>
                <filter
                    id="filter5_i_5_6"
                    x="263"
                    y="69"
                    width="48"
                    height="52"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="4.7" />
                    <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_5_6"
                    />
                </filter>
                <filter
                    id="filter6_i_5_6"
                    x="210"
                    y="19"
                    width="48"
                    height="52"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="4.7" />
                    <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_5_6"
                    />
                </filter>
                <filter
                    id="filter7_i_5_6"
                    x="69"
                    y="19"
                    width="48"
                    height="52"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="4.7" />
                    <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_5_6"
                    />
                </filter>
                <filter
                    id="filter8_i_5_6"
                    x="19"
                    y="69"
                    width="48"
                    height="52"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="4.7" />
                    <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_5_6"
                    />
                </filter>
                <filter
                    id="filter9_i_5_6"
                    x="19"
                    y="213"
                    width="48"
                    height="52"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="4.7" />
                    <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_5_6"
                    />
                </filter>
                <filter
                    id="filter10_i_5_6"
                    x="69"
                    y="263"
                    width="48"
                    height="52"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="4.7" />
                    <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_5_6"
                    />
                </filter>
                <filter
                    id="filter11_i_5_6"
                    x="210"
                    y="263"
                    width="48"
                    height="52"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="4.7" />
                    <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_5_6"
                    />
                </filter>
                <filter
                    id="filter12_i_5_6"
                    x="263"
                    y="213"
                    width="48"
                    height="52"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="4.7" />
                    <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_5_6"
                    />
                </filter>
                <filter
                    id="filter13_i_5_6"
                    x="141"
                    y="282"
                    width="48"
                    height="52"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="4.7" />
                    <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_5_6"
                    />
                </filter>
                <linearGradient
                    id="paint0_linear_5_6"
                    x1="69"
                    y1="165"
                    x2="261"
                    y2="165"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#AD9F9F" />
                    <stop offset="0.79" stopColor="#655959" />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_5_6"
                    x1="69"
                    y1="165"
                    x2="261"
                    y2="165"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#AD9F9F" />
                    <stop offset="0.79" stopColor="#655959" />
                </linearGradient>
                <linearGradient
                    id="paint2_linear_5_6"
                    x1="165"
                    y1="0"
                    x2="165"
                    y2="48"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#AD9F9F" />
                    <stop offset="0.79" stopColor="#655959" />
                </linearGradient>
                <linearGradient
                    id="paint3_linear_5_6"
                    x1="24"
                    y1="141"
                    x2="24"
                    y2="189"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#AD9F9F" />
                    <stop offset="0.79" stopColor="#655959" />
                </linearGradient>
                <linearGradient
                    id="paint4_linear_5_6"
                    x1="24"
                    y1="141"
                    x2="24"
                    y2="189"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#AD9F9F" />
                    <stop offset="0.79" stopColor="#655959" />
                </linearGradient>
                <linearGradient
                    id="paint5_linear_5_6"
                    x1="306"
                    y1="141"
                    x2="306"
                    y2="189"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#AD9F9F" />
                    <stop offset="0.79" stopColor="#655959" />
                </linearGradient>
                <linearGradient
                    id="paint6_linear_5_6"
                    x1="287"
                    y1="69"
                    x2="287"
                    y2="117"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#AD9F9F" />
                    <stop offset="0.79" stopColor="#655959" />
                </linearGradient>
                <linearGradient
                    id="paint7_linear_5_6"
                    x1="234"
                    y1="19"
                    x2="234"
                    y2="67"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#AD9F9F" />
                    <stop offset="0.79" stopColor="#655959" />
                </linearGradient>
                <linearGradient
                    id="paint8_linear_5_6"
                    x1="93"
                    y1="19"
                    x2="93"
                    y2="67"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#AD9F9F" />
                    <stop offset="0.79" stopColor="#655959" />
                </linearGradient>
                <linearGradient
                    id="paint9_linear_5_6"
                    x1="43"
                    y1="69"
                    x2="43"
                    y2="117"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#AD9F9F" />
                    <stop offset="0.79" stopColor="#655959" />
                </linearGradient>
                <linearGradient
                    id="paint10_linear_5_6"
                    x1="43"
                    y1="213"
                    x2="43"
                    y2="261"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#AD9F9F" />
                    <stop offset="0.79" stopColor="#655959" />
                </linearGradient>
                <linearGradient
                    id="paint11_linear_5_6"
                    x1="93"
                    y1="263"
                    x2="93"
                    y2="311"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#AD9F9F" />
                    <stop offset="0.79" stopColor="#655959" />
                </linearGradient>
                <linearGradient
                    id="paint12_linear_5_6"
                    x1="234"
                    y1="263"
                    x2="234"
                    y2="311"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#AD9F9F" />
                    <stop offset="0.79" stopColor="#655959" />
                </linearGradient>
                <linearGradient
                    id="paint13_linear_5_6"
                    x1="287"
                    y1="213"
                    x2="287"
                    y2="261"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#AD9F9F" />
                    <stop offset="0.79" stopColor="#655959" />
                </linearGradient>
                <linearGradient
                    id="paint14_linear_5_6"
                    x1="165"
                    y1="282"
                    x2="165"
                    y2="330"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#AD9F9F" />
                    <stop offset="0.79" stopColor="#655959" />
                </linearGradient>
            </defs>
        </svg>
    );
};
