"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import PinForm from "./PinForm";
import type { NewPin } from "./PinForm";
import PinCard from "./PinCard";

type Trip = {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  travellers: string;
  tripType: string;
};

type Pin = NewPin & {
  id: string;
  status: "captured" | "saved" | "scheduled";
  scheduledDate?: string;
  scheduledTime?: string;
};

const TRIP_KEY = "trip-pin-trip";
const PINS_KEY = "trip-pin-pins";

const inputClass =
  "mt-2 w-full min-w-0 rounded-xl border border-slate-300 bg-white p-3";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedTrip = localStorage.getItem(TRIP_KEY);

      if (savedTrip) {
        const parsed = JSON.parse(savedTrip);

        if (
          parsed &&
          [
            "name",
            "destination",
            "startDate",
            "endDate",
            "travellers",
            "tripType",
          ].every((key) => typeof parsed[key] === "string")
        ) {
          setTrip(parsed);
        } else {
          throw new Error("Invalid trip data");
        }
      }

      const savedPins = localStorage.getItem(PINS_KEY);

      if (savedPins) {
        const parsed = JSON.parse(savedPins);

        if (
          Array.isArray(parsed) &&
          parsed.every(
            (pin) =>
              pin &&
              typeof pin.id === "string" &&
              typeof pin.title === "string" &&
              typeof pin.url === "string" &&
              typeof pin.notes === "string" &&
              ["captured", "saved", "scheduled"].includes(pin.status) &&
              (pin.scheduledDate === undefined ||
                typeof pin.scheduledDate === "string") &&
              (pin.scheduledTime === undefined ||
                typeof pin.scheduledTime === "string")
          )
        ) {
          setPins(parsed);
        } else {
          throw new Error("Invalid pin data");
        }
      }
    } catch {
      setError("Some saved data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  function persistPins(updatedPins: Pin[]) {
    try {
      localStorage.setItem(PINS_KEY, JSON.stringify(updatedPins));
      setPins(updatedPins);
      setError("");
    } catch {
      setError("Could not save your changes. Please try again.");
    }
  }

  function createTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const newTrip: Trip = {
      name: String(data.get("name") ?? "").trim(),
      destination: String(data.get("destination") ?? "").trim(),
      startDate: String(data.get("startDate") ?? ""),
      endDate: String(data.get("endDate") ?? ""),
      travellers: String(data.get("travellers") ?? "").trim(),
      tripType: String(data.get("tripType") ?? ""),
    };

    if (!newTrip.name || !newTrip.destination) {
      setError("Please enter a trip name and destination.");
      return;
    }

    if (
      !newTrip.startDate ||
      !newTrip.endDate ||
      newTrip.endDate < newTrip.startDate
    ) {
      setError("Please enter valid trip dates, with the end on or after the start.");
      return;
    }

    try {
      localStorage.setItem(TRIP_KEY, JSON.stringify(newTrip));
      setTrip(newTrip);
      setShowForm(false);
      setError("");
    } catch {
      setError("Could not save the trip. Check your browser storage settings.");
    }
  }

  function addPin(newPin: NewPin) {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(newPin.url);
    } catch {
      setError("Please enter a valid website link.");
      return;
    }

    if (!["https:", "http:"].includes(parsedUrl.protocol)) {
      setError("Please use a link beginning with https:// or http://.");
      return;
    }

    const pin: Pin = {
      ...newPin,
      url: parsedUrl.href,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      status: "captured",
    };

    persistPins([pin, ...pins]);
  }

  function savePin(id: string) {
    persistPins(
      pins.map((pin): Pin =>
        pin.id === id && pin.status === "captured"
          ? { ...pin, status: "saved" }
          : pin
      )
    );
  }

  function schedulePin(id: string, date: string, time: string) {
    if (!trip || !date || date < trip.startDate || date > trip.endDate) {
      setError("Choose a date within your trip.");
      return;
    }

    persistPins(
      pins.map((pin): Pin =>
        pin.id === id && pin.status === "saved"
          ? {
              ...pin,
              status: "scheduled",
              scheduledDate: date,
              scheduledTime: time,
            }
          : pin
      )
    );
  }

  const capturedPins = pins.filter((pin) => pin.status === "captured");
  const savedPins = pins.filter((pin) => pin.status === "saved");

  const scheduledPins = pins
    .filter((pin) => pin.status === "scheduled")
    .sort((a, b) => {
      const dateOrder = (a.scheduledDate ?? "").localeCompare(
        b.scheduledDate ?? ""
      );

      if (dateOrder !== 0) return dateOrder;

      return (a.scheduledTime || "99:99").localeCompare(
        b.scheduledTime || "99:99"
      );
    });

  const itineraryDates = Array.from(
    new Set(scheduledPins.map((pin) => pin.scheduledDate ?? ""))
  );

  function renderCard(pin: Pin) {
    return (
      <PinCard
        key={pin.id}
        title={pin.title}
        url={pin.url}
        notes={pin.notes}
        status={pin.status}
        startDate={trip?.startDate}
        endDate={trip?.endDate}
        scheduledDate={pin.scheduledDate}
        scheduledTime={pin.scheduledTime}
        onSave={() => savePin(pin.id)}
        onSchedule={(date, time) => schedulePin(pin.id, date, time)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold">Trip Pin</h1>
        <p className="mt-2 text-slate-600">
          Collect ideas. Plan your adventure.
        </p>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          {loading ? (
            <p className="text-slate-600">Loading your trip…</p>
          ) : trip ? (
            <>
              <p className="text-sm font-medium text-emerald-700">
                Saved in this browser
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{trip.name}</h2>

              <dl className="mt-6 space-y-4">
                <div>
                  <dt className="text-sm text-slate-500">Destination</dt>
                  <dd className="font-medium">{trip.destination}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Dates</dt>
                  <dd>{trip.startDate} to {trip.endDate}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Who’s going?</dt>
                  <dd>{trip.travellers || "Not added yet"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Trip type</dt>
                  <dd>{trip.tripType || "Not chosen yet"}</dd>
                </div>
              </dl>

              <PinForm onAdd={addPin} />

              <section className="mt-8">
                <h3 className="text-lg font-semibold">
                  Captured ideas ({capturedPins.length})
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Interesting possibilities you haven’t selected yet.
                </p>
                {capturedPins.length === 0 ? (
                  <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    No captured ideas. Add a link above.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {capturedPins.map(renderCard)}
                  </div>
                )}
              </section>

              <section className="mt-8 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold">
                  Saved to trip ({savedPins.length})
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Selected for the trip, but not scheduled yet.
                </p>
                {savedPins.length === 0 ? (
                  <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    Save a captured idea to see it here.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {savedPins.map(renderCard)}
                  </div>
                )}
              </section>

              <section className="mt-8 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold">
                  Itinerary ({scheduledPins.length})
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Your plans, organised by day and time.
                </p>

                {scheduledPins.length === 0 ? (
                  <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    Choose a day on a saved card to add it here.
                  </p>
                ) : (
                  <div className="mt-4 space-y-6">
                    {itineraryDates.map((date) => (
                      <section key={date}>
                        <h4 className="mb-3 font-semibold text-blue-900">
                          {date || "Date not set"}
                        </h4>
                        <div className="space-y-4">
                          {scheduledPins
                            .filter((pin) => (pin.scheduledDate ?? "") === date)
                            .map(renderCard)}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : showForm ? (
            <form onSubmit={createTrip}>
              <h2 className="text-xl font-semibold">New trip</h2>

              <label htmlFor="trip-name" className="mt-4 block text-sm font-medium">
                Trip name
              </label>
              <input
                id="trip-name"
                name="name"
                type="text"
                required
                placeholder="e.g. A week in Sicily"
                className={inputClass}
              />

              <label htmlFor="destination" className="mt-4 block text-sm font-medium">
                Destination
              </label>
              <input
                id="destination"
                name="destination"
                type="text"
                required
                placeholder="e.g. Sicily, Italy"
                className={inputClass}
              />

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label htmlFor="start-date" className="block text-sm font-medium">
                    Start date
                  </label>
                  <input
                    id="start-date"
                    name="startDate"
                    type="date"
                    required
                    className={inputClass}
                  />
                </div>
                <div className="min-w-0">
                  <label htmlFor="end-date" className="block text-sm font-medium">
                    End date
                  </label>
                  <input
                    id="end-date"
                    name="endDate"
                    type="date"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <label htmlFor="travellers" className="mt-4 block text-sm font-medium">
                Who’s going?
              </label>
              <input
                id="travellers"
                name="travellers"
                type="text"
                placeholder="Names, separated by commas"
                className={inputClass}
              />

              <label htmlFor="trip-type" className="mt-4 block text-sm font-medium">
                What kind of trip?
              </label>
              <select
                id="trip-type"
                name="tripType"
                defaultValue=""
                className={inputClass}
              >
                <option value="">Choose a trip type</option>
                <option value="City break">City break</option>
                <option value="Beach / relaxation">Beach / relaxation</option>
                <option value="Road trip">Road trip</option>
                <option value="Food and culture">Food and culture</option>
                <option value="Outdoors / adventure">Outdoors / adventure</option>
                <option value="A bit of everything">A bit of everything</option>
                <option value="Other">Other</option>
              </select>

              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
              >
                Create trip
              </button>
            </form>
          ) : (
            <>
              <h2 className="text-xl font-semibold">No trips yet</h2>
              <p className="mt-2 text-slate-600">
                Start with a destination, then collect places, hotels,
                and things to do.
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
              >
                Create your first trip
              </button>
            </>
          )}

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              {error}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}