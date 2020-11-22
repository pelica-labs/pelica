import Modal from "react-modal";

import { theme } from "~/styles/tailwind";

export const setupModals = (): void => {
  Modal.setAppElement("#__next");

  Modal.defaultStyles = {
    overlay: {
      ...Modal.defaultStyles.overlay,
      backgroundColor: `rgba(0, 0, 0, 0.5)`,
      top: 0,
      left: 0,
      right: 0,
      position: "fixed",
      zIndex: theme.zIndex[50] + 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      ...Modal.defaultStyles.content,
      position: "relative",
      backgroundColor: theme.colors.gray[100],
      borderColor: theme.colors.orange[500],
      width: 1024,
      maxWidth: "95vw",
      margin: "0 auto",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  };
};
