'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { createSale, updateProspectSale, type PaymentStatus } from '@/app/admin/sale-actions';
import { formatKES } from '@/lib/money';

export interface PosVariant {
  label: string;
  price: number;
}

export interface PosProduct {
  id: string;
  name: string;
  category: string;
  type: 'physical' | 'service';
  stock: number;
  availability: string;
  image: string;
  variants: PosVariant[];
}

const PAYMENT_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'paid', label: 'Paid' },
  { value: 'credit', label: 'On Credit' },
  { value: 'prospect', label: 'Prospect' },
];

const NO_IMAGE_PATHS = new Set(['', '/assets/no_image.png', '/assets/images/no_image.png']);

const hasImage = (src: string) => Boolean(src) && !NO_IMAGE_PATHS.has(src);

interface CartLine {
  key: number;
  productId: string;
  variantLabel: string;
  unitPrice: string;
  quantity: number;
}

let lineKey = 0;

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const win = window as Window & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const Ctor = win.AudioContext ?? win.webkitAudioContext;
  if (!Ctor) return null;
  let ctx = audioContext;
  if (!ctx) {
    ctx = new Ctor();
    audioContext = ctx;
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startOffset: number,
  duration: number,
  volume = 0.05
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  const startAt = ctx.currentTime + startOffset;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(volume, startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.05);
}

function playCartSound(kind: 'add' | 'remove') {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (kind === 'add') {
    playTone(ctx, 880, 0, 0.09);
    playTone(ctx, 1318.5, 0.07, 0.12);
  } else {
    playTone(ctx, 392, 0, 0.08);
    playTone(ctx, 261.6, 0.06, 0.12);
  }
}

export interface EditableSale {
  id: string;
  invoiceNumber: number;
  customerName: string;
  customerContact: string;
  customerEmail: string;
  taxRate: number;
  notes: string;
  items: { productId: string; variantLabel: string | null; unitPrice: number; quantity: number }[];
}

interface SalesPosProps {
  products: PosProduct[];
  editSale?: EditableSale;
}

