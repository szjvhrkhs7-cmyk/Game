import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(here, '..');
const sections = ['payments', 'law', 'ai'];
const paymentPattern = /плат[её]ж[\p{L}-]*|(?:^|[^\p{L}\p{N}])оплат[\p{L}-]*|(?:^|[^\p{L}\p{N}])сбп(?:[^\p{L}\p{N}]|$)|эквайр[\p{L}-]*|финтех[\p{L}-]*|перевод[\p{L}-]*|банковск[\p{L}-]*\s+карт[\p{L}-]*|цифров[\p{L}-]*\s+рубл[\p{L}-]*|(?:^|[^\p{L}\p{N}])qr(?:[^\p{L}\p{N}]|$)|биометр[\p{L}-]*\s+оплат[\p{L}-]*|кошел[её]к|стейблкоин[\p{L}-]*|(?:^|[^\p{L}\p{N}])cbdc(?:[^\p{L}\p{N}]|$)|антифрод[\p{L}-]*|мошеннич[\p{L}-]*|нспк|транзакц[\p{L}-]*|процессинг[\p{L}-]*|банкомат[\p{L}-]*|расч[её]тн[\p{L}-]*\s+систем[\p{L}-]*|плат[её]жн[\p{L}-]*\s+инфраструктур[\p{L}-]*/iu;
const aiPattern = /искусственн[\p{L}-]*\s+интеллект[\p{L}-]*|нейросет[\p{L}-]*|(?:^|[^\p{L}\p{N}])ии(?:[^\p{L}\p{N}]|$)|(?:^|[^\p{L}\p{N}])ai(?:[^\p{L}\p{N}]|$)|chatgpt|(?:^|[^\p{L}\p{N}])gpt(?:[^\p{L}\p{N}]|$)|deepseek|gigachat|claude|машинн[\p{L}-]*\s+обуч[\p{L}-]*|дипфейк[\p{L}-]*|генеративн[\p{L}-]*|языков[\p{L}-]*\s+модел[\p{L}-]*|(?:^|[^\p{L}\p{N}])llm(?:[^\p{L}\p{N}]|$)|(?:ии|ai)[\s-]*агент[\p{L}-]*/iu;
const titleStopWords = new Set(['будут', 'после', 'через', 'между', 'против', 'области', 'сфере', 'новый', 'новая', 'новые', 'может', 'могут', 'предлагается']);
const shortEventTokens = new Set(['ии', 'ai', 'сбп', 'qr']);
const eventPromoPattern = /спикер[\p{L}-]*|регистрац[\p{L}-]*|билет[\p{L}-]*|(?:конференц|форум|мероприят)[\p{L}-]*.*партн[её]р[\p{L}-]*|партн[её]р[\p{L}-]*.*(?:конференц|форум|мероприят)[\p{L}-]*/iu;

function fail(message) {
  throw new Error(`Аудит PayDigest: ${message}`);
}

function secureUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function titleTokens(value = '') {
  return new Set(value.toLocaleLowerCase('ru-RU').replaceAll('ё', 'е').match(/[а-яa-z0-9]{2,}/giu)
    ?.filter((word) => (word.length >= 4 || shortEventTokens.has(word)) && !titleStopWords.has(word))
    .map((word) => word.slice(0, 6)) || []);
}

function sameEvent(first, second) {
  const left = titleTokens(first);
  const right = titleTokens(second);
  const smaller = Math.min(left.size, right.size);
  if (smaller < 3) return false;
  const overlap = [...left].filter((token) => right.has(token)).length;
  return overlap >= 3 && overlap / smaller >= 0.55;
}

const dataCode = await fs.readFile(path.join(siteDir, 'data.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(dataCode, sandbox, { timeout: 2_000 });
const data = sandbox.window.PAYDIGEST_DATA;

if (!data || Object.keys(data).sort().join(',') !== sections.slice().sort().join(',')) {
  fail('ожидались ровно три раздела: платежи, право и ИИ');
}

const seenUrls = new Map();
for (const section of sections) {
  const items = data[section]?.items;
  if (!Array.isArray(items) || items.length > 15) fail(`в разделе ${section} должно быть не более 15 материалов`);
  const eventTitles = [];
  for (const item of items) {
    if (!secureUrl(item.url)) fail(`небезопасная ссылка в ${section}: ${item.url}`);
    if (seenUrls.has(item.url)) fail(`одна публикация попала в ${seenUrls.get(item.url)} и ${section}: ${item.url}`);
    seenUrls.set(item.url, section);
    if (![item.title, item.summary, item.impact, item.source].every((value) => typeof value === 'string' && value.trim())) {
      fail(`неполная карточка в ${section}: ${item.url}`);
    }
    if (!Array.isArray(item.tags)) fail(`некорректные теги в ${section}: ${item.url}`);
    const text = `${item.title} ${item.summary}`;
    if (section === 'payments' && !paymentPattern.test(text)) fail(`смешение тем в «Платежах»: ${item.title}`);
    if (section === 'ai' && !aiPattern.test(text)) fail(`смешение тем в «ИИ»: ${item.title}`);
    if ((section === 'payments' || section === 'ai') && eventPromoPattern.test(item.title)) fail(`рекламный анонс в ${section}: ${item.title}`);
    if (eventTitles.some((title) => sameEvent(title, item.title))) fail(`повтор одного события в ${section}: ${item.title}`);
    eventTitles.push(item.title);
  }
}

const index = await fs.readFile(path.join(siteDir, 'index.html'), 'utf8');
if (!index.includes('http-equiv="Content-Security-Policy"')) fail('отсутствует Content Security Policy');
if (!index.includes('name="referrer" content="no-referrer"')) fail('отсутствует политика Referrer');
if (/\bhttp:\/\//i.test(index)) fail('в HTML найдена незашифрованная ссылка');
for (const anchor of index.match(/<a\b[^>]*target=["']_blank["'][^>]*>/gi) || []) {
  if (!/\brel=["'][^"']*noopener[^"']*noreferrer[^"']*["']/i.test(anchor)) {
    fail(`внешняя ссылка без защиты opener/referrer: ${anchor.slice(0, 160)}`);
  }
}

console.log(`Аудит PayDigest пройден: платежи — ${data.payments.items.length}, право — ${data.law.items.length}, ИИ — ${data.ai.items.length}; дублей нет; все ссылки используют HTTPS.`);
