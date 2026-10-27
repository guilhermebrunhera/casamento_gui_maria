import { list,get } from '@vercel/blob';
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({error:'Método não permitido'});
  const key=req.headers.authorization?.replace(/^Bearer\s+/i,'');
  if(!process.env.ADMIN_KEY || !key || key!==process.env.ADMIN_KEY)return res.status(401).json({error:'Não autorizado'});
  try {
    const records=[]; let cursor;
    do {
      const page=await list({prefix:'confirmacoes/',limit:1000,cursor});
      for(const item of page.blobs){
        const result=await get(item.pathname,{access:'private'});
        if(result?.statusCode===200) records.push(await new Response(result.stream).json());
      }
      cursor=page.hasMore?page.cursor:undefined;
    }while(cursor);
    records.sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
    if(req.query.formato==='csv'){
      res.setHeader('Content-Type','text/csv; charset=utf-8');
      res.setHeader('Content-Disposition','attachment; filename="confirmados.csv"');
      const esc=x=>'"'+String(x??'').replaceAll('"','""')+'"';
      return res.send('\uFEFFnome,slug,confirmadoEm\n'+records.map(r=>[r.nome,r.slug,r.confirmadoEm].map(esc).join(',')).join('\n'));
    }
    return res.status(200).json({total:records.length,confirmados:records});
  }catch(e){console.error(e);return res.status(500).json({error:'Falha ao consultar confirmações'});}
}
