import {NextResponse} from "next/server";
import crypto from "crypto";
import {supabaseAdmin} from "@/lib/supabaseAdmin";
import {isAdmin} from "@/lib/security";
export const runtime="nodejs";
function shuffle<T>(a:T[]){for(let i=a.length-1;i>0;i--){const j=crypto.randomInt(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
export async function POST(){
 if(!isAdmin())return NextResponse.json({error:"Нет доступа."},{status:401});
 const {data:settings}=await supabaseAdmin.from("game_settings").select("*").eq("id",1).single();
 if(!settings||settings.registration_open||settings.drawn)return NextResponse.json({error:"Сначала закрой регистрацию. Жеребьёвка может быть проведена только один раз."},{status:409});
 const {data:people,error}=await supabaseAdmin.from("participants").select("id");
 if(error||!people||people.length<2)return NextResponse.json({error:"Для жеребьёвки нужны минимум два участника."},{status:400});
 const ids=people.map(p=>p.id);let recipients:string[]|null=null;
 for(let attempt=0;attempt<10000;attempt++){const candidate=shuffle([...ids]);if(candidate.every((id,i)=>id!==ids[i])){recipients=candidate;break;}}
 if(!recipients)return NextResponse.json({error:"Не удалось сформировать пары. Попробуй ещё раз."},{status:500});
 const rows=ids.map((giver_id,i)=>({giver_id,recipient_id:recipients![i]}));
 const {error:insertError}=await supabaseAdmin.from("assignments").insert(rows);
 if(insertError)return NextResponse.json({error:"Не удалось сохранить жеребьёвку. Обратись к техническому администратору."},{status:500});
 const {error:updateError}=await supabaseAdmin.from("game_settings").update({drawn:true,drawn_at:new Date().toISOString()}).eq("id",1);
 if(updateError)return NextResponse.json({error:"Пары сохранены, но не удалось обновить статус игры. Обратись к администратору."},{status:500});
 return NextResponse.json({message:`Жеребьёвка завершена! Распределено участников: ${ids.length}. Пары скрыты от панели организатора.`});
}
