import { Icon, InformationIcon } from "~/components/Icon";
import { App } from "~/core/zustand";

type Alert = {
  id: number;
  message: string;
  timeout: number;
  color: string;
  icon: Icon;
};

type AlertInput = {
  message: string;
  timeout?: number;
  color?: string;
  icon?: Icon;
};

type Alerts = {
  messages: Alert[];
};

export const alertsInitialState: Alerts = {
  messages: [],
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const alerts = ({ mutate, get }: App) => ({
  ...alertsInitialState,

  trigger: (alertInput: AlertInput) => {
    const alert: Alert = {
      timeout: 5000,
      color: "orange",
      icon: InformationIcon,
      ...alertInput,
      id: nextAlertId(),
    };

    mutate((state) => {
      state.alerts.messages.push(alert);
    });

    setTimeout(() => {
      get().alerts.dismiss(alert.id);
    }, alert.timeout);
  },

  dismiss: (alertId: number) => {
    mutate((state) => {
      const index = state.alerts.messages.findIndex((item) => item.id === alertId);

      if (index >= 0) {
        state.alerts.messages.splice(index, 1);
      }
    });
  },
});

let nextId = 0;

export const nextAlertId = (): number => {
  nextId += 1;

  return nextId;
};
