import Link from "next/link";
import ParticipantCount from "./components/participant-count";

export default function Home() {
  return <main className="shell">
    <header className="top"><div className="brand">✦ SECRET SANTA</div><nav className="nav"><Link href="/register">Регистрация</Link><Link href="/admin">Организатор</Link></nav></header>
    <section className="hero"><div className="eyebrow">Новогодняя игра • 2026</div><div className="ornament">🎁</div><h1>Тайный Санта</h1><p>Подарим друг другу немного новогоднего волшебства. Зарегистрируйся, дождись жеребьёвки и узнай, кому предстоит подготовить сюрприз.</p></section>
    <section className="panel"><ParticipantCount/><h2>Как это работает?</h2><div className="grid"><div className="stat"><strong>01</strong><span>Зарегистрируйся</span></div><div className="stat"><strong>02</strong><span>Дождись жеребьёвки</span></div><div className="stat"><strong>03</strong><span>Узнай своего получателя</span></div><div className="stat"><strong>04</strong><span>Подготовь подарок</span></div></div><div className="notice">🎄 Бюджет подарка: <b className="budget">500 рублей</b>. Имя получателя увидишь только ты.</div><Link className="btn" href="/register" style={{display:"block",textAlign:"center",textDecoration:"none"}}>Принять участие 🎅</Link></section>
    <p className="footer">Пусть подарки будут неожиданными, а настроение — праздничным ✨</p>
  </main>;
}
