import React from "react";

interface PopupMessageProps {
  message: string;
  visible: boolean;
  setVisible: (value: boolean) => void;
}

const PopupMessage: React.FC<PopupMessageProps> = ({ message, visible, setVisible }) => {
  const hide = () => {
    setVisible(false);
  };

  return (
    visible && (
      <div
        onMouseLeave={hide}
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translate(-50%, -120%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '10px 16px',
          borderRadius: '8px',
          color: '#ffa500',
          fontSize: '1rem',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
          zIndex: 9999,
          userSelect: 'none',
          pointerEvents: 'auto',
        }}
      >
        {message}
      </div>
    )
  );
};

export default PopupMessage;
