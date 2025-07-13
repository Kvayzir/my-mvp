interface ResetButtonProps {
  onReset: () => void;
  clickedCount: number;
}

export const ResetButton: React.FC<ResetButtonProps> = ({ onReset, clickedCount }) => {
  return (
    <button
      onClick={onReset}
      className="absolute px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
      style={{
        left: '15%',
        top: '7%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      Reset Arrows ({clickedCount} clicked)
    </button>
  );
};
