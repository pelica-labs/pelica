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
      bottom: 0,
      position: "fixed",
      zIndex: 10,
    },
    content: {
      ...Modal.defaultStyles.content,
      backgroundColor: theme.colors.gray[900],
      borderColor: theme.colors.orange[500],
      padding: theme.padding[3],
      color: theme.colors.gray[200],
    },
  };
};
