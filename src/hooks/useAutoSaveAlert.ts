import { app } from "~/core/app";
import { useHotkey } from "~/hooks/useHotkey";

export const useAutoSaveAlert = (): void => {
  useHotkey({ key: "s", meta: true }, () => {
    app.alerts.trigger({
      message: "Pelica auto-saves your work 😉",
      color: "green",
      timeout: 3000,
    });
  });
};
