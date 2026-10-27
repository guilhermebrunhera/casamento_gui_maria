# RSVP — Maria Vitória & Guilherme

Casamento: **12 de dezembro de 2026**. Site compacto, responsivo, convites individuais e confirmações persistentes.

## 1. Personalizar convidados

Edite `convidados.json`: cada chave é o código de acesso do link e o valor é o nome exibido. Exemplo: `"bruno-8k2f": "Bruno"` corresponde a `https://SEU-SITE.vercel.app/bruno-8k2f`.

Utilize códigos **únicos** mesmo se houver dois convidados com o mesmo nome, como `maria-a8f2` e `maria-k4u9`. Evite códigos previsíveis se desejar dificultar confirmações por terceiros. Os três nomes incluídos são **exemplos** e devem ser revisados antes de compartilhar.

## 2. Publicar na Vercel

1. Crie um projeto a partir destes arquivos (por exemplo, envie-os a um repositório GitHub e importe em https://vercel.com/new), ou utilize `vercel deploy --prod` na pasta.
2. Crie um **Vercel Blob Store privado** no painel Vercel, na seção Storage, e conecte ao projeto. Garanta que `BLOB_STORE_ID` (integração OIDC) ou `BLOB_READ_WRITE_TOKEN` (modo token) esteja disponível para as Vercel Functions. Se necessário, redeploy após definir as variáveis.
3. Defina uma variável **ADMIN_KEY** forte, sigilosa, no ambiente de Production. Nunca coloque a chave no frontend, em URL pública ou Git.
4. Faça um teste de confirmação com um link de convidado e teste a consulta administrativa.

> `vercel.json` atende rotas `/codigo-do-convidado`. As APIs ficam em `/api/`.

## 3. Consultar confirmações

A lista é privada, pela API `GET /api/admin`, usando o header `Authorization: Bearer SUA_ADMIN_KEY`.

CSV para Excel: `GET /api/admin?formato=csv` com o mesmo header. Exemplo local:

```bash
curl -H 'Authorization: Bearer SUA_ADMIN_KEY' 'https://SEU-SITE.vercel.app/api/admin?formato=csv' -o confirmados.csv
```

As confirmações ficam em arquivos JSON privados separados, por convidado, no Vercel Blob. Um novo clique no mesmo convite não conta mais uma confirmação. A lista apresenta nome, código e data/hora de confirmação (UTC).

## Notas

- O convite único é uma **identificação por link**, não login: quem tiver o link consegue confirmar por esse convidado. Considere enviar por mensagem privada.
- Por simplicidade, a funcionalidade registra apenas **presença confirmada**, sem acompanhantes ou opção de recusa.
- O serviço Blob pode ter cotas e custos conforme o plano/uso; consulte os valores atuais antes de escalar.
- Requer o armazenamento configurado para funcionar de verdade. Sem ele, a API retorna erro e não finge confirmação.
