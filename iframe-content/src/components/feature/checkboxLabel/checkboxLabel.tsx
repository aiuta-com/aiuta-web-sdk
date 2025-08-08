import React, { useRef, useState } from "react";
import { CheckboxLabelTypes } from "./types";

import styles from "./checkboxLabel.module.scss";

export const CheckboxLabel = (props: CheckboxLabelTypes) => {
  const { labelText, onClick } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  const [isChecked, setIsChecked] = useState(false);

  const handleChangeCheckbox = () => {
    setIsChecked((prevState) => !prevState);
  };

  const handleOnClick = () => {
    if (typeof onClick === "function") onClick(!isChecked);
    handleChangeCheckbox();
  };

  return (
    <div onClick={handleOnClick} className={styles.checkboxLabel}>
      <input
        ref={inputRef}
        type="checkbox"
        onChange={() => null}
        checked={isChecked}
      />
      <label htmlFor="">{labelText}</label>
    </div>
  );
};
