# 🛍️ E-commerce Integration – User Frontend

Detta är en enkel webbapp där användare kan registrera sig, logga in och se sin profil.
Appen pratar med en backend-tjänst som hanterar användardata och inloggning med säkerhet via tokens.
Målet är att visa en tydlig inloggnings- och profilfunktion som en del av vårt större e-commerce integrationsprojekt.

## Funktioner
- Registrera ny användare
- Logga in och spara JWT-token i `localStorage`
- Visa användarprofil via `/me`-endpoint (med token för autentisering)
- Ändra sitt förnamn och efternamn
- Logga ut och rensa token
- Enkel UX som visar olika vyer beroende på om användaren är inloggad eller inte
- Förberedda produktvyer och API-stubs för kommande Product Service-integration

## Teknisk översikt
- Byggd i **React (Create React App)**
- **React Router** (hash-baserad) för navigering mellan sidor
- Kommunikation med backend via **REST API**
- Token-baserad autentisering (JWT)
- Enkelt forms UI med CSS-styling

## Kom igång
1. Installera dependencies:
   ```bash
   npm install
   ```
2. Starta dev-server:
   ```bash
   npm start
   ```
3. Öppna appen på http://localhost:3000

> OBS: Rollen (admin/user) hämtas ev. från backend men visas inte i UI enligt säkerhetskrav. Se kommentar i `src/components/UserProfile.tsx`.

## Backend

Frontend pratar med ett separat Spring Boot User Service som hanterar:
- Registrering
- Login
- Token-verifiering
- Profilendpoint `/me`

### Product Service (förberett)
- Produkter ligger under `src/features/products/`
  - `ProductList.tsx` – lista
  - `ProductDetails.tsx` – detaljer
  - `ProductForm.tsx` – skapa/redigera (admin framöver)
  - `ProductSearch.tsx` – sök
  - `ProductInventory.tsx` – lagerstatus
  - `ProductImageUpload.tsx` – grund för bilduppladdning
  - `productService.ts` – API-stubs (REST)
- Routes (hash):
  - `#/products` – lista
  - `#/products/:id` – detaljer
  - `#/admin/products/new` – ny produkt
- Konfigurationsmiljö:
  - Sätt `REACT_APP_PRODUCT_API_BASE_URL` för att peka mot Product Service (default `http://localhost:8081`).
  - Swagger UI kommer senare vara tillgänglig på: `${REACT_APP_PRODUCT_API_BASE_URL}/swagger-ui/index.html`.

## CI/CD och Azure (framtid)
- CI/CD: Lägg till pipeline (GitHub Actions/Azure DevOps) som kör `npm ci && npm run build` och publicerar `build/`.
- Azure Blob Storage: Används för lagring av produktbilder. `ProductImageUpload` kan senare bytas till SAS URL uppladdning eller API-proxy.
- Azure SQL Database: Hanteras i Product Service (Spring Boot + JPA). Frontend använder endast REST-API.

## Utvecklartips
- Ändringar i routing gjordes i `src/App.tsx` med `react-router-dom` (hash router för enkel hosting).
- API-stubs i `productService.ts` är avsiktligt tomma tills backend finns.