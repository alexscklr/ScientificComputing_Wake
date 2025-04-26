import React from "react"

interface PopupMessageProps {
    message: string,
    visible: boolean,
    setVisible: (value: boolean) => void
}

const PopupMessage: React.FC<PopupMessageProps> = ({message, visible, setVisible}) => {

    const hide = () => {
        setVisible(false);
    }

    return ((visible) &&
        <div 
        style={{width: 'fit-content', padding: '5px', borderRadius: '5px', backgroundColor: 'grey', fontSize: '1.5rem', color: 'orange', whiteSpace: 'nowrap', position: 'absolute', left: '50%', top: '50%', transform: 'translateX(-50%) translateY(-150%)', cursor: 'default'}}
        onMouseLeave={hide}
        >
            {message}
        </div>  
    );
}

export default PopupMessage;