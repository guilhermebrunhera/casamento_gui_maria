import { get, put } from '@vercel/blob';
import convidados from '../convidados.json' with { type: 'json' };

const slugOk = s => typeof s === 'string' && /^[a-z0-9-]{2,80}$/.test(s) && Object.hasOwn(convidados, s);
const caminho = slug => `confirmacoes/${slug}.json`;
const respond = (res, status, value) => { res.setHeader('Cache-Control','no-store'); return res.status(status).json(value); };
async function confirmado(slug) {
  const file = await get(caminho(slug), { access: 'private', useCache: false });
  return file?.statusCode === 200;
}
export default async function handler(req,res){
  if(!['GET','POST'].includes(req.method)) return respond(res,405,{error:'Método não permitido'});
  const slug = req.method === 'GET' ? req.query.slug : req.body?.slug;
  if(!slugOk(slug)) return respond(res,404,{error:'Convite não encontrado. Confira seu link.'});
  if(!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) return respond(res,503,{error:'Armazenamento ainda não configurado.'});
  try {
    if(req.method === 'GET') return respond(res,200,{nome:convidados[slug],confirmado:await confirmado(slug)});
    if(await confirmado(slug)) return respond(res,200,{nome:convidados[slug],confirmado:true});
    await put(caminho(slug), JSON.stringify({slug,nome:convidados[slug],confirmadoEm:new Date().toISOString()}),{access:'private',contentType:'application/json',addRandomSuffix:false,allowOverwrite:false});
    return respond(res,200,{nome:convidados[slug],confirmado:true});
  } catch(e) {
    if(e?.code === 'blob_already_exists' || /already exists/i.test(e.message || '')) return respond(res,200,{nome:convidados[slug],confirmado:true});
    console.error('RSVP failed',e); return respond(res,500,{error:'Não conseguimos registrar agora. Tente novamente.'});
  }
}
