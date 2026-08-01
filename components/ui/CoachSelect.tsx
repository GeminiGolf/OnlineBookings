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
  const selected = coaches.find((c) => c.id === value) ?? null;

  return (
    <Listbox
      value={selected}
      onChange={(coach) => {
        if (!coach) return;
        onChange(coach.id);
      }}
    >
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-pointer rounded-2xl border border-[#3A5D49] bg-[#FBF8F3] px-5 py-3 text-left shadow-sm transition hover:border-[#21402E] focus:outline-none">
          <span className="block truncate dashboard-label normal-case tracking-[0.02em] text-[#2F5A43]">
            {selected
              ? selected.preferred_name || selected.name
              : "Choose a coach"}
          </span>

          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <ChevronUpDownIcon className="h-5 w-5 text-[#2F5A43]" />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-1"
        >
          <Listbox.Options className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-[#3A5D49] bg-[#FBF8F3] p-2 shadow-xl focus:outline-none">
            {coaches.map((coach) => (
              <Listbox.Option
                key={coach.id}
                value={coach}
                className={({ active, selected }) =>
                  `relative cursor-pointer rounded-xl px-4 py-3 transition ${
                    selected
                      ? "bg-[#21402E] text-white"
                      : active
                      ? "bg-[#EEF3EF] text-[#21402E]"
                      : "text-[#2F5A43]"
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block dashboard-label normal-case tracking-[0.02em] ${
                        selected ? "text-white pr-6" : "text-[#2F5A43]"
                      }`}
                    >
                      {coach.preferred_name || coach.name}
                    </span>

                    {selected && (
                      <span className="absolute inset-y-0 right-4 flex items-center">
                        <CheckIcon className="h-5 w-5 text-white" />
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