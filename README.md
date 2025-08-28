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

## Teknisk översikt
- Byggd i **React (Create React App)**
- Kommunikation med backend via **REST API**
- Token-baserad autentisering (JWT)
- Enkelt forms UI med CSS-styling


## Kom igång
1. Installera dependencies:
   ```bash
   npm install

Öppna appen i http://localhost:3000

#### Backend

Frontend pratar med ett separat Spring Boot User Service som hanterar:

- Registrering

- Login

- Token-verifiering

- Profilendpoint /me