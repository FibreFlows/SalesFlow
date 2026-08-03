"use client";

import { useEffect, useRef } from "react";

type GooglePlace = { formatted_address?: string };
type GoogleAutocomplete = { addListener: (event: string, callback: () => void) => void; getPlace: () => GooglePlace };
type GoogleWindow = Window & { google?: { maps: { places: { Autocomplete: new (input: HTMLInputElement, options: object) => GoogleAutocomplete } } } };

let mapsPromise: Promise<void> | null = null;
function loadGoogleMaps(key: string) {
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&v=weekly`;
    script.async = true; script.onload = () => resolve(); script.onerror = () => reject(new Error("Google Maps could not load"));
    document.head.appendChild(script);
  });
  return mapsPromise;
}

export function AddressAutocomplete({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!apiKey || !inputRef.current) return;
    let active = true;
    loadGoogleMaps(apiKey).then(() => {
      if (!active || !inputRef.current) return;
      const googleWindow = window as GoogleWindow;
      if (!googleWindow.google) return;
      const autocomplete = new googleWindow.google.maps.places.Autocomplete(inputRef.current, { fields: ["formatted_address"], componentRestrictions: { country: "ca" }, types: ["address"] });
      autocomplete.addListener("place_changed", () => { const address = autocomplete.getPlace().formatted_address; if (address) onChangeRef.current(address); });
    }).catch(() => undefined);
    return () => { active = false; };
  }, [apiKey]);

  return <input ref={inputRef} type="text" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" aria-label="Address" autoComplete="street-address" placeholder={apiKey ? "Start typing a Canadian address..." : "Service address"} value={value} onChange={(event) => onChange(event.target.value)} />;
}
