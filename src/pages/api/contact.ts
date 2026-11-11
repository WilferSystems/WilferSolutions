import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;
const allowedTypes = new Set(['support','advice','web','general']);
const buckets = new Map<string,{count:number;start:number}>();
const limit = (key:string) => {
  const now=Date.now(); const current=buckets.get(key);
  if(!current||now-current.start>10*60_000){buckets.set(key,{count:1,start:now});return true;}
  current.count++;return current.count<=5;
};
const json=(body:Record<string,string>,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
const clean=(value:string,max:number)=>value.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max);
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const origin=request.headers.get('origin');
  const host=request.headers.get('host');
  if(!origin||!host)return json({error:'Solicitud no válida.'},403);
  try{if(new URL(origin).host!==host)return json({error:'Solicitud no válida.'},403);}catch{return json({error:'Solicitud no válida.'},403);}
  if(!limit(clientAddress||'unknown'))return json({error:'Demasiadas consultas. Intentá nuevamente más tarde.'},429);
  const length=Number(request.headers.get('content-length')||0);
  if(length>16_384)return json({error:'El mensaje supera el tamaño permitido.'},413);
  const contentType=request.headers.get('content-type')||'';
  if(!contentType.includes('multipart/form-data')&&!contentType.includes('application/x-www-form-urlencoded'))return json({error:'Formato de solicitud no válido.'},415);
  let form:FormData;
  try{form=await request.formData();}catch{return json({error:'No se pudo leer el formulario.'},400);}
  if(String(form.get('website')||'').trim())return json({ok:'true'});
  const name=clean(String(form.get('name')||''),100);
  const email=clean(String(form.get('email')||''),254);
  const type=clean(String(form.get('type')||''),40);
  const subject=clean(String(form.get('subject')||''),160);
  const message=clean(String(form.get('message')||''),4000);
  if(name.length<2||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!allowedTypes.has(type)||subject.length<3||message.length<10)return json({error:'Revisá los campos e intentá nuevamente.'},400);
  const apiKey=import.meta.env.RESEND_API_KEY||process.env.RESEND_API_KEY;
  const from=import.meta.env.CONTACT_FROM||process.env.CONTACT_FROM;
  const to=import.meta.env.CONTACT_TO||process.env.CONTACT_TO||'wilfercabrera15@gmail.com';
  if(!apiKey||!from)return json({error:'El formulario todavía no está configurado para recibir mensajes.'},503);
  const labels:Record<string,string>={support:'Soporte técnico',advice:'Asesoramiento tecnológico',web:'Desarrollo web',general:'Consulta general'};
  try{
    const resend=new Resend(apiKey);
    const {error}=await resend.emails.send({from,to,replyTo:email,subject:`Consulta web: ${subject}`,text:`Nombre: ${name}\nCorreo: ${email}\nTipo: ${labels[type]}\n\n${message}`});
    if(error){console.error('Resend rejected contact submission:',error.name||'provider error');return json({error:'No se pudo enviar la consulta.'},502);}
    return json({ok:'true'});
  }catch(error){console.error('Contact delivery failed:',error instanceof Error?error.name:'unknown error');return json({error:'No se pudo enviar la consulta.'},502);}
};
