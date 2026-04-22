const SvgDefs = () => {
  return (
    <defs>
      <symbol id="icon-bomb" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <image
          href="/themes/blue-graphite/icons/Bomb.png"
          x="0"
          y="0"
          width="100"
          height="100"
          preserveAspectRatio="xMidYMid meet"
        />
      </symbol>

      <symbol id="icon-flag" viewBox="0 0 200 200">
        <path
          d="M37.1736 24L39.8264 175.977"
          stroke="white"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M74.1596 28.6745C57.6718 27.9384 36 35.2332 36 35.2332V112.745C36 112.745 57.6718 105.45 74.1596 106.186C94.3423 107.087 105.263 118.217 125.437 119.303C135.91 119.868 148.618 116.934 156.244 114.807C160.019 113.755 162.003 109.754 160.764 106.037L154.65 87.6962C153.87 85.3553 153.708 82.8524 154.181 80.4305L161.016 45.401C161.896 40.889 157.517 37.0041 153.064 38.1476C145.385 40.1196 134.562 42.2834 125.437 41.7918C105.263 40.7051 94.3423 29.5756 74.1596 28.6745Z"
          fill="#FF5C7A"
          stroke="white"
          strokeWidth="11.9249"
          strokeLinecap="round"
        />
      </symbol>

      <symbol id="icon-question" viewBox="0 0 100 100">
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontWeight="800"
          fontSize="96"
          fill="#FFB74D"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="2"
          paintOrder="stroke"
        >
          ?
        </text>
      </symbol>

      <symbol id="icon-cross" viewBox="0 0 24 24">
        <path
          d="M2 2 L22 22"
          stroke="#f30000"
          strokeWidth="2.75"
          strokeLinecap="round"
        />
        <path
          d="M22 2 L2 22"
          stroke="#f30000"
          strokeWidth="2.75"
          strokeLinecap="round"
        />
      </symbol>

      <filter
        id="soft-shadow"
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
      >
        <feDropShadow
          dx="0"
          dy="4"
          stdDeviation="4"
          floodColor="#000"
          floodOpacity="0.28"
        />
      </filter>

      <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow
          dx="0"
          dy="0"
          stdDeviation="6"
          floodColor="#ff5c7a"
          floodOpacity="0.35"
        />
      </filter>

      <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow
          dx="0"
          dy="0"
          stdDeviation="4"
          floodColor="#33d69f"
          floodOpacity="0.3"
        />
      </filter>
    </defs>
  );
};

export default SvgDefs;
