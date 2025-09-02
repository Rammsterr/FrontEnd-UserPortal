# 🛍️ User Portal – React‑frontend

Detta är en React‑app för användarportal med registrering, inloggning och profilvy. Appen använder JWT‑token som lagras i `localStorage` och HashRouter för enkel hosting (t.ex. GitHub Pages/Blob Static Website). Det finns även förberedda sidor för en framtida produktkatalog.

## Innehåll
- Översikt och funktioner
- Tekniker
- Kom igång (installation och start)
- Miljövariabler och API‑endpoints
- Routing
- Produktfunktioner (förberedda)
- Tillgänglighet och UX
- Scripts
- Projektstruktur

## Översikt och funktioner
- Skapa konto (registrering)
- Logga in och spara JWT i `localStorage`
- Visa användarprofil när token finns
- Logga ut med rensning av token
- Växling mellan login/registrering via komponenten `AuthSwitch`
- Header med snabblänk till inloggning samt temaväxling
- Förberedda produktvyer (lista, detaljer, admin‑form)

## Tekniker
- React (Create React App)
- react‑router‑dom v6 med HashRouter
- TypeScript
- Enkel CSS (App.css, Authform.css)

## Kom igång
1. Installera beroenden:
   ```bash
   npm install
   ```
2. Starta utvecklingsserver:
   ```bash
   npm start
   ```
3. Öppna http://localhost:3000

## Miljövariabler och API‑endpoints
Användartjänst (User Service):
- Login: `POST http://localhost:8080/auth/login` (se `src/components/Login/Login.tsx`)
- Appen förväntar sig `accessToken` i svaret och lagrar den i `localStorage` som `token`.
- Profilendpoints konsumeras från `UserProfile` (se komponenten) och använder token i Authorization‑header.

Produktjänst (förberedd):
- Bas‑URL (om/när den används): `REACT_APP_PRODUCT_API_BASE_URL` (t.ex. `http://localhost:8081`)

## Routing
All routing sker med HashRouter.
- `#/` –
  - Inloggad: visar `UserProfile` och en "Logga ut"‑knapp
  - Utloggad: visar `AuthSwitch` som låter dig växla mellan Registrering och Login
- `#/products` – produktlista
- `#/products/:id` – produktdetaljer
- `#/admin/products/new` – formulär för ny produkt (framtida adminflöde)

Se `src/App.tsx` och `src/components/Header.tsx` för navigationslogik.

## Produktfunktioner (förberedda)
Koden finns under `src/features/products/`:
- ProductList.tsx – lista
- ProductDetails.tsx – detaljer
- ProductForm.tsx – skapa/redigera (admin framöver)
- ProductSearch.tsx – sök (stub)
- ProductInventory.tsx – lager (stub)
- ProductImageUpload.tsx – bilduppladdning (stub)
- productService.ts – API‑stubs (REST)

## Tillgänglighet och UX
- Landmärken: `<main role="main">` och semantisk header/footer
- Tydlig knapp för "Logga ut" som endast visas när token finns
- Textfeedback vid autentiseringsflöden
- Tema‑växling via `ThemeToggle` (i Header)

## Scripts
- `npm start` – startar dev‑server
- `npm run build` – bygger produktion
- `npm test` – startar testkörning (CRA standard)

## Projektstruktur (utdrag)
- `src/App.tsx` – appens rot, routes och villkorad vy baserat på token
- `src/components/Header.tsx` – titel, navigation, login/logga‑ut och tema
- `src/components/AuthSwitch.tsx` – växlar mellan Login och Register
- `src/components/Login/Login.tsx` – loginflöde mot `/auth/login`
- `src/components/Register.tsx` – registreringsflöde
- `src/components/UserProfile.tsx` – profilvy för inloggad användare
- `src/features/products/*` – produktrelaterade sidor (förberedda)

## Notiser
- Rollen (admin/user) kan komma från backend men exponeras inte nödvändigtvis i UI.
- HashRouter används för att undvika serverkonfiguration vid statisk hosting.