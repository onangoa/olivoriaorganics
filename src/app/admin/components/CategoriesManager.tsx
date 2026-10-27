'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createCategory,
  deleteCategory,
  renameCategory,
  setCategoryVariantLabels,
} from '@/app/admin/category-actions';

export interface CategoryRow {
  name: string;
  productCount: number;
  declared: boolean;
  variantLabels: string[];
  labelUsage: Record<string, string[]>;
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all';

const sameLabels = (a: string[], b: string[]) =>
  a.length === b.length && a.every((label, index) => label === b[index]);

interface LabelEditor {
  name: string;
  original: string[];
  labels: string[];
  add: string;
}

export default function CategoriesManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [editor, setEditor] = useState<LabelEditor | null>(null);
  const [pending, startTransition] = useTransition();

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createCategory(newName);
      if (result.ok) {
        setNewName('');
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleRename = (oldName: string) => {
    if (!renameValue.trim()) {
      setRenaming(null);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await renameCategory(oldName, renameValue);
      if (result.ok) {
        setRenaming(null);
        setEditor(null);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleDelete = (name: string, productCount: number) => {
    if (productCount > 0) return;
    if (!window.confirm(`Delete category "${name}"?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteCategory(name);
      if (result.ok) {
        setEditor(null);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const toggleEditor = (category: CategoryRow) => {
    setError(null);
    if (editor?.name === category.name) {
      setEditor(null);
      return;
    }
    setEditor({
      name: category.name,
      original: category.variantLabels,
      labels: category.variantLabels,
      add: '',
    });
  };

  const addLabel = () => {
    if (!editor) return;
    const value = editor.add.trim();
    if (!value) return;
    if (editor.labels.includes(value)) {
      setError(`Label "${value}" is already on the list.`);
      return;
    }
    setError(null);
    setEditor({ ...editor, labels: [...editor.labels, value], add: '' });
  };

  const removeLabel = (label: string) => {
    if (!editor) return;
    setError(null);
    setEditor({ ...editor, labels: editor.labels.filter((item) => item !== label) });
  };

  const saveLabels = () => {
    if (!editor) return;
    setError(null);
    startTransition(async () => {
      const result = await setCategoryVariantLabels(editor.name, editor.labels);
      if (result.ok) {
        setEditor({ ...editor, original: result.labels, labels: result.labels, add: '' });
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const dirty = editor ? !sameLabels(editor.labels, editor.original) : false;

  const labelUsageFor = (name: string) =>
    categories.find((category) => category.name === name)?.labelUsage ?? {};

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleAdd}
        className="bg-card border border-border rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end gap-3"
      >
        <div className="flex-1">
          <label htmlFor="cat-new" className="block text-sm font-medium text-foreground mb-1.5">
            New Category
          </label>
          <input
            id="cat-new"
            className={inputClass}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Natural Sweeteners"
            maxLength={191}
          />
        </div>
        <button
          type="submit"
          disabled={pending || !newName.trim()}
          className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
        >
          {pending ? 'Adding…' : 'Add Category'}
        </button>
      </form>

      {error && (
        <div
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border">
          <p className="text-base font-serif italic">No categories yet.</p>
          <p className="mt-2 text-sm">
            Add your first category above — it appears on the Products page and in product forms.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border bg-muted/30">
                <th className="px-5 py-3.5 font-medium">Category</th>
                <th className="px-5 py-3.5 font-medium">Products</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const isRenaming = renaming === category.name;
                const isEditingLabels = editor?.name === category.name;
                return (
                  <React.Fragment key={category.name}>
                    <tr className="border-b border-border last:border-0">
                      <td className="px-5 py-3.5">
                        {isRenaming ? (
                          <div className="flex items-center gap-2">
                            <input
                              className={inputClass}
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              maxLength={191}
                              autoFocus
                            />
                            <button
                              onClick={() => handleRename(category.name)}
                              disabled={pending}
                              className="text-xs font-semibold text-primary underline underline-offset-2 whitespace-nowrap disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setRenaming(null)}
                              className="text-xs font-semibold text-muted-foreground underline underline-offset-2 whitespace-nowrap"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="font-medium text-foreground">{category.name}</span>
                        )}
                        {!category.declared && !isRenaming && (
                          <span className="block text-[11px] text-muted-foreground mt-0.5">
                            In use by products — not yet in the official list
                          </span>
                        )}
                        {category.declared && !isRenaming && (
                          <span className="block text-[11px] text-muted-foreground mt-0.5">
                            {category.variantLabels.length > 0
                              ? `${category.variantLabels.length} variant label${category.variantLabels.length === 1 ? '' : 's'}`
                              : 'No variant labels set'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                        {category.productCount}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-4">
                          {!isRenaming && (
                            <button
                              onClick={() => {
                                setRenaming(category.name);
                                setRenameValue(category.name);
                              }}
                              disabled={pending}
                              className="text-xs font-semibold text-primary underline underline-offset-2 disabled:opacity-50"
                            >
                              Rename
                            </button>
                          )}
                          {category.declared && !isRenaming && (
                            <button
                              onClick={() => toggleEditor(category)}
                              disabled={pending}
                              className="text-xs font-semibold text-primary underline underline-offset-2 disabled:opacity-50"
                            >
                              {isEditingLabels ? 'Hide labels' : 'Variant labels'}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(category.name, category.productCount)}
                            disabled={pending || category.productCount > 0}
                            title={
                              category.productCount > 0
                                ? 'Reassign or delete its products first'
                                : `Delete "${category.name}"`
                            }
                            className="text-xs font-semibold text-red-600 underline underline-offset-2 hover:text-red-700 disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isEditingLabels && editor && (
                      <tr className="border-b border-border last:border-0 bg-muted/20">
                        <td colSpan={3} className="px-5 py-4">
                          <div className="space-y-3">
                            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                              Variant labels for &quot;{category.name}&quot; — picked from when
                              adding or editing its products
                            </p>
                            {editor.labels.length > 0 ? (
                              <div className="flex flex-wrap items-center gap-2">
                                {editor.labels.map((label) => {
                                  const usedBy = labelUsageFor(category.name)[label] ?? [];
                                  const inUse = usedBy.length > 0;
                                  return (
                                    <span
                                      key={label}
                                      className={`inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-card border text-sm ${
                                        inUse ? 'border-primary/40' : 'border-border'
                                      } text-foreground`}
                                      title={
                                        inUse
                                          ? `Used by ${usedBy.join(', ')}`
                                          : 'Not used by any product yet'
                                      }
                                    >
                                      {label}
                                      {inUse && (
                                        <span className="text-[10px] font-semibold text-primary">
                                          {usedBy.length}
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => removeLabel(label)}
                                        disabled={pending || inUse}
                                        aria-label={
                                          inUse
                                            ? `${label} is in use by products`
                                            : `Remove ${label}`
                                        }
                                        title={
                                          inUse
                                            ? `In use by ${usedBy.join(
                                                ', '
                                              )} — untick it on those products first`
                                            : `Remove ${label}`
                                        }
                                        className="w-5 h-5 rounded-full text-muted-foreground hover:text-red-600 transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted-foreground"
                                      >
                                        ✕
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">
                                No labels yet — add the sizes/packaging options products in this
                                category come in.
                              </p>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <input
                                className={`${inputClass} sm:max-w-xs`}
                                value={editor.add}
                                onChange={(e) => setEditor({ ...editor, add: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addLabel();
                                  }
                                }}
                                placeholder="e.g. 15ml, 30ml, 250g, 1kg"
                                maxLength={191}
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={addLabel}
                                  disabled={!editor.add.trim()}
                                  className="px-4 py-2.5 rounded-full border border-border text-sm font-semibold text-foreground transition-all hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  Add label
                                </button>
                                <button
                                  type="button"
                                  onClick={saveLabels}
                                  disabled={pending || !dirty}
                                  className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                                >
                                  {pending ? 'Saving…' : 'Save labels'}
                                </button>
                                {dirty && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditor({
                                        ...editor,
                                        labels: editor.original,
                                        add: '',
                                      })
                                    }
                                    className="text-xs font-semibold text-muted-foreground underline underline-offset-2"
                                  >
                                    Undo
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              The count on a label shows how many of this category&apos;s products
                              use it. Labels in use are locked — untick the label on those products
                              first, then remove it here.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
