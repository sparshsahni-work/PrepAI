import { useState } from "react";
import "./HoverInfo.scss";

const HoverInfo = ({ label, children }) => {
  const [show, setShow] = useState(false);

  return (
    <div 
      className="hover-info"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="hover-info__label">{label}</span>

      {show && (
        <div className="hover-info__card">
          {children}
        </div>
      )}
    </div>
  );
};

export default HoverInfo;