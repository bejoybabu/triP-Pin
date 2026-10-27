"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export type NewPin = {
  title: string;
  url: string;
  notes: string;
};

type PinFormProps = {
  onAdd: (pin: NewPin) => void;
};

export default function PinForm({ onAdd }: PinFormProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white p-3";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !url.trim()) return;

    onAdd({
      title: title.trim(),
      url: url.trim(),
      notes: notes.trim(),
    });

    setTitle("");
    setUrl("");
    setNotes("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t border-slate-200 pt-6">
      <h3 className="text-lg font-semibold">Capture an idea</h3>

      <label htmlFor="pin-url" className="mt-4 block text-sm font-medium">
        Link
      </label>
      <input
        id="pin-url"
        type="url"
        required
        placeholder="Paste a Maps, hotel, or website link"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        className={inputClass}
      />

      <label htmlFor="pin-title" className="mt-4 block text-sm font-medium">
        Title
      </label>
      <input
        id="pin-title"
        type="text"
        required
        placeholder="e.g. A seaside restaurant"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className={inputClass}
      />

      <label htmlFor="pin-notes" className="mt-4 block text-sm font-medium">
        Notes (optional)
      </label>
      <textarea
        id="pin-notes"
        rows={3}
        placeholder="What caught your eye?"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        className={inputClass}
      />

      <button
        type="submit"
        className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
      >
        Capture idea
      </button>
    </form>
  );
}