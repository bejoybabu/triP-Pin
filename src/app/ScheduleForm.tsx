"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type ScheduleFormProps = {
  startDate: string;
  endDate: string;
  onSchedule: (date: string, time: string) => void;
};

export default function ScheduleForm({
  startDate,
  endDate,
  onSchedule,
}: ScheduleFormProps) {
  const [date, setDate] = useState(startDate);
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  const inputClass =
    "mt-2 w-full min-w-0 rounded-xl border border-slate-300 bg-white p-3";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!date || date < startDate || date > endDate) {
      setError("Choose a date within your trip.");
      return;
    }

    setError("");
    onSchedule(date, time);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-xl bg-slate-50 p-4"
    >
      <h5 className="font-medium">When would you like to go?</h5>

      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block min-w-0 text-sm font-medium">
          Day
          <input
            type="date"
            required
            min={startDate}
            max={endDate}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block min-w-0 text-sm font-medium">
          Time (optional)
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="mt-4 w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white"
      >
        Add to itinerary
      </button>
    </form>
  );
}