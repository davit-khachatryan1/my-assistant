const CX = 110;
const CY = 110;
const RX = 70;
const ARC_RY_VALUES = [70, 56, 22, 22, 56];

function ellipsePath(rx: number, ry: number): string {
  return `M ${CX - rx} ${CY} A ${rx} ${ry} 0 1 1 ${CX + rx} ${CY} A ${rx} ${ry} 0 1 1 ${CX - rx} ${CY} Z`;
}

export const ARC_IDS = ARC_RY_VALUES.map((_, i) => `orb-arc-${i}`);

export function OrbArcs() {
  return (
    <g>
      {ARC_RY_VALUES.map((ry, i) => (
        <path
          key={ARC_IDS[i]}
          id={ARC_IDS[i]}
          d={ellipsePath(RX, ry)}
          fill="none"
          stroke="var(--panel-border)"
          strokeWidth={1}
        />
      ))}
    </g>
  );
}
