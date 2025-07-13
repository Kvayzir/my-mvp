import { RING_CONFIG } from "@/app/lib/constants/journey-map-constants";

interface RingBackgroundProps {
  ring: number;
}

export const RingBackground: React.FC<RingBackgroundProps> = ({ ring }) => {
  const config = RING_CONFIG[ring as keyof typeof RING_CONFIG];
  
  return (
    <div
      className={`absolute rounded-full border-2 border-dashed border-opacity-30 ${config.color} bg-opacity-10`}
      style={{
        width: `${config.radius * 2 + 96}px`,
        height: `${config.radius * 2 + 96}px`,
        borderColor: config.borderColor.replace('border-', '').replace('-300', ''),
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
};
