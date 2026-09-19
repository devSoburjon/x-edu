# X-Edu

O'zbek tilidagi AI ta'lim platformasi. Test xatosining **ildiz sababini** topadi va
o'quvchiga aynan qaysi mavzuni takrorlash kerakligini ko'rsatadi.

> Oddiy test "4 ta xato" deydi. X-Edu xato **qayerdan boshlanganini** aytadi.

---

## Ishga tushirish

```bash
cp config.example.js config.js     # Gemini va Firebase kalitlarini qo'ying
python -m http.server 8077         # Firebase uchun http:// kerak (file:// emas)
```

So'ng `http://localhost:8077/X-EDU.html` ni oching. Build qadami yo'q.

Kalitlarsiz ham ilova to'liq ishlaydi: AI Ustoz zaxira tushuntirishlarga,
saqlash esa localStorage'ga tushadi.

---

## Texnik yadro

Platformaning qiymati UI da emas, **diagnostika algoritmida**.

### 1. Bilim grafi

Mavzular ro'yxat emas, **yo'naltirilgan graf**: har bir tushuncha o'zidan oldin
o'zlashtirilishi shart bo'lgan tushunchalarga bog'langan (`CONCEPTS`, `X-EDU.html:129`).

```
manfiy ─┬─> daraja ──> ildiz ─────┐
        │                          ├─> kvadrat
        └─> qavs ────> chiziqli ───┘
```

### 2. Savol → tushuncha bog'lanishi

Har bir test savoli **aniq bitta** graf tugumiga tegishli (`QUESTIONS`, `X-EDU.html:140`).
Shu bog'lanishsiz tahlil umuman ishlamaydi — bu tasodifiy dizayn qarori emas.

### 3. Ildiz sababni topish

`tahlilQil()` (`X-EDU.html:202`) quyidagicha ishlaydi:

1. Har bir tushuncha bo'yicha xato ulushi hisoblanadi
2. Eng yomon o'zlashtirilgan tugun **asosiy muammo** deb olinadi
   (teng ulushda grafda chuqurroq turgani tanlanadi)
3. Shu tugunning **barcha ajdodlari** rekursiv yig'iladi
4. Ajdodlar orasidan xato bo'lgan **eng sayoz** tugun — ya'ni zanjirning eng boshi —
   **ildiz sabab** deb belgilanadi

Algoritm tugunlar soniga bog'liq emas: `chuqurlik()` va `ajdodlar()` rekursiv,
graf kengaysa kod o'zgarmaydi.

### 4. Xato sababini tasniflash

| Sabab | Shart |
|---|---|
| Oldingi mavzu o'zlashtirilmagan | ildiz ≠ asosiy tugun |
| Mavzu tushunilmagan | tugundagi barcha savol xato |
| Shoshilinch javob | javob 4000 ms dan tez berilgan |
| Qisman o'zlashtirilgan | qolgan hollar |

Javob vaqti `Date.now()` bilan har savol uchun alohida o'lchanadi — shuning uchun
"bilim bor, lekin savol o'qilmagan" holatini "bilmaydi" dan ajrata olamiz.

### 5. Kontekstli AI Ustoz

`oquvchiKonteksti()` (`X-EDU.html:294`) har bir so'rovda promptga o'quvchining
joriy holatini qo'shadi: bilim xaritasi, zaif mavzular, oxirgi test natijasi va
oxirgi tahlil xulosasi.

Shuning uchun AI umumiy javob emas, **shu o'quvchiga** moslangan javob beradi —
zaif mavzusi bo'lsa tushuntirish asosdan boshlanadi.

AI Ustoz ikki rejimda ishlaydi:

| Rejim | Qachon | Xulq |
|---|---|---|
| Mavzu rejimi | Mavzu tanlanib "Tushuntir" bosilganda | Bilim xaritasiga moslangan tushuntirish |
| Erkin savol | Foydalanuvchi o'z savolini yozganda | Aynan so'ralgan mavzu — istalgan fan yoki dasturlash |

Erkin savolda o'quvchi statistikasi promptga baribir uzatiladi, lekin model
savol unga tegishli bo'lmasa e'tiborsiz qoldirishga yo'naltirilgan.

Zaxira: API 12 soniyada javob bermasa yoki kalit bo'lmasa, har mavzu uchun oldindan
yozilgan metodik matnga o'tiladi (`FALLBACK`, `X-EDU.html:272`). Demo hech qachon
to'xtamaydi.

---

## Arxitektura

| Qatlam | Hozir | Keyingi qadam |
|---|---|---|
| UI | Vanilla JS, hash routing, shablon funksiyalari | O'zgarishsiz |
| Holat | `STATE` obyekti, `persist()` orqali saqlanadi | O'zgarishsiz |
| Auth | Firebase Authentication (email/parol) | Google orqali kirish |
| Saqlash | Firestore + localStorage zaxira | O'zgarishsiz |
| AI | Brauzerdan Gemini'ga to'g'ridan-to'g'ri | Proxy backend orqali |

### Ma'lumot oqimi

`persist()` ikki joyga yozadi: darhol localStorage'ga, so'ng 1,2 soniyalik
kechikish bilan Firestore'ga (`bulutgaSaqla`). Kechikish har bir test javobidan
keyin alohida yozuv ketishining oldini oladi.

Kirishda `bulutdanYukla()` `oquvchilar/{uid}` hujjatidan bilim xaritasi, XP,
test natijalari va AI suhbatlarini tiklaydi. Tarmoq uzilsa uch marta,
ortib boruvchi kechikish bilan qayta urinadi, so'ng lokal ma'lumot bilan davom etadi.

Firebase sozlanmagan bo'lsa (`CFG.firebase` bo'sh) butun bulut qatlami
o'chiriladi va ilova localStorage rejimida to'liq ishlashda davom etadi.

### Xavfsizlik

Firestore qoidalari (`firestore.rules`): har bir o'quvchi faqat `request.auth.uid`
o'ziniki bo'lgan hujjatni o'qiy va yoza oladi. Boshqa barcha yo'llar yopiq.
Parollar ilovaga umuman yetib kelmaydi — ularni Firebase Auth boshqaradi.

---

## Ma'lum cheklovlar

Bular yashirilmaydi — hakaton doirasida ongli ravishda qabul qilingan qarorlar:

- **Gemini kaliti brauzerda.** `config.js` uni repozitoriyadan chiqarib tashlaydi,
  lekin klientga baribir yetib boradi. Yagona to'g'ri yechim — proxy backend.
- **Email tasdiqlanmaydi.** Ro'yxatdan o'tishda tasdiqlash xati yuborilmaydi.
- **Konflikt hal qilinmaydi.** Ikki qurilmada bir vaqtda ishlansa, oxirgi yozuv
  ustun keladi (last-write-wins).
- **Graf kichik.** 6 tushuncha, 12 savol. Bu muhandislik emas, kontent cheklovi.
- **Avtotestlar yo'q.** `tahlilQil()` birinchi navbatda test bilan qoplanishi kerak.
- **Bitta fayl.** 2700+ qator. Modullarga bo'lish keyingi refaktor.

---

## Yo'l xaritasi

1. `tahlilQil()` uchun unit testlar
2. Gemini so'rovlari uchun proxy backend (kalit klientdan olib tashlanadi)
3. Email tasdiqlash va parolni tiklash
4. Grafni 7–9-sinf matematika dasturi bo'yicha to'liq qoplash
5. O'qituvchi paneli: sinf bo'yicha bilim xaritasi
