# Kontrola insolvenčního rejtříku přes Google Tabulky

Script prochází postupně všechny záznamy v tabulce a vyhledává k nim údaje v insolvenčním rejsříku.

**[Vzor Google Tabulky s popsanými sloupci](https://docs.google.com/spreadsheets/d/1lEQSA2mZt_LouzgixVdshQKg6cg60bJRYhixzieEdsY/edit)** ([zkopírovat](https://docs.google.com/spreadsheets/d/1lEQSA2mZt_LouzgixVdshQKg6cg60bJRYhixzieEdsY/copy))

## Popis vyplnění tabulky
Na každý řádek patří jeden subjekt (firma, osoba), které chtete prověřovat v Insolvenčním rejstříku.
 
První sloupec slouží pro poznámky, které script nijak nezpracovává.

Další sloupce tabulky se pak použíjí pro vyhledání osoby.

**Pozor:** Při vyhledávání se musí shodovat všechny údaje ve sloupcích. Je lepší tedy vyplnit **jen takové**, které osobu určí přesně a ostatní nevyplňovat. Tedy například pokud u podnikatele znáte jeho IČ, tak **vyplňte pouze IČ a ostatní údaje ponechte prázné**. Jinak by se mohlo stát, že pokud je například jméno podnikatele zapsáno trochu jinak, tak jej systém nenalezne.

Vhodné kombinace:
 - Fyzická osoba: Rodné číslo
 - Fyzická osoba: Přijmení + Jméno + Datum narození
 - Právnická osoba: IČ
 - Právnická osoba: Název firmy
 
[Podrobný technický popis na webu justice.cz](https://isir.justice.cz/isir/help/Popis_WS_2_v1_7.pdf) 

## Instalace
1. Zkopírujte si [vzorovou tabulku](https://docs.google.com/spreadsheets/d/1lEQSA2mZt_LouzgixVdshQKg6cg60bJRYhixzieEdsY/copy) 
2. Do tabulky vyplňte nejméně jednu osobu, kterou chcete prověřit.
3. Volbou **Nástroje > Editor scriptů** si vytvořte Google Script připojený k tabulce ([více informací](https://developers.google.com/apps-script/guides/bound))
4. Do scriptu vložte obsah souboru [Code.js](Code.js) a uložte jej kliknutím na ikonu diskety.
5. V horním panelu spusťte funkci `main` (název vyberte v seznamu a stiskněte tlačítko Play). Při prvním spuštění je nezbytné projít proces autorizace, kterým dáte scriptu oprávnění, aby mohl číst z tabulky Vaším jménem ([více informací](https://developers.google.com/apps-script/guides/services/authorization)).
6. Nastavte pravidelné spouštění funkce `main` každou hodinu (tlačítkem se symbolem hodin, [více informací](https://developers.google.com/apps-script/guides/triggers/installable#time-driven_triggers)).

Do tabulky se pak budou každou hodinu vyplňovat údaje o výsledcích hledání daných osob v Insolvenčním rejtříku.

## Odinstalace
Nejkratší cestou je vyhledání scriptu v [Google Script Dashbordu](https://script.google.com/), stisknout tlačítko se třemi tečkami a zvolit **Smazat**. Tím se automaticky smaže i nastavení pravidelného spouštění. 

## GDPR
Vyhledávat osoby v insolvenčním rejstříku spadá pod takzvaný Oprávněný zájem, tedy není třeba k němu mít souhlas subjektu. Nicméně je značně problematické uchovávat osobní údaje fyzických osob v Google Tabulkách (pokud nejsou provozovány pod firemním G Suite, které požadavky GDPR splňuje). 

Dále je třeba myslet na to, že máte povinnost evidovat, kde osobní údaje osob uchováváte – nezapomeňte tedy tuto tabulku ve firemních směrnicích uvést. 

## Známé problémy
*Žádné zatím nejsou, sledujte [Issues](https://github.com/jakubboucek/google-script-kontrola-insolvence/issues)*

## Plán dalšího rozvoje
- zaslání e-mailu v okamžiku nalezení záznamu