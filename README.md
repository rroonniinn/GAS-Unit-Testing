# GulpTemplate

To jest mój główny template do pracy z Gulpem, GAS i standardowym frontendem.
### Cechy:
* Gulp 4
* ESLint zaintegorwany z Prettierem w oparciu o bibliotekę WesBos, bazującą na Airbnb + moje własne ustawienia
* Autocomplete dla Apps Script
* Bable (w tym preset dla Apps Script)

### Struktura
1. _dist_Browser (generowany - docelowe pliki frontendu)
   * css
   * img
   * js
2. _dist_Gas (generowany - docelowe pliki Apps Script)
    * browser
3. _dist_Tmp (generowany - robocze pliki frontendu)
   * css
   * img
   * js
4. _src_Browser (pliki źródłowe dla frontu (w tym Apps Script HTMLServices))
   * scss
      * reset
   * img
   * js
5. _src_Gas (pliki źródłowe dla Apps Script)

### Inicjacja
`npm i` w katalogu projektu

### Praca z GAS
Najpierw należy utworzyć projekt GAS lub sklonować istniejący.

### Git i AppsScript
Jeśli pracujesz z appscriptem to zmodyfikuj `.gitignore` aby również pliki konfoguracyjne GAS się na nim znalazły. Ma być:
```
_dist_Gas/*.js
_dist_Gas/browser
_dist_Tmp
_dist_Browser
docs
!.clasp.json
!appsscript.json
```
### Moduły ES6
System bazuje na użyciu modułów ES6.
1. Dla plików działających po stronie clienta użycie jest standardowe (rollup odpowiada za ich obsługę). Kolejność ładowania plików nie ma znaczenia. Tak czy siak całość procesu ogarnianego przez Gulpa skutkuje jednym zminimalizowanym plikiem JS.
2. Rollup tworzy ostatecznie jeden plik js. Jednak potrzebuje również jednego głównego pliku js do którego ładowane są moduły. Nazwy tych plików są zdefiniowane w `gulpfile.js` - `PATH.srcGasJsModulesEntry` dla GAS oraz `PATH.srcBrowserModulesEntry` dla Browser. Same nazwy można swobodnie zmienić.
3. Dla GAS występuje parę ważnych 'nowości':
     * Funkcje do menu, triggerów lub google.script.run muszą być zdefiniowane jako metody obiektu `global`
     * Kolejność plików nie ma znaczenia jako, że rollup dba o to, aby wszystkie metody importowane znalazły się bezpośrednio w pliku który z nich korzysta
     * Dla polyfills należy zastosować import całego modułu na początku startowego pliku - np: `import './poly/string/repeat'`;

#### Tworzenie nowych skryptów:
1. **Bound** dla już istniejącego arkusza : `clasp create --title "Nazwa" --parentId "xxxxxx" --rootDir ./_dist_Gas`
    * --parentId - ID pliku do którego ma być tenże skrypt przypisany (bound)
    * --rootDir - to ma być tak jak w przykładzie - tam będą pliki GAS
2. **Bound** dla nowego arkusza: `clasp create --title "Nazwa" --type sheets --rootDir ./_dist_Gas`. Plik zostanie utworzony bezpośrednio na Drivie
3. **Standalone**: `clasp create --title "Nazwa" --rootDir ./_dist_Gas`


#### Klonowanie istniejących skryptów:
1. Aby sklonować już istneijący: `clasp clone "xxxxxxxx" --rootDir ./_dist_Gas`
    * xxxxxxx - to ID lub URL skryptu do sklonowania lokalnego

### Komendy Gulpa:
#### Watchery:
* `gulp watchBrowser` - podczas pracy nad Frontendowym projektem
* `gulp watchGas` - podczas pracy nad GAS (bez HTMLServices)
* `gulp watchGasBrowser` - podczas pracy nad GAS z HTMLServices
#### Buildery
* `gulp buildDist` - tworzy gotową do uploadu na serwer paczkę Frontendową
* `gulp buildDistServer` - jak wyżej, ale przy okazji odpala BrowserSync aby ostatecznie sprawdzić wszystko
### Czyszczenie
* `gulp deleteAll` - usuwa wszsytkie wygenerowane katalogi - zostawia configi (w tym GAS) i sourcy
* `gulp deleteAllTotal` - usuwa wszsytkie wygenerowane katalogi oraz konfigi GAS - zostawia configi podstawowe

### Do zrobienia
[ ] Zamiana znaczników HTML dla GasBrowser
