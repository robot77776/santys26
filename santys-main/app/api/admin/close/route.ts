import {NextResponse} from "next/server";
import {supabaseAdmin} from "@/lib/supabaseAdmin";
import {isAdmin} from "@/lib/security";
export const runtime="nodejs";
export async function POST(){
 if(!isAdmin())return NextResponse.json({error:"Нет доступа."},{status:401});
 const {data:s}=await supabaseAdmin.from("game_settings").select("drawn").eq("id",1).single();
 if(s?.drawn)return NextResponse.json({error:"Жеребьёвка уже проведена."},{status:409});
 const {error}=await supabaseAdmin.from("game_settings").update({registration_open:false}).eq("id",1);
 if(error)return NextResponse.json({error:error.message},{status:500});
 return NextResponse.json({message:"Регистрация закрыта. Теперь можно провести жеребьёвку."});
}
