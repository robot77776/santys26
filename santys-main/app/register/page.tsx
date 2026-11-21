 "use client";
import { useState } from "react";
import Link from "next/link";

export default function Register() {
  const [name,setName]=useState(""); const [wishes,setWishes]=useState(""); const [avoid,setAvoid]=useState(""); const [notes,setNotes]=useState("");
  const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [result,setResult]=useState("");
  async function submit(e:React.FormEvent){e.preventDefault();setError("");setBusy(true);
    try {
      let regKey=localStorage.getItem("santa_registration_key");
      if(!regKey){regKey=crypto.randomUUID();localStorage.setItem("santa_registration_key",regKey);}
      const res=await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,wishes,avoid,notes,registrationKey:regKey})});
      const data=await res.json(); if(!res.ok) throw new Error(data.error||"Не удалось зарегистрироваться.");
      setResult(data.personalUrl); localStorage.setItem("santa_personal_url",data.personalUrl);
    } catch(err:any){setError(err.message||"Произошла ошибка.");} finally{setBusy(false);}
  }
  if(result) return <main className="shell"><header className="top"><Link className="link" href="/">← На главную</Link><div className="brand">SECRET SANTA</div></header><section className="panel"><div className="ornament" style={{textAlign:"center"}}>🎉</div><h2 style={{textAlign:"center"}}>Ты в игре!</h2><p className="muted" style={{textAlign:"center"}}>Сохрани личную ссылку. После жеребьёвки по ней можно будет узнать своего получателя. Не отправляй её другим людям.</p><div className="copy">{result}</div><button className="btn" style={{width:"100%",marginTop:14}} onClick={()=>navigator.clipboard.writeText(result)}>Скопировать личную ссылку</button><div className="notice">Важно: ссылка показывается сейчас один раз. Сохрани её в заметках или избранном.</div></section></main>;
  return <main className="shell"><header className="top"><Link className="link" href="/">← На главную</Link><div className="brand">SECRET SANTA</div></header><section className="panel"><div className="eyebrow">Регистрация участника</div><h2>Вступай в игру 🎅</h2><p className="muted">Заполни форму. Имя и фамилия обязательны, остальные поля помогут твоему Санте выбрать подарок.</p><form className="form" onSubmit={submit}>
    <div className="field"><label>Имя и фамилия *</label><input required maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="Например, Иван Иванов"/></div>
    <div className="field"><label>Что хотел бы получить?</label><textarea maxLength={1000} value={wishes} onChange={e=>setWishes(e.target.value)} placeholder="Например: кофе, настольную игру, сладости..."/></div>
    <div className="field"><label>Что не хотелось бы получить?</label><textarea maxLength={1000} value={avoid} onChange={e=>setAvoid(e.target.value)} placeholder="Например: кружки, носки..."/></div>
    <div className="field"><label>Дополнительные пожелания</label><textarea maxLength={1000} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Любые подсказки для твоего Тайного Санты..."/></div>
    <label className="checkbox"><input type="checkbox" required/>Я согласен(на), что мои имя и пожелания будут доступны организатору и моему Тайному Санте.</label>
    {error&&<div className="notice error">{error}</div>}<button className="btn" disabled={busy}>{busy?"Регистрируем...":"Зарегистрироваться 🎁"}</button>
    <div className="hint">Телефон и электронная почта не требуются. Бюджет подарка — 500 рублей.</div>
  </form></section></main>;
}
