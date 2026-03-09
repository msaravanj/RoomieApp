# Roomie 🏠

Roomie je web aplikacija koja pomaže studentima i mladim ljudima pronaći stan, sobu ili cimera.
Aplikacija omogućuje jednostavno pregledavanje oglasa, komunikaciju između korisnika i brže povezivanje ljudi koji traže zajedničko stanovanje.

## ✨ Funkcionalnosti

* pregled i objava oglasa za stanove i sobe
* filtriranje oglasa prema lokaciji, cijeni i drugim kriterijima
* korisnički računi i autentifikacija
* direktna komunikacija između korisnika
* chat u stvarnom vremenu
* automatsko kreiranje razgovora između dva korisnika
* pregled vlastitih razgovora i poruka

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

* React (hooks, React Router)
* JavaScript
* WebSocket klijent
* Chakra UI 

### Baza podataka

* MySQL
  

## ⚙️ Pokretanje projekta

### 1. Kloniranje repozitorija

```
git clone https://github.com/msaravanj/RoomieApp.git
cd RoomieApp
```

### 2. Pokretanje backend-a

```
cd roomie
./mvnw spring-boot:run
```

Backend će se pokrenuti na:

```
http://localhost:8080
```

### 3. Pokretanje frontend-a

```
cd roomie_react_app
npm install
npm start
```

Frontend će se pokrenuti na:

```
http://localhost:3000
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

## 🚀 Planirane funkcionalnosti

* karta s prikazom oglasa
* notifikacije za nove poruke
* profil korisnika
* upload slika stanova
* AI ChatBot koji korisnika ispituje o njegovom lifestyle-u te kreira pripadajući lifestyle profil
* pronalazak matching cimera s obzirom na lifestyle

## 👨‍💻 Autor

Matija

---

Roomie je projekt razvijen kao web aplikacija za olakšavanje pronalaska stanovanja i povezivanje ljudi koji traže cimere.
