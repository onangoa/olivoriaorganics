'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createProduct, updateProduct, type ProductInput } from '@/app/admin/product-actions';
import { addCategoryVariantLabel } from '@/app/admin/category-actions';
import { slugify } from '@/lib/slugify';
import PhotoUploader from '@/app/admin/components/PhotoUploader';
import type { Product } from '@/lib/content';

interface ProductFormProps {
  categories: string[];
  availableLabels: Record<string, string[]>;
  product?: Product;
}

interface VariantRow {
  key: number;
  label: string;
  price: string;
  picked: boolean;
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all';

function linesToArray(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

let variantKey = 0;

function nextVariantKey() {
  variantKey += 1;
  return variantKey;
}

function buildVariantRows(pool: string[], picks: Map<string, string>): VariantRow[] {
  return pool.map((label) => ({
    key: nextVariantKey(),
    label,
    price: picks.get(label) ?? '',
    picked: picks.has(label),
  }));
}

const TYPE_OPTIONS: { value: 'physical' | 'service'; label: string; hint: string }[] = [
  {
    value: 'physical',
    label: 'Physical Product',
    hint: 'A physical good — stock is tracked and reduced by completed invoices.',
  },
  {
    value: 'service',
    label: 'Service / Session',
    hint: 'A bookable service — no stock tracking, never runs out at the till.',
  },
];

export default function ProductForm({ categories, availableLabels, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const labelsFor = (category: string) => availableLabels[category] ?? [];

  const [form, setForm] = useState({
    name: product?.name ?? '',
    category: product?.category ?? categories[0] ?? '',
    customCategory: product && !categories.includes(product.category) ? product.category : '',
    type: product?.type ?? 'physical',
    description: product?.description ?? '',
    availability: product?.availability ?? 'In Stock',
    stock: String(product?.stock ?? 0),
    featured: product?.featured ?? false,
    image: product?.image ?? '/assets/no_image.png',
    gallery: product?.gallery ?? [],
    alt: product?.alt ?? '',
    longDescription: product?.longDescription ?? '',
    highlights: (product?.highlights ?? []).join('\n'),
    nutritionNote: product?.nutritionNote ?? '',
    nutrition: (product?.nutrition ?? []).join('\n'),
    benefits: (product?.benefits ?? []).join('\n'),
    usage: (product?.usage ?? []).join('\n'),
    caution: product?.caution ?? '',
  });
  const [variants, setVariants] = useState<VariantRow[]>(() =>
    buildVariantRows(
      labelsFor(product?.category ?? categories[0] ?? ''),
      new Map<string, string>(
        product ? product.variants.map((v) => [v.label, String(v.price)]) : []
      )
    )
  );
  const [labelInput, setLabelInput] = useState('');
  const [addingLabel, setAddingLabel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const useCustomCategory = !categories.includes(form.category);
  const activeCategory = useCustomCategory ? form.customCategory : form.category;
  const derivedId = useMemo(() => slugify(form.name), [form.name]);
  const isService = form.type === 'service';
  const typeHint = TYPE_OPTIONS.find((option) => option.value === form.type)?.hint ?? '';

  const set = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const switchCategory = (category: string) => {
    set('category', category);
    setLabelInput('');
    const labels = labelsFor(category === '__custom__' ? '' : category);
    setVariants((prev) => {
      const picks = new Map<string, string>(
        prev.filter((row) => row.picked).map((row) => [row.label, row.price])
      );
      return buildVariantRows(labels, picks);
    });
  };

  const setVariant = (key: number, patch: Partial<VariantRow>) => {
    setVariants((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const toggleVariant = (key: number) => {
    setVariants((prev) =>
      prev.map((row) => (row.key === key ? { ...row, picked: !row.picked } : row))
    );
  };

  const quickAddLabel = async () => {
    const value = labelInput.trim();
    if (!value) return;
    if (variants.some((row) => row.label === value)) {
      setError(`"${value}" is already in the list.`);
      return;
    }
    setError(null);
    setVariants((prev) => [
      ...prev,
      { key: nextVariantKey(), label: value, price: '', picked: true },
    ]);
    setLabelInput('');

    const categoryName = activeCategory.trim();
    if (!categoryName || !categories.includes(categoryName)) return;

    setAddingLabel(true);
    try {
      const result = await addCategoryVariantLabel(categoryName, value);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add label.');
    } finally {
      setAddingLabel(false);
    }
  };

  const pickedRows = () => variants.filter((row) => row.picked);

  const pricedVariants = () =>
    pickedRows()
      .filter((row) => row.price.trim() !== '')
      .map((row) => ({
        label: row.label,
        price: Number(row.price) || 0,
      }));

  const buildInput = (): ProductInput => {
    const category = useCustomCategory ? form.customCategory : form.category;
    return {
      name: form.name,
      category,
      type: isService ? 'service' : 'physical',
      description: form.description,
      availability: isService ? 'Bookable' : form.availability,
      stock: isService ? 0 : Math.floor(Number(form.stock)) || 0,
      featured: form.featured,
      image: form.image,
      gallery: form.gallery,
      alt: form.alt,
      longDescription: form.longDescription || undefined,
      highlights: linesToArray(form.highlights),
      nutritionNote: form.nutritionNote || undefined,
      nutrition: linesToArray(form.nutrition),
      benefits: linesToArray(form.benefits),
      usage: linesToArray(form.usage),
      caution: form.caution || undefined,
      variants: pricedVariants(),
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const picked = pickedRows();
    if (picked.length === 0) {
      setError('Pick at least one variant for this product.');
      return;
    }
    const unpriced = picked.filter((row) => row.price.trim() === '');
    if (unpriced.length > 0) {
      setError(`Enter a price for: ${unpriced.map((row) => row.label).join(', ')}`);
      return;
    }
    setSaving(true);
    try {
      const result =
        isEdit && product
          ? await updateProduct(product.id, buildInput())
          : await createProduct(buildInput());
      if (!result.ok) {
        setError(result.error);
        setSaving(false);
        return;
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="pf-name" className="block text-sm font-medium text-foreground mb-1.5">
              Name *
            </label>
            <input
              id="pf-name"
              className={inputClass}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
            {!isEdit && form.name && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Page id: <span className="font-mono">{derivedId}</span>
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="pf-category"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Category *
            </label>
            {useCustomCategory ? (
              <input
                id="pf-category"
                className={inputClass}
                value={form.customCategory}
                onChange={(e) => set('customCategory', e.target.value)}
                placeholder="New category name"
                required
              />
            ) : (
              <select
                id="pf-category"
                className={inputClass}
                value={form.category}
                onChange={(e) => switchCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__custom__">+ New category…</option>
              </select>
            )}
            {useCustomCategory && (
              <button
                type="button"
                onClick={() => switchCategory(categories[0] ?? '')}
                className="text-xs text-primary underline mt-1.5"
              >
                Choose from existing instead
              </button>
            )}
          </div>
        </div>
        {form.category === '__custom__' && (
          <p className="text-xs text-muted-foreground">
            Enter the new category name above — it will be added to the category list.
          </p>
        )}
        <div>
          <label
            htmlFor="pf-description"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Short Description *{' '}
            <span className="text-muted-foreground font-normal">(card summary)</span>
          </label>
          <textarea
            id="pf-description"
            rows={3}
            className={`${inputClass} resize-y`}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            required
          />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-1.5">Type</p>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Catalogue entry type">
            {TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => set('type', option.value)}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  form.type === option.value
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">{typeHint}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {isService ? (
            <div className="sm:col-span-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
              Services are <span className="font-medium text-foreground">Bookable</span> — stock
              tracking doesn&apos;t apply and they never run out at the till.
            </div>
          ) : (
            <>
              <div>
                <label
                  htmlFor="pf-stock"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Stock *
                </label>
                <input
                  id="pf-stock"
                  type="number"
                  min={0}
                  step={1}
                  className={inputClass}
                  value={form.stock}
                  onChange={(e) => set('stock', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Units available — completed invoices reduce this automatically.
                </p>
              </div>
              <div>
                <label
                  htmlFor="pf-availability"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Availability
                </label>
                <input
                  id="pf-availability"
                  className={inputClass}
                  value={form.availability}
                  onChange={(e) => set('availability', e.target.value)}
                />
              </div>
            </>
          )}
          <div className="flex items-end pb-3">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              Featured on homepage
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Price Variants *{' '}
            <span className="text-muted-foreground font-normal">
              (pick the sizes this product comes in)
            </span>
          </label>
          {activeCategory && (
            <p className="text-xs text-muted-foreground -mt-1 mb-2.5">
              Labels are picked from the{' '}
              <span className="font-medium text-foreground">{activeCategory}</span> category list —
              set once on the{' '}
              <Link href="/admin/categories" className="text-primary underline underline-offset-2">
                Categories
              </Link>{' '}
              page. Labels already in use by this category&apos;s products appear here too.
            </p>
          )}
          <div className="space-y-3">
            {variants.length > 0 && (
              <div className="hidden sm:grid grid-cols-[28px_1fr_180px] gap-3 text-[11px] uppercase tracking-widest text-muted-foreground px-1">
                <span />
                <span>Label</span>
                <span>Price (KSh)</span>
              </div>
            )}
            {variants.map((variant) => (
              <div
                key={variant.key}
                className="grid grid-cols-[28px_1fr_150px] sm:grid-cols-[28px_1fr_180px] gap-3 items-center"
              >
                <input
                  type="checkbox"
                  checked={variant.picked}
                  onChange={() => toggleVariant(variant.key)}
                  aria-label={`Include ${variant.label}`}
                  className="w-5 h-5 accent-primary"
                />
                <span
                  className={`text-sm truncate ${
                    variant.picked ? 'font-medium text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {variant.label}
                </span>
                <input
                  aria-label={`Price for ${variant.label}`}
                  type="number"
                  min={0}
                  step="0.01"
                  className={`${inputClass} disabled:opacity-50`}
                  value={variant.price}
                  onChange={(e) => setVariant(variant.key, { price: e.target.value })}
                  placeholder={variant.picked ? '350' : 'Not offered'}
                  disabled={!variant.picked}
                />
              </div>
            ))}
            {variants.length === 0 && (
              <div className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                No variant labels for this category yet — add the first one below (it is saved to
                the category so every product in it can pick it), or manage them on the{' '}
                <Link
                  href="/admin/categories"
                  className="text-primary underline underline-offset-2"
                >
                  Categories
                </Link>{' '}
                page.
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
              <input
                aria-label="New variant label"
                className={`${inputClass} sm:max-w-xs`}
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    quickAddLabel();
                  }
                }}
                placeholder="New label — e.g. 60ml, 250g, 1kg"
                maxLength={191}
              />
              <button
                type="button"
                onClick={() => quickAddLabel()}
                disabled={!labelInput.trim() || addingLabel}
                className="px-4 py-3 rounded-full border border-border text-sm font-semibold text-foreground transition-all hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {addingLabel ? 'Adding…' : 'Add label'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              New labels are saved to the category&apos;s list — set once, then every product in it
              can pick them.
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            The product&apos;s price is the lowest picked variant price — shown as &quot;From&quot;
            on the site.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Photos *{' '}
            <span className="text-muted-foreground font-normal">
              (first photo is the cover — shown on cards)
            </span>
          </label>
          <PhotoUploader
            value={{ cover: form.image, gallery: form.gallery }}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, image: value.cover, gallery: value.gallery }))
            }
          />
        </div>
        <div>
          <label htmlFor="pf-alt" className="block text-sm font-medium text-foreground mb-1.5">
            Cover Photo Description (alt) *
          </label>
          <input
            id="pf-alt"
            className={inputClass}
            value={form.alt}
            onChange={(e) => set('alt', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="font-serif font-semibold text-lg text-foreground">
          Detail Page Content{' '}
          <span className="text-muted-foreground font-normal text-sm">(optional)</span>
        </h2>
        <div>
          <label htmlFor="pf-long" className="block text-sm font-medium text-foreground mb-1.5">
            Full Description
          </label>
          <textarea
            id="pf-long"
            rows={4}
            className={`${inputClass} resize-y`}
            value={form.longDescription}
            onChange={(e) => set('longDescription', e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="pf-highlights"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Why Choose Highlights{' '}
            <span className="text-muted-foreground font-normal">(one per line)</span>
          </label>
          <textarea
            id="pf-highlights"
            rows={4}
            className={`${inputClass} resize-y`}
            value={form.highlights}
            onChange={(e) => set('highlights', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="pf-nutrition-note"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Nutrition Note
            </label>
            <input
              id="pf-nutrition-note"
              className={inputClass}
              value={form.nutritionNote}
              onChange={(e) => set('nutritionNote', e.target.value)}
              placeholder="Per 100g…"
            />
          </div>
          <div>
            <label
              htmlFor="pf-nutrition"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Nutrition Values{' '}
              <span className="text-muted-foreground font-normal">(one per line)</span>
            </label>
            <textarea
              id="pf-nutrition"
              rows={4}
              className={`${inputClass} resize-y`}
              value={form.nutrition}
              onChange={(e) => set('nutrition', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="pf-benefits"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Benefits <span className="text-muted-foreground font-normal">(one per line)</span>
            </label>
            <textarea
              id="pf-benefits"
              rows={5}
              className={`${inputClass} resize-y`}
              value={form.benefits}
              onChange={(e) => set('benefits', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pf-usage" className="block text-sm font-medium text-foreground mb-1.5">
              How to Use <span className="text-muted-foreground font-normal">(one per line)</span>
            </label>
            <textarea
              id="pf-usage"
              rows={5}
              className={`${inputClass} resize-y`}
              value={form.usage}
              onChange={(e) => set('usage', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="pf-caution" className="block text-sm font-medium text-foreground mb-1.5">
            Caution / Safety Note
          </label>
          <textarea
            id="pf-caution"
            rows={2}
            className={`${inputClass} resize-y`}
            value={form.caution}
            onChange={(e) => set('caution', e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-7 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
        <Link
          href="/admin/products"
          className="text-sm text-muted-foreground hover:text-primary underline underline-offset-2"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
