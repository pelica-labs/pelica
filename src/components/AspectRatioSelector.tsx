import { Listbox, Transition } from "@headlessui/react";
import classNames from "classnames";
import React from "react";

import { AspectRatio, aspectRatios } from "~/lib/aspectRatio";

type Props = {
  value: AspectRatio;
  onChange: (value: AspectRatio) => void;
};

export const AspectRatioSelector: React.FC<Props> = ({ value, onChange }) => {
  const currentConfiguration = aspectRatios[value];
  const currentConfigurationRatio = currentConfiguration.ratio
    ? `${currentConfiguration.ratio[0]} × ${currentConfiguration.ratio[1]} px`
    : "Browser size";

  return (
    <Listbox as="div" className="space-y-2 cursor-pointer" value={value} onChange={(e) => onChange(e)}>
      {({ open }) => (
        <>
          <Listbox.Label className="text-xs uppercase text-gray-800 font-light tracking-wide leading-none flex items-center">
            Aspect Ratio
          </Listbox.Label>
          <div className="relative">
            <span className="inline-block w-full rounded-md shadow-sm">
              <Listbox.Button className="relative w-full rounded-md border border-gray-300 bg-white py-1 text-left focus:outline-none focus:shadow-outline rounded transition ease-in-out duration-150 sm:text-sm sm:leading-5">
                <div className="flex items-center gap-3 px-2 w-full h-full md:h-10">
                  <currentConfiguration.icon className="w-6 h-6" />

                  <div className="flex flex-col">
                    <span className="text-xs flex-1 text-left whitespace-no-wrap">{currentConfiguration.name}</span>

                    <span className="text-xs text-gray-600 whitespace-no-wrap">{currentConfigurationRatio}</span>
                  </div>
                  <span className="ml-auto">
                    <SelectorCarretIcon />
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
                className="max-h-60 rounded-md text-base leading-6 shadow-xs overflow-auto focus:outline-none sm:text-sm sm:leading-5"
              >
                {Object.entries(aspectRatios).map(([ratio, configuration]) => {
                  const configurationRatio = configuration.ratio
                    ? `${configuration.ratio[0]} × ${configuration.ratio[1]} px`
                    : "Browser size";

                  return (
                    <Listbox.Option key={ratio} value={ratio}>
                      {({ selected, active }) => (
                        <div
                          className={classNames("flex items-center gap-3 py-1 px-2 w-full h-full", {
                            "bg-orange-300": selected,
                            "bg-orange-100": active,
                          })}
                        >
                          <configuration.icon className="w-6 h-6" />

                          <div className="flex flex-col">
                            <span className="text-xs flex-1 text-left whitespace-no-wrap">{configuration.name}</span>
                            <span className="text-xs text-gray-600 whitespace-no-wrap">{configurationRatio}</span>
                          </div>
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

export const SelectorCarretIcon: React.FC = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 20 20">
    <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);
