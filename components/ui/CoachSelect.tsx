"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";

type Coach = {
  id: number;
  name: string;
  preferred_name?: string | null;
};

type Props = {
  coaches: Coach[];
  value: number | null;
  onChange: (id: number) => void;
};

export default function CoachSelect({
  coaches,
  value,
  onChange,
}: Props) {
  const selected =
    coaches.find((c) => c.id === value) ?? null;

  return (
    <Listbox
      value={selected}
      onChange={(coach) => {
        if (!coach) return;
        onChange(coach.id);
      }}
    >
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-pointer rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-left text-[14px] font-light tracking-[0.02em] text-black shadow-sm focus:outline-none">
          <span className="block truncate text-[13px] font-light tracking-[0.12em] leading-none">
            {selected
              ? selected.preferred_name || selected.name
              : "Choose a coach"}
          </span>

          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-500" />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-2 shadow-xl focus:outline-none">
            {coaches.map((coach) => (
              <Listbox.Option
                key={coach.id}
                value={coach}
                className={({ active, selected }) =>
                  `relative cursor-pointer px-4 py-1 transition ${
                    selected
                      ? "bg-[#21402E] text-white"
                      : active
                      ? "bg-gray-100"
                      : "text-black"
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block text-[14px] font-light tracking-[0.06em] leading-none ${
                        selected ? "pr-6" : ""
                      }`}
                    >
                      {coach.preferred_name || coach.name}
                    </span>

                    {selected && (
                      <span className="absolute inset-y-0 right-4 flex items-center">
                        <CheckIcon className="h-5 w-5" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}