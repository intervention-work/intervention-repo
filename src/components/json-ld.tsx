/**
 * Emits a JSON-LD structured-data block. The payload is our own generated
 * object (not WordPress HTML), so it does not go through sanitizeWpHtml. We
 * escape "<" so the JSON can never break out of the <script> element.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
