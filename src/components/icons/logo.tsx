export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="128"
      height="160"
      viewBox="0 0 128 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="128" height="128" rx="28" fill="#7C3AED" />
      <path
        d="M0 100C0 88.9543 8.95431 80 20 80H108C119.046 80 128 88.9543 128 100V108C128 119.046 119.046 128 108 128H20C8.95431 128 0 119.046 0 108V100Z"
        fill="#5B21B6"
      />
      <path
        d="M128 92.5C128 92.5 106.5 102 64 102C21.5 102 0 92.5 0 92.5V108C0 119.046 8.95431 128 20 128H108C119.046 128 128 119.046 128 108V92.5Z"
        fill="#4C1D95"
      />
      <path
        d="M93.3333 32.6667C93.3333 30.134 91.266 28 88.6667 28C86.0673 28 84 30.134 84 32.6667V78.1387C82.1643 77.2921 80.052 76.8333 77.8333 76.8333C68.9054 76.8333 61.6667 83.7461 61.6667 92.1667C61.6667 100.587 68.9054 107.5 77.8333 107.5C86.7613 107.5 94 100.587 94 92.1667V50.3333L93.3333 50.1111V32.6667Z"
        fill="white"
      />
      <text
        x="50%"
        y="148"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#4C1D95"
        fontSize="32"
        fontFamily="Inter, sans-serif"
        fontWeight="bold"
      >
        SAYA
      </text>
    </svg>
  );
}
