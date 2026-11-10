import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
async function gateway(path:string,key:string,method="GET",body?:unknown){
 const api=process.env['LOVABLE_API_KEY']; if(!api||!key)throw new Error("Ligação Google indisponível");
 const response=await fetch(`https://connector-gateway.lovable.dev/${path}`,{method,headers:{Authorization:`Bearer ${api}`,"X-Connection-Api-Key":key,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
 if(!response.ok){const text=await response.text();console.error(`Google [${response.status}]: ${text}`);throw new Error(`Google [${response.status}]: ${text}`);}return response.json();
}
export const configureWorkspace=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator(d=>z.object({spreadsheetId:z.string().regex(/^[a-zA-Z0-9_-]+$/).optional()}).parse(d)).handler(async({data,context})=>{
 const {data:partner}=await context.supabase.rpc("is_partner",{_id:context.userId});if(!partner)throw new Error("Área exclusiva dos sócios");
 const driveKey=process.env['GOOGLE_DRIVE_API_KEY'];const sheetKey=process.env['GOOGLE_SHEETS_API_KEY'];if(!driveKey||!sheetKey)throw new Error("Ligue Google Drive e Sheets");
 const about=await gateway("google_drive/drive/v3/about?fields=user(emailAddress)",driveKey);if(about.user?.emailAddress!=="agronutricaotrigosulda@gmail.com")throw new Error("O Drive deve pertencer à conta central agronutricaotrigosulda@gmail.com");
 const {supabaseAdmin}=await import("@/integrations/supabase/client.server");
 const {data:config}=await supabaseAdmin.from("workspace_config").select("*").eq("id",1).maybeSingle();
 let id=data.spreadsheetId??config?.spreadsheet_id;
 if(!id){const sheet=await gateway("google_sheets/v4/spreadsheets",sheetKey,"POST",{properties:{title:"Gestor de AgroEI"},sheets:[{properties:{title:"Consolidação anual"}}]});id=String(sheet.spreadsheetId);}
 await gateway(`google_sheets/v4/spreadsheets/${id}`,sheetKey);
 let folder=config?.root_folder_id;
 if(!folder){const created=await gateway("google_drive/drive/v3/files",driveKey,"POST",{name:"Agro-Nutrição Trigo — Gestão",mimeType:"application/vnd.google-apps.folder"});folder=String(created.id);}
 const {error}=await supabaseAdmin.from("workspace_config").upsert({id:1,spreadsheet_id:id,root_folder_id:folder});if(error)throw new Error(error.message);
 return {spreadsheetId:id,folderId:folder};
});
export const syncProjectSheets=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data:partner}=await context.supabase.rpc("is_partner",{_id:context.userId});if(!partner)throw new Error("Área exclusiva dos sócios");
 const key=process.env['GOOGLE_SHEETS_API_KEY'];if(!key)throw new Error("Sheets não ligado");
 const {data:config}=await context.supabase.from("workspace_config").select("*").eq("id",1).maybeSingle();if(!config?.spreadsheet_id)throw new Error("Configure a planilha geral");
 const {data:projects,error}=await context.supabase.from("projects").select("id,name,sheet_range");if(error)throw error;
 const selected=(projects??[]).filter(p=>p.sheet_range);
 if(!selected.length)throw new Error("Indique o intervalo de cada projeto (três células: faturamento, saídas e lucro)");
 const url=new URL(`https://connector-gateway.lovable.dev/google_sheets/v4/spreadsheets/${config.spreadsheet_id}/values:batchGet`);for(const p of selected)if(p.sheet_range)url.searchParams.append("ranges",p.sheet_range);url.searchParams.set("valueRenderOption","UNFORMATTED_VALUE");
 const api=process.env['LOVABLE_API_KEY'];if(!api)throw new Error("Ligação indisponível");const response=await fetch(url,{headers:{Authorization:`Bearer ${api}`,"X-Connection-Api-Key":key}});if(!response.ok)throw new Error(`Google [${response.status}]: ${await response.text()}`);const values=await response.json() as {valueRanges?:{values?:unknown[][]}[]};
 const updates=selected.map((p,i)=>{const cells=values.valueRanges?.[i]?.values?.flat()??[];const numbers=cells.slice(0,3).map(Number);const [revenue,expenses,profit]=numbers;if(cells.length<3||numbers.some(n=>!Number.isFinite(n))||revenue===undefined||expenses===undefined||profit===undefined||Math.abs(revenue-expenses-profit)>.01)throw new Error(`Valores inconsistentes no projeto ${p.name}`);return {id:p.id,revenue,expenses};});
 for(const p of updates){const {error}=await context.supabase.from("projects").update({revenue:p.revenue,expenses:p.expenses}).eq("id",p.id);if(error)throw error;}
 const {supabaseAdmin}=await import("@/integrations/supabase/client.server");await supabaseAdmin.from("workspace_config").update({last_synced_at:new Date().toISOString()}).eq("id",1);
 return {count:updates.length};
});