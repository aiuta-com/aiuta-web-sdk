import { useRef, TouchEvent } from "react";

// redux
import { useAppSelector, useAppDispatch } from "@lib/redux/store";

// actions
import { configSlice } from "@lib/redux/slices/configSlice";

// selectors
import { isOpenSwipSelector } from "@lib/redux/slices/configSlice/selectors";

// components
import { TryOnButton } from "../tryOnButton/tryOnButton";
import { TitleDescription } from "../titleDescription/titleDescription";

// types
import { SwipTypes } from "./types";

// styles
import styles from "./swip.module.scss";

const SWIP_DOWN_POSITION = 200;
let initilOfsetTop: number | null = null;

export const Swip = (props: SwipTypes) => {
  const { children, buttonText, onClickButton } = props;

  const dispatch = useAppDispatch();

  const swipRef = useRef<HTMLDivElement | null>(null);

  const isOpenSwip = useAppSelector(isOpenSwipSelector);

  const onTouchStart = () => {
    if (swipRef && swipRef.current) {
      const swipContent = swipRef.current;
      if (initilOfsetTop && initilOfsetTop > 0) return;

      if (!initilOfsetTop) initilOfsetTop = swipContent.offsetTop;
    }
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const { clientY } = event.changedTouches[0];

    if (swipRef && swipRef.current) {
      const swipContent = swipRef.current;

      if (initilOfsetTop && clientY - initilOfsetTop >= SWIP_DOWN_POSITION) {
        dispatch(configSlice.actions.setIsOpenSwip(false));
        setTimeout(() => {
          swipContent.style.top = "unset";
        }, 300);
      } else {
        swipContent.style.top = `${clientY}px`;
        swipContent.style.top = `${initilOfsetTop}px`;
      }
    }
  };

  const onTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const { clientY } = event.changedTouches[0];

    if (swipRef && swipRef.current) {
      const swipContent = swipRef.current;

      if (initilOfsetTop && clientY - initilOfsetTop > 0) {
        swipContent.style.top = `${clientY}px`;
      }
    }
  };

  const handleCloseSwip = () => {
    dispatch(configSlice.actions.setIsOpenSwip(false));
  };

  return (
    <div
      onClick={handleCloseSwip}
      className={`${styles.swipConteiner} ${
        isOpenSwip ? styles.swipConteinerActive : ""
      }`}
    >
      <div className={styles.swipContent} ref={swipRef}>
        <div
          onTouchEnd={onTouchEnd}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          className={styles.swipCloseBox}
        >
          <img src={'/icons/swipLine'} alt="Swip line icon" />
        </div>
        <TitleDescription
          title="Previously used photos"
          textAlign="left"
          className={styles.titleBox}
        />
        <div className={styles.childrenContent}>{children} </div>
        <TryOnButton onClick={onClickButton}>{buttonText}</TryOnButton>
      </div>
    </div>
  );
};
