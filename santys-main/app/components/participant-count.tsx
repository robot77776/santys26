"use client";

import { useEffect, useState } from "react";

export default function ParticipantCount() {
  const [count, setCount] = useState<number | null>(null);
  const [open, setOpen] = useState<boolean | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch("/api/count", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Ошибка загрузки");
        }

        if (active) {
          setCount(Number(data.count) || 0);
          setOpen(
            typeof data.registrationOpen === "boolean"
              ? data.registrationOpen
              : null
          );
          setError(false);
        }
      } catch {
        if (active) {
          setError(true);
        }
      }
    };

    load();

    const timer = window.setInterval(load, 30000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const label =
    count === null
      ? "Участников"
      : count === 1
      ? "участник зарегистрирован"
      : count > 1 && count < 5
      ? "участника зарегистрировано"
      : "участников зарегистрировано";

  return (
    <div className="participant-counter" aria-live="polite">
      <span className="counter-number">
        {count === null ? "—" : count}
      </span>

      <span className="counter-label">{label}</span>

      {open !== null && (
        <span
          className={`counter-status ${
            open ? "is-open" : "is-closed"
          }`}
        >
          {open ? "Регистрация открыта" : "Регистрация закрыта"}
        </span>
      )}

      {error && (
        <span className="counter-label">
          Не удалось обновить данные
        </span>
      )}
    </div>
  );
}
