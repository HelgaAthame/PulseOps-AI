/**
 * Достаёт JSON-объект из ответа модели: бесплатные модели иногда оборачивают
 * его в ```json-заборы или добавляют пролог/эпилог. Снимаем заборы и берём срез
 * от первой { до последней } — то, что осталось, парсим как JSON.
 *
 * Чистая функция без зависимостей — вынесена из server-only слоя, чтобы её
 * можно было покрыть юнит-тестами.
 */
export function extractJson(raw: string): unknown {
  const fenced = raw.replace(/```(?:json)?/gi, "").trim();
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  const slice = start >= 0 && end > start ? fenced.slice(start, end + 1) : fenced;
  return JSON.parse(slice);
}
