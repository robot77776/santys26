"use client";

import { useEffect, useState } from "react";

type Participant = {
  id: string;
  name: string;
  wishes: string | null;
  avoid: string | null;
  notes: string | null;
};

type Pair = {
  giver: string;
  recipient: string;
};

export default function Admin() {
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);
  const [items, setItems] = useState<Participant[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [showPairs, setShowPairs] = useState(false);

  async function call(path: string, method = "GET", body?: any) {
    const response = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Ошибка запроса");
    }

    return data;
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setBusy(true);

    try {
      await call("/api/admin/login", "POST", { password });
      setLogged(true);
      setPassword("");
    } catch (error: any) {
      setMsg(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    const data = await call("/api/admin/participants");

    setItems(data.participants || []);
    setPairs(data.pairs || []);
    setStatus(data.status);
  }

  async function action(type: string) {
    const question =
      type === "draw"
        ? "Провести жеребьёвку? После этого изменить пары будет нельзя."
        : "Закрыть регистрацию?";

    if (!confirm(question)) return;

    setBusy(true);
    setMsg("");

    try {
      const data = await call(
        type === "draw" ? "/api/admin/draw" : "/api/admin/close",
        "POST",
        {}
      );

      setMsg(data.message);
      await refresh();
    } catch (error: any) {
      setMsg(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteParticipant(person: Participant) {
    if (
      !confirm(
        `Удалить участника «${person.name}»? Это действие нельзя отменить.`
      )
    ) {
      return;
    }

    setBusy(true);
    setMsg("");

    try {
      const data = await call(
        "/api/admin/participants",
        "DELETE",
        { id: person.id }
      );

      setMsg(data.message);
      await refresh();
    } catch (error: any) {
      setMsg(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);

    try {
      await call("/api/admin/logout", "POST");
      setLogged(false);
      setItems([]);
      setPairs([]);
      setStatus(null);
      setMsg("");
    } catch (error: any) {
      setMsg(error.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (logged) {
      refresh().catch((error: any) => {
        setMsg(error.message || "Не удалось загрузить участников.");
      });
    }
  }, [logged]);

  const filteredItems = items.filter((person) =>
    person.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  if (!logged) {
    return (
      <main className="shell">
        <div className="top">
          <div className="brand">SECRET SANTA / ADMIN</div>
          <a className="link" href="/">
            На главную
          </a>
        </div>

        <section className="panel">
          <h2>Панель организатора</h2>
          <p className="muted">
            Введи пароль администратора, заданный в настройках Vercel.
          </p>

          <form className="form" onSubmit={login}>
            <div className="field">
              <label>Пароль администратора</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {msg && <div className="notice error">{msg}</div>}

            <button className="btn" disabled={busy}>
              {busy ? "Входим..." : "Войти"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <div className="top">
        <div className="brand">SECRET SANTA / ADMIN</div>
        <button
          className="btn secondary"
          disabled={busy}
          onClick={logout}
        >
          Выйти
        </button>
      </div>

      <section className="panel">
        <h2>Управление игрой</h2>

        <div className="grid">
          <div className="stat">
            <strong>{items.length}</strong>
            <span>Участников</span>
          </div>

          <div className="stat">
            <strong>
              {status?.registration_open ? "Открыта" : "Закрыта"}
            </strong>
            <span>Регистрация</span>
          </div>

          <div className="stat">
            <strong>{status?.drawn ? "Проведена" : "Не проведена"}</strong>
            <span>Жеребьёвка</span>
          </div>
        </div>

        <div className="row">
          <button
            className="btn secondary"
            disabled={busy || !status?.registration_open}
            onClick={() => action("close")}
          >
            Закрыть регистрацию
          </button>

          <button
            className="btn"
            disabled={
              busy ||
              status?.drawn ||
              items.length < 2 ||
              status?.registration_open
            }
            onClick={() => action("draw")}
          >
            Провести жеребьёвку 🎁
          </button>
        </div>

        {status?.drawn && (
          <button
            className="btn"
            style={{ width: "100%", marginTop: 14 }}
            onClick={() => setShowPairs(!showPairs)}
          >
            {showPairs ? "Скрыть распределение" : "Посмотреть распределение пар"}
          </button>
        )}

        {msg && <div className="notice">{msg}</div>}

        <p className="muted">
          Полное распределение доступно только организатору.
          Участники видят исключительно своего получателя.
        </p>
      </section>

      {showPairs && status?.drawn && (
        <section className="panel">
          <h2>Распределение пар ({pairs.length})</h2>

          {pairs.length === 0 ? (
            <p className="muted">Распределение не найдено.</p>
          ) : (
            <>
              {pairs.map((pair, index) => (
                <div className="participant" key={index}>
                  <div>
                    <b>{pair.giver}</b>
                    <div className="small">Дарит подарок → {pair.recipient}</div>
                  </div>
                </div>
              ))}

              <button
                className="btn secondary"
                style={{ width: "100%", marginTop: 14 }}
                onClick={() =>
                  navigator.clipboard.writeText(
                    pairs
                      .map(
                        (pair, index) =>
                          `${index + 1}. ${pair.giver} → ${pair.recipient}`
                      )
                      .join("\n")
                  )
                }
              >
                Скопировать все пары
              </button>
            </>
          )}
        </section>
      )}

      <section className="panel">
        <h2>Участники ({items.length})</h2>

        <div className="field">
          <label>Поиск участника</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Введи имя или фамилию..."
          />
        </div>

        {filteredItems.length === 0 ? (
          <p className="muted">Участники не найдены.</p>
        ) : (
          filteredItems.map((person, index) => (
            <div className="participant" key={person.id}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b>
                  {index + 1}. {person.name}
                </b>

                <div className="small">
                  <b>Хочет:</b> {person.wishes || "—"}
                </div>

                <div className="small">
                  <b>Не хочет:</b> {person.avoid || "—"}
                </div>

                {person.notes && (
                  <div className="small">
                    <b>Дополнительно:</b> {person.notes}
                  </div>
                )}
              </div>

              {!status?.drawn && (
                <button
                  className="btn secondary"
                  disabled={busy}
                  onClick={() => deleteParticipant(person)}
                >
                  Удалить
                </button>
              )}
            </div>
          ))
        )}
      </section>
    </main>
  );
}
