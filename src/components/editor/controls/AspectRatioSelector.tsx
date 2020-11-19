import { Listbox, Transition } from "@headlessui/react";
import classNames from "classnames";
import React from "react";

import { Heading } from "~/components/ui/Heading";
import { SelectorCarretIcon } from "~/components/ui/Icon";
import { AspectRatio, AspectRatioConfiguration, aspectRatios } from "~/core/aspectRatio";

type Props = {
  value: AspectRatio;
  onChange: (value: AspectRatio) => void;
};

export const AspectRatioSelector: React.FC<Props> = ({ value, onChange }) => {
  const configuration = aspectRatios[value];

  return (
    <Listbox
      as="div"
      className="space-y-2 cursor-pointer"
      value={value}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onChange={(ratio) => {
        onChange(ratio);
      }}
    >
      {({ open }) => (
        <>
          <Listbox.Label>
            <Heading>Aspect Ratio</Heading>
          </Listbox.Label>
          <div className="relative">
            <span className="inline-block w-full rounded-md shadow-sm mt-1">
              <Listbox.Button className="relative w-full rounded-md border border-gray-300 bg-white py-1 text-left focus:outline-none focus:ring rounded transition ease-in-out duration-150 sm:text-sm sm:leading-5">
                <div className="flex items-center gap-3 px-2 w-full h-full md:h-10">
                  <AspectRatioOption configuration={configuration} />

                  <span className="ml-auto">
                    <SelectorCarretIcon className="h-5 w-5 text-gray-400" />
                  </span>
                </div>
              </Listbox.Button>
            </span>

            <Transition
              className="z-10 fixed w-40 md:w-full md:absolute bottom-0 mb-40 md:bottom-auto md:mb-auto mx-1 my-1 md:mx-auto rounded-md bg-white shadow-lg border rounded"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              show={open}
            >
              <Listbox.Options
                static
                className="max-h-60 rounded-md text-base leading-6 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm sm:leading-5"
              >
                {Object.entries(aspectRatios).map(([ratio, configuration]) => {
                  return (
                    <Listbox.Option key={ratio} value={ratio}>
                      {({ selected, active }) => (
                        <div
                          className={classNames("flex items-center gap-3 py-1 px-2 w-full h-full", {
                            "bg-orange-300": selected,
                            "bg-orange-100": active,
                          })}
                        >
                          <AspectRatioOption configuration={configuration} />
                        </div>
                      )}
                    </Listbox.Option>
                  );
                })}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};

export const AspectRatioOption: React.FC<{ configuration: AspectRatioConfiguration }> = ({ configuration }) => {
  const configurationRatio = configuration.ratio
    ? `${configuration.ratio[0]} × ${configuration.ratio[1]} px`
    : "Browser size";

  return (
    <>
      <configuration.icon className="w-6 h-6 text-gray-900" />

      <div className="flex flex-col">
        <span className="text-xs text-gray-900 flex-1 text-left whitespace-nowrap">{configuration.name}</span>
        <span className="text-xs text-gray-600 whitespace-nowrap">{configurationRatio}</span>
      </div>
    </>
  );
};
