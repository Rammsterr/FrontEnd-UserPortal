# 🛍️ User Portal – React‑frontend


Detta är en React‑app för användarportal med registrering, inloggning och profilvy. Appen använder JWT‑token som lagras i `localStorage` och HashRouter för enkel hosting (t.ex. GitHub Pages/Blob Static Website). Backend körs nu mot live‑tjänsterna UserService och ProductService (drillbi.se) med paginerad listning och skapande av produkter.

## Innehåll
- Översikt och funktioner
- Tekniker
- Kom igång (installation och start)
- Miljövariabler och API‑endpoints
- Routing
- Checkout och Orderhistorik
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
2. Sätt miljövariabler i en `.env` i projektroten vid behov (lägg inte `.env` i versionshantering):
  - REACT_APP_PRODUCT_API_BASE_URL=https://api.example.com            # Exempelvärde – använd din egen bas‑URL
  - REACT_APP_PRODUCT_ASSETS_BASE_URL=https://assets.example.com/uploads  # Exempelvärde
3. Starta utvecklingsserver:
   npm start
4. Öppna http://localhost:3000

Bilduppladdning:
- Sätt (vid behov) miljövariabler:
  - REACT_APP_PRODUCT_IMAGE_UPLOAD_PATH=/api/products/images
  - REACT_APP_PRODUCT_ASSETS_BASE_URL=http://localhost:8081/uploads  # om backend serverar bilder där
- Använd formuläret "Ny produkt" för att välja och ladda upp bilder innan du sparar produkten.

## Miljövariabler och API‑endpoints
Säkerhetsnotis: Undvik att exponera produktionsdomäner, interna endpoints eller tokens i publika dokument. Använd miljövariabler och hänvisa till intern dokumentation.

Användartjänst (User Service):
- Login: `POST {USER_API_BASE}/auth/login` (se `src/components/Login/Login.tsx`)
- Registrering: `POST {USER_API_BASE}/auth/register` (se `src/components/Register.tsx`)
- Profil: `GET {USER_API_BASE}/me` och `PUT {USER_API_BASE}/me/settings` med `Authorization: Bearer <token>`
- Appen förväntar sig `accessToken` i svaret och lagrar den i `localStorage` som `token`.

Produkttjänst (ProductService):
- Bas‑URL: via miljövariabeln `REACT_APP_PRODUCT_API_BASE_URL` (ingen default i README; konfigurera per miljö)
- API‑basväg: till exempel `/api/products`
- Exempel på endpoints som används i frontend (se koden i `src/features/products/`):
  - GET `{BASE}/api/products?page={page}&size={size}&sortBy={field}&sortDir=asc|desc` – lista
  - GET `{BASE}/api/products/{id}` – detalj
  - GET `{BASE}/api/products/search?name=&categoryName=&minPrice=&maxPrice=` – sökning
  - POST `{BASE}/api/products` – skapa (kräver JWT i `Authorization: Bearer <token>`)

Observera: För fullständig och uppdaterad API‑referens, se backendens dokumentation (intern). Fallback till enkel klient‑side filtrering används i UI om serversök inte är tillgänglig.

## Routing
All routing sker med HashRouter.
- `#/` – startsida med hero, produktgalleri och inloggnings/registreringsmodal vid behov
  - Inloggad: visar profilgenvägar, kan lägga i kundvagn och gå till detaljer
  - Utloggad: kan bläddra produkter; vid skyddade åtgärder öppnas login‑modal
- `#/products` – produktlista med filterfält (Namn, Kategori, Lägsta, Högsta). URL‑parametrar: `?name=&category=&min=&max=`
- `#/products/:id` – produktdetaljer (kräver inloggning)
- `#/admin/products/new` – formulär för ny produkt (framtida adminflöde)
- `#/checkout` – kassa (skapa order från kundvagnen, kräver inloggning)
- `#/orders` – orderhistorik för inloggad användare

Se `src/App.tsx` och `src/components/Header.tsx` för navigationslogik. Kundvagnspanelen öppnas via ikonen i Header (CartBadge) och hanteras i `src/components/Cart/Cart.tsx`.

## Checkout och Orderhistorik
- Checkout: `#/checkout` – skapar order baserat på kundvagnens innehåll (kräver inloggning).
  - Använder JWT från `localStorage` som `Authorization: Bearer <token>` vid POST mot Order Service.
  - Skickar POST `{BASE}/api/orders` med payload `{ items: [{ productId, quantity }] }`.
  - Vid lyckad skapning visas order‑id och kundvagnen töms.
- Orderhistorik: `#/orders` – listar tidigare ordrar för inloggad användare.

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
- Startsidan har nu hero‑rubriken "VaruVansinne Deluxe ✨🤘" med en subtil, prestandasnål färgshimmer. Animeringen respekterar `prefers-reduced-motion` och stängs av för användare som föredrar mindre rörelse.

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

Senast uppdaterad: 2025-09-12 12:43
