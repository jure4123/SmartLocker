# :package: SmartLocker+ — Nadgradnja direct4.me pametnega paketnika
 
> **Projektno delo** | FERI Maribor  
> Nadgradnja pametnega paketnika direct4.me z biometrijo, AI pregledom vsebine, temperaturno kontrolo in peer-to-peer izmenjavo.
 
---
 
## :pushpin: Opis projekta
 
SmartLocker+ je nadgradnja obstoječega sistema pametnih paketnikov **direct4.me**, razvita v okviru projektnega dela na FERI Maribor. Cilj projekta je razširiti funkcionalnosti paketnika z naprednimi tehnologijami, ki rešujejo realne probleme pri dostavi, varnosti in skupnostni izmenjavi.
 
Osnovna platforma direct4.me že omogoča:
- Dostavo in prevzem paketov prek mobilne aplikacije
- PIN, QR in Bluetooth odpiranje
- Delegiranje dostopa prijateljem in družini
Mi pa dodajamo naslednjo generacijo funkcionalnosti.
 
---
 
## :key: Ključne nadgradnje
 
### :closed_lock_with_key: 1. Face ID — Biometrično odpiranje
- Prepoznavanje obraza z **liveness detection** (preprečuje prevaro s fotografijo)
- Hierarhija avtentikacije: obraz → prstni odtis → PIN
- Kurirji se registrirajo za enkraten dostop v določenem časovnem oknu
- Vse obdelano **lokalno na napravi** — zasebnost zagotovljena
### :thermometer: 2. Temperaturno kontrolirani predali
- :fire: **Topli predali** (~65°C) — ohranjajo topel obrok svež ure po dostavi
- :snowflake: **Hladni predali** (~4°C) — za sladice, sladoled, zdravila
- Realnočasni temperaturni log v aplikaciji
- HACCP skladnost za dostavo hrane
### :repeat: 3. Peer-to-peer izmenjava (C2C)
- Lokalni marketplace med sosedi, študenti, skupnostjo
- Varni escrow sistem — denar se sprosti šele po potrditvi prevzema
- Integracija s Stripe / PayPal API
- Idealno za prodajo, izposojo orodja, izmenjavo knjig
