"use client";

import { useEffect, useRef, useState } from "react";

// Seletor de horário customizado (substitui o <input type="time"> nativo, que
// no Windows/Chrome abre um dropdown branco que destoa do tema escuro).
// Mostra um botão com "HH:MM" e, ao clicar, abre um popover com duas colunas
// roláveis (horas e minutos) no visual escuro/laranja do app.

interface TimePickerProps {
  value: string; // formato "HH:MM"
  onChange: (value: string) => void;
  disabled?: boolean;
}

const pad = (n: number) => n.toString().padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad(i));

export default function TimePicker({
  value,
  onChange,
  disabled,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hoursColRef = useRef<HTMLDivElement>(null);
  const minsColRef = useRef<HTMLDivElement>(null);

  const [hh = "00", mm = "00"] = value.split(":");

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Ao abrir, centraliza o valor selecionado em cada coluna.
  useEffect(() => {
    if (!open) return;
    const scrollTo = (col: HTMLDivElement | null, idx: number) => {
      if (!col) return;
      const item = col.children[idx] as HTMLElement | undefined;
      if (item) {
        col.scrollTop =
          item.offsetTop - col.clientHeight / 2 + item.clientHeight / 2;
      }
    };
    scrollTo(hoursColRef.current, parseInt(hh, 10) || 0);
    scrollTo(minsColRef.current, parseInt(mm, 10) || 0);
  }, [open, hh, mm]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-lg tabular-nums text-neutral-100 outline-none transition hover:border-neutral-600 focus:border-orange-500 disabled:opacity-50 data-[open=true]:border-orange-500"
        data-open={open}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>
          {hh}
          <span className="mx-0.5 text-neutral-500">:</span>
          {mm}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-500"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute left-0 top-full z-20 mt-2 flex overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl shadow-black/50"
        >
          <TimeColumn
            ref={hoursColRef}
            label="Hora"
            items={HOURS}
            selected={hh}
            onSelect={(h) => onChange(`${h}:${mm}`)}
          />
          <div className="w-px bg-neutral-800" aria-hidden="true" />
          <TimeColumn
            ref={minsColRef}
            label="Min"
            items={MINUTES}
            selected={mm}
            onSelect={(m) => onChange(`${hh}:${m}`)}
          />
        </div>
      )}
    </div>
  );
}

interface TimeColumnProps {
  label: string;
  items: string[];
  selected: string;
  onSelect: (value: string) => void;
}

function TimeColumn({
  label,
  items,
  selected,
  onSelect,
  ref,
}: TimeColumnProps & { ref: React.Ref<HTMLDivElement> }) {
  return (
    <div className="flex flex-col">
      <div className="border-b border-neutral-800 px-4 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div
        ref={ref}
        className="scrollbar-thin h-48 w-20 overflow-y-auto py-1"
      >
        {items.map((item) => {
          const isSelected = item === selected;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              className={
                "mx-1 my-0.5 flex w-[calc(100%-0.5rem)] justify-center rounded-md px-3 py-1.5 font-mono text-base tabular-nums transition " +
                (isSelected
                  ? "bg-orange-600 font-semibold text-white"
                  : "text-neutral-300 hover:bg-neutral-800 hover:text-white")
              }
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
