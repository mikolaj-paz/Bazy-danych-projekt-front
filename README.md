## Wymagania

- Node.js

## Przygotowanie

Aby uruchomić tryb `dev`, należy wcześniej pobrać moduły oraz dodać plik `.env` do folderu aplikacji (root).

Aby zainstalować moduły, należy w terminalu uruchomić polecenie:

```bash
npm install # instalacja modułów
```

Co powinno znaleźc się w pliku `.env`:

```
SESSION_SECRET=[wygenerowany klucz]
```

Jest wiele możliwości wygenerowania klucza. Na przykład komendą `openssl` w terminalu:

```bash
openssl rand -base64 32
```

## Uruchomienie trybu dev

```bash
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce aby uruchomić stronę.