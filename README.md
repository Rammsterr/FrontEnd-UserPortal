# 🛍️ User Portal – React‑frontend


Detta är en React‑app för användarportal med registrering, inloggning och profilvy. Appen använder JWT‑token som lagras i `localStorage` och HashRouter för enkel hosting (t.ex. GitHub Pages/Blob Static Website). Backend körs nu mot live‑tjänsterna UserService och ProductService (drillbi.se) med paginerad listning och skapande av produkter.

## Innehåll
- Översikt och funktioner
- Tekniker
- Kom igång (installation och start)
- Miljövariabler och API‑endpoints
- Routing
- Order (frontend)
- Produktfunktioner
- Kundvagn (frontend)
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
- Kundvagn i frontend: Context + reducer, localStorage‑persistens, badge i headern och sidopanel med qty‑kontroller (kräver inloggning för att öppna)

## Tekniker
- React (Create React App)
- react‑router‑dom v6 med HashRouter
- TypeScript
- Enkel CSS (App.css, Authform.css)

## Kom igång
1. Installera beroenden:
   npm install
2. Sätt miljövariabler i en `.env` i projektroten vid behov:
   - REACT_APP_PRODUCT_API_BASE_URL=https://productservice.drillbi.se
   - REACT_APP_PRODUCT_ASSETS_BASE_URL=https://productservice.drillbi.se/uploads  # om bilderna serveras under /uploads
3. Starta utvecklingsserver:
   npm start
4. Öppna http://localhost:3000

Bilduppladdning:
- Sätt (vid behov) miljövariabler:
  - REACT_APP_PRODUCT_IMAGE_UPLOAD_PATH=/api/products/images
  - REACT_APP_PRODUCT_ASSETS_BASE_URL=http://localhost:8081/uploads  # om backend serverar bilder där
- Använd formuläret "Ny produkt" för att välja och ladda upp bilder innan du sparar produkten.

## Miljövariabler och API‑endpoints
Användartjänst (User Service):
- Login: `POST https://userservice.drillbi.se/auth/login` (se `src/components/Login/Login.tsx`)
- Registrering: `POST https://userservice.drillbi.se/auth/register` (se `src/components/Register.tsx`)
- Profil: `GET https://userservice.drillbi.se/me` och `PUT https://userservice.drillbi.se/me/settings` med `Authorization: Bearer <token>`
- Appen förväntar sig `accessToken` i svaret och lagrar den i `localStorage` som `token`. 

Produkttjänst (Spring Boot ProductService):
- Bas‑URL: miljövariabeln `REACT_APP_PRODUCT_API_BASE_URL` (default: `https://productservice.drillbi.se`)
- API‑basväg: `/api/products`
- Swagger UI: `https://productservice.drillbi.se/swagger-ui/index.html`
- Endpoints som används i frontend:
  - GET `{BASE}/api/products?page={page}&size={size}&sortBy={field}&sortDir=asc|desc` – paginerad lista (se `ProductList.tsx`)
  - GET `{BASE}/api/products/all` – hämta alla produkter
  - GET `{BASE}/api/products/{id}` – hämta produkt per id (nu använd i `ProductDetails.tsx` via `productService.getProductById`)
  - GET `{BASE}/api/products/search?name=&categoryName=&minPrice=&maxPrice=` – server‑sökning (UI faller tillbaka till klientfilter om ej tillgängligt)
  - POST `{BASE}/api/products` – skapa ny produkt (kräver JWT i `Authorization: Bearer <token>`). Se `ProductForm.tsx`.
- Stöd som saknas i backend i nuläget (hanteras som stubbar i UI):
  - Uppdatera produkt
  - Ta bort produkt

Sökning använder backend‑endpoint när möjligt; fallback är klient‑side filter på namn, kategorinamn samt lägsta/högsta pris (min/max).

## Routing
All routing sker med HashRouter.
- `#/` –
  - Inloggad: visar `UserProfile` och en "Logga ut"‑knapp
  - Utloggad: visar `AuthSwitch` som låter dig växla mellan Registrering och Login
- `#/products` – produktlista med filterfält (Namn, Kategori, Lägsta, Högsta). URL‑parametrar: `?name=&category=&min=&max=`
- `#/products/:id` – produktdetaljer (kräver inloggning)
- `#/admin/products/new` – formulär för ny produkt (framtida adminflöde)

Se `src/App.tsx` och `src/components/Header.tsx` för navigationslogik. Kundvagnspanelen öppnas via ikonen i Header (CartBadge) och hanteras i `src/components/Cart/Cart.tsx`.

## Order (frontend)
- Ny sida: Skapa order (`#/orders/new`, kräver inloggning).
- Listar tillgängliga produkter (aktiva med lager > 0) via ProductService.
- Använder JWT från localStorage som Authorization: Bearer vid POST mot Order Service.
- Skickar POST `{BASE}/api/orders` med payload `{ items: [{ productId, quantity }] }`.
- Vid lyckad skapning visas order-id och kundvagnen töms.

## Produktfunktioner
Koden finns under `src/features/products/`:
- ProductList.tsx – lista (paginerat API eller klientfilter vid aktiva filter: name/category/min/max). Sorteringsdropdownen är borttagen enligt senaste UX‑önskemål.
- ProductDetails.tsx – detaljer (hämtar via client‑side fallback tills GET /{id} finns)
- ProductForm.tsx – skapa ny produkt (POST /api/products). Uppdatering ej stödd ännu.
- ProductInventory.tsx – lager (visualisering av lagersaldo/aktiv)
- ProductImageUpload.tsx – bilduppladdning (via upload‑endpoint om konfigurerad)
- productService.ts – integration mot Spring Boot ProductService (lista, skapa, klient‑side sök, bilduppladdning)

## Tillgänglighet och UX
- Landmärken: `<main role="main">` och semantisk header/footer
- Tydlig knapp för "Logga ut" som endast visas när token finns
- Textfeedback vid autentiseringsflöden
- Tema‑växling via `ThemeToggle` (i Header). Knappar för kundvagn använder aria‑label och qty‑kontroller har spärrar (min 1, max 99).

## Scripts
- `npm start` – startar dev‑server
- `npm run build` – bygger produktion
- `npm test` – startar testkörning (CRA standard)

## Projektstruktur (utdrag)
- `src/App.tsx` – appens rot, routes och villkorad vy baserat på token; wrapper med `CartProvider` och mountar `Cart`‑panelen
- `src/components/Header.tsx` – titel, navigation, login/logga‑ut, kundvagnsbadge och tema
- `src/components/Cart/CartBadge.tsx` – liten badge i headern som visar antal/summa och öppnar kundvagnen
- `src/components/Cart/Cart.tsx` – sidopanel som listar varor, qty‑kontroller, sum­ma och töm‑knapp
- `src/context/CartContext.tsx` – Context, reducer och localStorage‑persistens
- `src/utils/formatPrice.ts` – SEK‑formattering av priser
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

Senast uppdaterad: 2025-09-05 10:34
