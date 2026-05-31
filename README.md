# Roomie 🏠

Roomie je web aplikacija koja pomaže studentima i mladim ljudima pronaći stan, sobu ili idealnog cimera.
Aplikacija omogućuje jednostavno pregledavanje oglasa, komunikaciju između korisnika, kreiranje lifestyle profila pomoću umjetne inteligencije te pronalazak kompatibilnih cimera.

## ✨ Funkcionalnosti

### 🏡 Oglasi i pretraga

* pregled i objava oglasa za stanove i sobe
* filtriranje oglasa prema lokaciji, cijeni i drugim kriterijima
* interaktivna karta s prikazom oglasa

### 👤 Korisnički profili

* korisnički računi i autentifikacija
* uređivanje korisničkog profila
* upload i upravljanje profilnim slikama korisnika

### 💬 Komunikacija

* direktna komunikacija između korisnika
* chat u stvarnom vremenu
* automatsko kreiranje razgovora između dva korisnika
* pregled vlastitih razgovora i poruka

### 🤖 AI Lifestyle Matching

* AI chatbot koji kroz razgovor ispituje korisnika o njegovom načinu života
* automatsko kreiranje lifestyle profila pomoću umjetne inteligencije
* pronalazak kompatibilnih cimera na temelju lifestyle profila
* AI generirani opis sličnosti između dva korisnika kako bi se lakše procijenila kompatibilnost za zajedničko stanovanje

## 🧱 Tehnologije

### Backend

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* Spring AI
* WebSocket (STOMP)
* JWT autentifikacija
* Hibernate
* Lombok
* Cloudinary API

### Frontend

* React (Hooks, React Router)
* JavaScript
* WebSocket klijent
* Chakra UI
* Leaflet (interaktivna karta)

### Baza podataka

* MySQL

## ⚙️ Pokretanje projekta

### 1. Kloniranje repozitorija

```bash
git clone https://github.com/msaravanj/RoomieApp.git
cd RoomieApp
```

### 2. Pokretanje backend-a

```bash
cd roomie
./mvnw spring-boot:run
```

Backend će se pokrenuti na:

```text
http://localhost:8080
```

### 3. Pokretanje frontend-a

```bash
cd roomie_react_app
npm install
npm start
```

Frontend će se pokrenuti na:

```text
http://localhost:5173
```

## 🔐 Autentifikacija

Aplikacija koristi **JWT (JSON Web Token)** za autentifikaciju korisnika.

Nakon prijave korisnik dobiva token koji se koristi za autorizirane zahtjeve prema backend API-ju.

## 💬 Chat sustav

Roomie uključuje **real-time chat** između korisnika.

* WebSocket komunikacija
* automatsko kreiranje razgovora
* spremanje poruka u bazu
* pregled povijesti razgovora

## 🤖 AI Lifestyle Sustav

Roomie koristi umjetnu inteligenciju kako bi korisnicima olakšao pronalazak kompatibilnih cimera.

Proces uključuje:

1. razgovor s AI chatbotom
2. analizu odgovora korisnika
3. generiranje lifestyle profila
4. usporedbu profila s drugim korisnicima
5. prikaz potencijalnih cimera s objašnjenjem kompatibilnosti

Na taj način korisnici mogu pronaći cimere koji imaju slične navike, interese i životni stil.

## 👨‍💻 Autor

Matija Šaravanja

---

Roomie je projekt razvijen kao web aplikacija za olakšavanje pronalaska stanovanja i povezivanje ljudi koji traže cimere koristeći moderne web tehnologije i umjetnu inteligenciju.
