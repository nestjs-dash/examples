import type { TranslationMap } from '@nestjs-dash/translation';
import type { DataSource, ObjectType } from 'typeorm';

interface ProductLike {
  id: string;
  name: TranslationMap;
  details: TranslationMap;
  price: number;
}

/** Idempotent — only inserts when the `products` table is empty. Works for either entity variant. */
export async function seedProductsIfEmpty(
  dataSource: DataSource,
  entity: ObjectType<ProductLike>,
): Promise<void> {
  const products = dataSource.getRepository(entity);
  if ((await products.count()) > 0) return;

  await products.save([
    products.create({
      name: { en: 'Desk lamp', nl: 'Bureaulamp', fr: 'Lampe de bureau' },
      details: {
        en: 'Adjustable LED desk lamp with three brightness levels.',
        nl: 'Verstelbare LED-bureaulamp met drie helderheidsniveaus.',
        fr: "Lampe de bureau LED réglable avec trois niveaux de luminosité.",
      },
      price: 39.99,
    }),
    products.create({
      name: { en: 'Coffee grinder', nl: 'Koffiemolen', fr: 'Moulin à café' },
      details: {
        en: 'Burr grinder with 15 grind settings, from espresso to French press.',
        nl: 'Kegelmolen met 15 maalinstellingen, van espresso tot French press.',
      },
      price: 79.5,
    }),
    products.create({
      name: { en: 'Wireless keyboard', fr: 'Clavier sans fil' },
      details: { en: 'Compact wireless keyboard with a rechargeable battery.' },
      price: 54,
    }),
  ]);
}
