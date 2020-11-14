import { useStore } from "~/core/app";

type Layout = {
  horizontal: boolean;
  vertical: boolean;
};

export const useLayout = (): Layout => {
  const md = useStore((store) => store.platform.screen.dimensions.md);

  return {
    horizontal: md,
    vertical: !md,
  };
};
