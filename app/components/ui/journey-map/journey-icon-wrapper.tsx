import { JourneyIconEntry } from "@/app/lib/types";
import JourneyIcon from "./journey-icon";

interface JourneyIconWrapperProps {
  item: JourneyIconEntry;
  position: { x: number; y: number };
  isVisible: boolean;
  isClicked: boolean;
  onClick: () => void;
}

export const JourneyIconWrapper: React.FC<JourneyIconWrapperProps> = ({
  item,
  position,
  isVisible,
  isClicked,
  onClick
}) => {
  return (
    <div
      className={`absolute ${isVisible ? '' : 'hidden'}`}
      style={{
        left: `calc(50% + ${position.x}px)`,
        top: `calc(50% + ${position.y}px)`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className={`${isClicked ? 'ring-2 ring-blue-400 ring-opacity-75 rounded-full' : ''}`}>
        <JourneyIcon
          name={item.name}
          icon={item.icon}
          color={item.color}
          size={item.size || 'md'}
          onClick={onClick}
        />
      </div>
    </div>
  );
};
