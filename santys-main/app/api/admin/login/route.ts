import {NextResponse} from "next/server";
import {isValidAdminPassword,makeAdminCookie} from "@/lib/security";
export async function POST(req:Request){
 const {password}=await req.json();
 if(!isValidAdminPassword(String(password||"")))return NextResponse.json({error:"Неверный пароль."},{status:401});
 const res=NextResponse.json({ok:true});
 res.cookies.set("santa_admin",makeAdminCookie(),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:60*60*8});
 return res;
}
