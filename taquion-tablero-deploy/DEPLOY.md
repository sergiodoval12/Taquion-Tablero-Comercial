# Deploy Taquion Tablero Comercial a Netlify

## Opcion 1: Deploy rapido (1 comando)

Abri la terminal, navega a esta carpeta y ejecuta:

```bash
npx -y @netlify/mcp@latest --site-id 34cb0017-2fcc-4f94-a4f7-9759c12116b1 --proxy-path "https://netlify-mcp.netlify.app/proxy/eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..IiPTQYwSyBQx_tnH.m98uVDJK8Bd7c_Kt5eg8yKZ2YK2OpfwHntuYdapUVi_PJFKRCK4NAY_dMhy1Ax0jw9ndIMRp7wG0cxeA9exSmhkYrZs7P0MFHQ9SLruOOYDdOi3cuazsGHU-gkBNZ5TncOAA8CtjQo4p0RBYNUtyAhpQ0IXnvem70NAYxHH0z-QPQSKJuBT_JLoh2AzsEjUXdr1FRpP8Smc9Z-FAtQ22PVvmxGqSp8QWp4CiyEE_Cn2TCbWTv8Xx5-ANiiTTwd7dU0K_0THmKhVcMX59yxajLHZpZfaLlIZ8_DROleY6CDeQNAZsFeRntBbAKU10vY75mbLmxcp4NC-vMMGsdLdN1y81aOyo6oy-s5BzbWVjJz-TaF041A.6zQzurdpl6j_k-WoLi0x3w"
```

## Opcion 2: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify link --id 34cb0017-2fcc-4f94-a4f7-9759c12116b1
netlify deploy --prod
```

## URL del sitio

Una vez deployado: https://taquion-tablero-comercial.netlify.app

## Variables de entorno

Ya configurada en Netlify:
- NOTION_API_KEY (secret)

## Login del tablero

- Usuario: taquion
- Clave: comercial2026
