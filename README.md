# 🛍️ User Portal – React‑frontend

Detta är en React‑app för användarportal med registrering, inloggning och profilvy. Appen använder JWT‑token som lagras i `localStorage` och HashRouter för enkel hosting (t.ex. GitHub Pages/Blob Static Website). Efter senaste uppdateringen är produktdelen integrerad mot ett Spring Boot‑baserat ProductService (port 8081) med paginerad listning och skapande av produkter.

## Innehåll
- Översikt och funktioner
- Tekniker
- Kom igång (installation och start)
- Miljövariabler och API‑endpoints
- Routing
- Produktfunktioner
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
- Produktvyer: lista, detaljer och formulär för ny produkt (skapa)

## Tekniker
- React (Create React App)
- react‑router‑dom v6 med HashRouter
- TypeScript
- Enkel CSS (App.css, Authform.css)

## Kom igång
1. Installera beroenden:
   npm install
2. Sätt miljövariabler i en `.env` i projektroten vid behov:
   - REACT_APP_PRODUCT_API_BASE_URL=http://localhost:8081
3. Starta utvecklingsserver:
   npm start
4. Öppna http://localhost:3000

## Miljövariabler och API‑endpoints
Användartjänst (User Service):
- Login: `POST http://localhost:8080/auth/login` (se `src/components/Login/Login.tsx`)
- Appen förväntar sig `accessToken` i svaret och lagrar den i `localStorage` som `token`.
- Profilendpoints konsumeras från `UserProfile` (se komponenten) och använder token i Authorization‑header.

Produkttjänst (Spring Boot ProductService):
- Bas‑URL: miljövariabeln `REACT_APP_PRODUCT_API_BASE_URL` (default: `http://localhost:8081`)
- API‑basväg: `/api/products`
- Swagger UI: `http://localhost:8081/swagger-ui/index.html`
- Endpoints som används i frontend:
  - GET `GET {BASE}/api/products?page={page}&size={size}&sortBy={field}&sortDir=asc|desc` – paginerad lista (se `ProductList.tsx`)
  - GET `GET {BASE}/api/products/all` – hämta alla produkter
  - POST `POST {BASE}/api/products` – skapa ny produkt (kräver JWT i `Authorization: Bearer <token>`). Se `ProductForm.tsx`.
- Stöd som saknas i backend i nuläget (hanteras som stubbar i UI):
  - Uppdatera produkt
  - Ta bort produkt
  - Bilduppladdning (använd `imageUrls` vid skapande istället)

Sökning i UI sker klient‑side: `productService.searchProducts()` filtrerar namn lokalt tills ett backend‑sök finns.

## Routing
All routing sker med HashRouter.
- `#/` –
  - Inloggad: visar `UserProfile` och en "Logga ut"‑knapp
  - Utloggad: visar `AuthSwitch` som låter dig växla mellan Registrering och Login
- `#/products` – produktlista
- `#/products/:id` – produktdetaljer
- `#/admin/products/new` – formulär för ny produkt (framtida adminflöde)

Se `src/App.tsx` och `src/components/Header.tsx` för navigationslogik.

## Produktfunktioner
Koden finns under `src/features/products/`:
- ProductList.tsx – lista (använder paginerat API)
- ProductDetails.tsx – detaljer (hämtar via client‑side fallback tills GET /{id} finns)
- ProductForm.tsx – skapa ny produkt (POST /api/products). Uppdatering ej stödd ännu.
- ProductInventory.tsx – lager (framtida)
- ProductImageUpload.tsx – bilduppladdning (framtida; använd `imageUrls` tills dess)
- productService.ts – konkret integration mot Spring Boot ProductService

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

## Kända begränsningar / Notiser
- Produkt‑uppdatering, borttag och bilduppladdning saknas i backend just nu. UI visar tydliga felmeddelanden om du försöker använda dessa.
- Sökning i produktlistan är en enkel klient‑side filter i väntan på backend‑stöd.
- För att skapa produkter krävs att du är inloggad – token måste finnas i `localStorage` som `token`.
- HashRouter används för att undvika serverkonfiguration vid statisk hosting.

Senast uppdaterad: 2025-09-03 12:05