export default function SalesPos({ products, editSale }: SalesPosProps) {
  const router = useRouter();
  const isEdit = Boolean(editSale);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartLine[]>(() => {
    if (!editSale) return [];
    return editSale.items.map((item) => {
      lineKey += 1;
      return {
        key: lineKey,
        productId: item.productId,
        variantLabel: item.variantLabel ?? '',
        unitPrice: String(item.unitPrice),
        quantity: item.quantity,
      };
    });
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState(editSale?.customerName ?? 'Walk-in Customer');
  const [customerContact, setCustomerContact] = useState(editSale?.customerContact ?? '');
  const [customerEmail, setCustomerEmail] = useState(editSale?.customerEmail ?? '');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(isEdit ? 'prospect' : 'paid');
  const [taxRate, setTaxRate] = useState(editSale ? String(editSale.taxRate) : '0');
  const [notes, setNotes] = useState(editSale?.notes ?? '');
  const [showOptions, setShowOptions] = useState(Boolean(editSale));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<{
    invoiceId: string;
    invoiceNumber: number;
    invoiceStatus: 'pending' | 'completed';
  } | null>(null);

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((product) => product.category)))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      if (activeCategory !== 'All' && product.category !== activeCategory) return false;
      if (!query) return true;
      return (
        product.name.toLowerCase().includes(query) ||
        product.variants.some((variant) => variant.label.toLowerCase().includes(query))
      );
    });
  }, [products, search, activeCategory]);

  const totals = useMemo(() => {
    let subtotal = 0;
    for (const line of cart) {
      subtotal += line.quantity * (Number(line.unitPrice) || 0);
    }
    const rate = Math.max(0, Math.min(100, Number(taxRate) || 0));
    const tax = (subtotal * rate) / 100;
    return { subtotal: round2(subtotal), tax: round2(tax), total: round2(subtotal + tax) };
  }, [cart, taxRate]);

  const addToCart = (productId: string, variant: PosVariant) => {
    playCartSound('add');
    setCart((prev) => {
      const existing = prev.find(
        (line) => line.productId === productId && line.variantLabel === variant.label
      );
      if (existing) {
        return prev.map((line) =>
          line === existing ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      lineKey += 1;
      return [
        ...prev,
        {
          key: lineKey,
          productId,
          variantLabel: variant.label,
          unitPrice: String(variant.price),
          quantity: 1,
        },
      ];
    });
  };

  const setLine = (key: number, patch: Partial<CartLine>) => {
    setCart((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  };

  const removeLine = (key: number) => {
    playCartSound('remove');
    setCart((prev) => prev.filter((line) => line.key !== key));
  };

  const changeQuantity = (key: number, delta: number) => {
    setCart((prev) =>
      prev.map((line) => {
        if (line.key !== key) return line;
        const quantity = Math.max(1, line.quantity + delta);
        return { ...line, quantity };
      })
    );
  };

  const handleCheckout = async () => {
    setError(null);
    setCreated(null);
    if (cart.length === 0) {
      setError('Cart is empty — tap a product size to add it.');
      return;
    }
    if (!customerName.trim()) {
      setError('Customer name is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        customerName,
        customerContact: customerContact || undefined,
        customerEmail: customerEmail || undefined,
        taxRate: Number(taxRate) || 0,
        notes: notes || undefined,
        items: cart.map((line) => ({
          productId: line.productId,
          variantLabel: line.variantLabel || undefined,
          quantity: line.quantity,
          unitPrice: Number(line.unitPrice) || 0,
        })),
      };
      const result =
        isEdit && editSale
          ? await updateProspectSale(editSale.id, payload)
          : await createSale({ ...payload, paymentStatus });
      if (!result.ok) {
        setError(result.error);
        setSaving(false);
        return;
      }
      setCreated({
        invoiceId: result.invoiceId,
        invoiceNumber: result.invoiceNumber,
        invoiceStatus: result.invoiceStatus,
      });
      if (!isEdit) {
        setCart([]);
        setCustomerName('Walk-in Customer');
        setCustomerContact('');
        setCustomerEmail('');
        setPaymentStatus('paid');
        setTaxRate('0');
        setNotes('');
        setShowOptions(false);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const cartItems = cart.reduce((sum, line) => sum + line.quantity, 0);

  const renderCartContents = (idPrefix: string, onCloseSheet?: () => void) => (
    <>
      {isEdit && editSale && (
        <p className="text-xs font-semibold text-accent">
          Editing invoice #{String(editSale.invoiceNumber).padStart(4, '0')} — prospect (pending)
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif font-semibold text-lg text-foreground">
          Cart{' '}
          <span className="text-sm font-normal text-muted-foreground">
            ({cartItems} item{cartItems === 1 ? '' : 's'})
          </span>
        </h2>
        <div className="flex items-center gap-3">
          {cart.length > 0 && (
            <button
              type="button"
              onClick={() => setCart([])}
              className="text-xs font-semibold text-muted-foreground underline underline-offset-2 hover:text-red-600"
            >
              Clear
            </button>
          )}
          {onCloseSheet && (
            <button
              type="button"
              onClick={onCloseSheet}
              aria-label="Close cart"
              className="p-1.5 -mr-1.5 rounded-md text-foreground hover:bg-muted transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {cart.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-xl">
          Tap a product size to start a quick sale.
        </p>
      ) : (
        <div className="max-h-[320px] overflow-y-auto -mx-1 px-1">
          {cart.map((line) => {
            const product = productMap.get(line.productId);
            const lineTotal = line.quantity * (Number(line.unitPrice) || 0);
            const overStock =
              product && product.type !== 'service' ? line.quantity > product.stock : false;
            return (
              <div key={line.key} className="py-3 border-b border-border last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {product?.name ?? 'Product'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {line.variantLabel} · {formatKES(lineTotal)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    aria-label="Remove item"
                    className="text-xs font-semibold text-red-600 underline underline-offset-2"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => changeQuantity(line.key, -1)}
                      disabled={line.quantity <= 1}
                      aria-label="Decrease quantity"
                      className="w-7 h-7 rounded-full border border-border text-foreground font-semibold transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-foreground">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(line.key, 1)}
                      aria-label="Increase quantity"
                      className="w-7 h-7 rounded-full border border-border text-foreground font-semibold transition-colors hover:bg-muted"
                    >
                      +
                    </button>
                  </div>
                  <input
                    aria-label="Unit price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(e) => setLine(line.key, { unitPrice: e.target.value })}
                    className="w-24 px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                {overStock && (
                  <p className="text-[11px] text-red-600 mt-1.5">
                    Only {product?.stock} in stock —{' '}
                    {paymentStatus === 'prospect'
                      ? 'completing the invoice will fail unless stock is added.'
                      : 'this sale will fail unless stock is added.'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div>
        <label
          htmlFor={`${idPrefix}-customer`}
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Customer *
        </label>
        <input
          id={`${idPrefix}-customer`}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-1.5">Payment</p>
        {isEdit ? (
          <p className="text-xs text-muted-foreground">
            Prospect quotation — saving keeps the invoice pending. Complete it on the{' '}
            <Link href="/admin/invoices" className="text-primary underline underline-offset-2">
              Invoices
            </Link>{' '}
            page to convert it and reduce stock.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Payment status">
              {PAYMENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPaymentStatus(option.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    paymentStatus === option.value
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {paymentStatus === 'prospect' && (
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Unconfirmed sale — pending invoice, stock untouched.
              </p>
            )}
            {paymentStatus === 'credit' && (
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Stock is reduced now; payments can be recorded in stages later.
              </p>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowOptions((value) => !value)}
        className="text-xs font-semibold text-primary underline underline-offset-2"
      >
        {showOptions ? 'Hide options' : 'More options (contact, tax, notes)'}
      </button>
      {showOptions && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor={`${idPrefix}-contact`}
                className="block text-xs font-medium text-muted-foreground mb-1"
              >
                Phone / Contact
              </label>
              <input
                id={`${idPrefix}-contact`}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
                placeholder="+254 …"
              />
            </div>
            <div>
              <label
                htmlFor={`${idPrefix}-email`}
                className="block text-xs font-medium text-muted-foreground mb-1"
              >
                Email
              </label>
              <input
                id={`${idPrefix}-email`}
                type="email"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor={`${idPrefix}-tax`}
                className="block text-xs font-medium text-muted-foreground mb-1"
              >
                Tax / VAT (%)
              </label>
              <input
                id={`${idPrefix}-tax`}
                type="number"
                min={0}
                max={100}
                step="0.5"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor={`${idPrefix}-notes`}
                className="block text-xs font-medium text-muted-foreground mb-1"
              >
                Invoice Notes
              </label>
              <input
                id={`${idPrefix}-notes`}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional note on the invoice"
              />
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4 space-y-1 text-sm">
        <p className="flex justify-between gap-8 text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-medium text-foreground">{formatKES(totals.subtotal)}</span>
        </p>
        <p className="flex justify-between gap-8 text-muted-foreground">
          <span>Tax</span>
          <span className="font-medium text-foreground">{formatKES(totals.tax)}</span>
        </p>
        <p className="flex justify-between gap-8 text-base font-semibold text-foreground">
          <span>Total</span>
          <span className="text-primary">{formatKES(totals.total)}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={handleCheckout}
        disabled={saving || cart.length === 0}
        className="w-full px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
      >
        {saving
          ? 'Recording…'
          : isEdit
            ? `Save Changes · ${formatKES(totals.total)}`
            : `Complete Sale · ${formatKES(totals.total)}`}
      </button>

      {error && (
        <div
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {created && (
        <div
          className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm"
          role="status"
        >
          {isEdit ? (
            <>
              Changes saved — invoice #{String(created.invoiceNumber).padStart(4, '0')} is still
              pending and stock is untouched.{' '}
              <a
                href={`/api/admin/invoices/${created.invoiceId}/pdf`}
                className="font-semibold underline underline-offset-2"
              >
                Download the updated PDF
              </a>
              .
            </>
          ) : created.invoiceStatus === 'completed' ? (
            <>
              Sale recorded — invoice #{String(created.invoiceNumber).padStart(4, '0')} is completed
              and stock has been reduced.{' '}
              <a
                href={`/api/admin/invoices/${created.invoiceId}/pdf`}
                className="font-semibold underline underline-offset-2"
              >
                Download the PDF
              </a>
              .
            </>
          ) : (
            <>
              Prospect recorded — invoice #{String(created.invoiceNumber).padStart(4, '0')} is
              pending.{' '}
              <Link href="/admin/invoices" className="font-semibold underline underline-offset-2">
                Complete it on the Invoices page
              </Link>{' '}
              to reduce stock, or{' '}
              <a
                href={`/api/admin/invoices/${created.invoiceId}/pdf`}
                className="font-semibold underline underline-offset-2"
              >
                download the PDF
              </a>
              .
            </>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="pb-24 lg:pb-0">
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              aria-label="Search products"
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or sizes…"
            />
          </div>
          {categories.length > 2 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    activeCategory === category
                      ? 'bg-foreground text-background'
                      : 'border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
          {products.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border">
              <p className="text-base font-serif italic">No products yet.</p>
              <p className="mt-2 text-sm">
                Add products first — then quick sales can be made from here.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border">
              <p className="text-base font-serif italic">No products match.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map((product) => {
                const outOfStock = product.type !== 'service' && product.stock <= 0;
                return (
                  <article
                    key={product.id}
                    className={`bg-card border border-border rounded-2xl p-4 flex gap-3 ${
                      outOfStock ? 'opacity-60' : ''
                    }`}
                  >
                    {hasImage(product.image) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 shrink-0 rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="h-12 w-12 shrink-0 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-muted-foreground"
                      >
                        <PhotoIcon className="h-6 w-6" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {product.name}
                      </p>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          outOfStock ? 'text-red-600 font-medium' : 'text-muted-foreground'
                        }`}
                      >
                        {product.category} ·{' '}
                        {outOfStock
                          ? 'Out of stock'
                          : product.type === 'service'
                            ? 'Bookable'
                            : `${product.stock} in stock`}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {product.variants.map((variant) => (
                          <button
                            key={variant.label}
                            type="button"
                            onClick={() => addToCart(product.id, variant)}
                            disabled={outOfStock}
                            className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {variant.label} · {formatKES(variant.price)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="hidden lg:block bg-card border border-border rounded-2xl p-5 space-y-4 lg:sticky lg:top-8">
          {renderCartContents('pos')}
        </aside>
      </section>

      {/* Mobile cart summary bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-foreground min-w-0">
            <span className="font-semibold">
              {cartItems} item{cartItems === 1 ? '' : 's'}
            </span>{' '}
            <span className="text-muted-foreground">·</span>{' '}
            <span className="font-semibold text-primary">{formatKES(totals.total)}</span>
          </p>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="shrink-0 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            {cart.length === 0 ? 'View Cart' : 'Open Cart'}
          </button>
        </div>
      </div>

      {/* Mobile cart bottom sheet */}
      {cartOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Cart"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 inset-x-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-card border-t border-border p-5 pb-8 space-y-4 shadow-2xl">
            {renderCartContents('posm', () => setCartOpen(false))}
          </div>
        </div>
      )}
    </div>
  );
}
