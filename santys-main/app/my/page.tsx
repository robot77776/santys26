"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MyPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("key");

    if (!token) {
      setError("В личной ссылке отсутствует ключ. Проверь, что скопировал ссылку полностью.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(
          "/api/me?key=" + encodeURIComponent(token!),
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Не удалось открыть личную страницу."
          );
        }

        setData(result);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Ошибка соединения. Попробуй открыть ссылку ещё раз."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => controller.abort();
  }, []);

  return (
    <main className="shell">
      <header className="top">
        <Link className="link" href="/">
          ← На главную
        </Link>
        <div className="brand">SECRET SANTA</div>
      </header>

      <section className="panel">
        <div className="ornament" style={{ textAlign: "center" }}>
          🎁
        </div>

        {loading ? (
          <p className="muted" style={{ textAlign: "center" }}>
            Загружаем твою страницу...
          </p>
        ) : error ? (
          <>
            <h2>Не удалось открыть результат</h2>
            <div className="notice error">{error}</div>
            <p className="muted">
              Если ссылка сохранена полностью, попробуй открыть её позднее.
              Если ошибка повторяется, обратись к организатору.
            </p>
          </>
        ) : data ? (
          <>
            <h2 style={{ textAlign: "center" }}>
              Привет, {data.name}!
            </h2>

            {data.drawn ? (
              <>
                <p className="muted" style={{ textAlign: "center" }}>
                  Твой подарок предназначен для:
                </p>

                <div className="secret">{data.recipient}</div>

                <div className="notice">
                  🤫 Это секрет! Не показывай эту страницу другим участникам.
                </div>

                <h3>Пожелания получателя</h3>

                <p className="muted">
                  <b>Хочет:</b> {data.recipientWishes || "Пожеланий нет"}
                </p>

                <p className="muted">
                  <b>Не хочет:</b> {data.recipientAvoid || "Не указано"}
                </p>

                <p className="muted">
                  <b>Дополнительно:</b>{" "}
                  {data.recipientNotes || "Нет дополнительных пожеланий"}
                </p>
              </>
            ) : (
              <div className="notice">
                Ты зарегистрирован(а)! Жеребьёвка ещё не проведена.
                Сохрани эту ссылку и загляни сюда позже.
              </div>
            )}
          </>
        ) : null}
      </section>
    </main>
  );
}
