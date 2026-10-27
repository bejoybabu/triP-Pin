"use client";

import { useState } from "react";
import ScheduleForm from "./ScheduleForm";

type PinCardProps = {
  title: string;
  url: string;
  notes: string;
  status: "captured" | "saved" | "scheduled";
  onSave: () => void;
  startDate?: string;
  endDate?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  onSchedule?: (date: string, time: string) => void;
};

export default function PinCard({
  title,
  url,
  notes,
  status,
  onSave,
  startDate,
  endDate,
  scheduledDate,
  scheduledTime,
  onSchedule,
}: PinCardProps) {
  const [showSchedule, setShowSchedule] = useState(false);

  const statusLabel = {
    captured: "Captured idea",
    saved: "Saved to trip",
    scheduled: "In itinerary",
  };

  const statusStyle = {
    captured: "bg-amber-50 text-amber-800",
    saved: "bg-emerald-50 text-emerald-800",
    scheduled: "bg-blue-50 text-blue-800",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyle[status]}`}
      >
        {statusLabel[status]}
      </span>

      <h4 className="mt-3 text-lg font-semibold">{title}</h4>

      {notes && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
          {notes}
        </p>
      )}

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-sm font-medium text-blue-700 underline"
      >
        Open original link ↗
      </a>

      {status === "captured" && (
        <button
          type="button"
          onClick={onSave}
          className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
        >
          Save to trip
        </button>
      )}

      {status === "saved" && (
        <>
          <p className="mt-4 text-sm text-slate-500">
            Selected for this trip, but not scheduled yet.
          </p>

          {startDate && endDate && onSchedule && (
            <>
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                aria-expanded={showSchedule}
                className="mt-4 w-full rounded-xl border border-blue-700 px-4 py-3 font-semibold text-blue-700"
              >
                {showSchedule ? "Cancel scheduling" : "Choose a day"}
              </button>

              {showSchedule && (
                <ScheduleForm
                  startDate={startDate}
                  endDate={endDate}
                  onSchedule={onSchedule}
                />
              )}
            </>
          )}
        </>
      )}

      {status === "scheduled" && scheduledDate && (
        <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
          {scheduledDate}
          {scheduledTime ? ` at ${scheduledTime}` : " · Time not set"}
        </p>
      )}
    </article>
  );
}