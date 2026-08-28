'use client';

/**
 * CatalogFilter — client-side filtering of the pre-rendered catalog
 * (task 4.2, specs/directory: "filterable client-side from pre-rendered
 * data").
 *
 * It filters the **DOM**, not a copy of the data. The 400 rows are already in
 * the page as server-rendered HTML with their comparable values on
 * `data-provider`, `data-status`, `data-name` and `data-price-in`; shipping a
 * JSON copy of the same table so React could re-render it would double the
 * page's weight to save nothing. Rows are hidden with the `hidden` attribute,
 * which removes them from the accessibility tree as well as from view.
 *
 * Rows are owned by a Server Component and are never re-rendered on the
 * client, so setting an attribute on them cannot fight React's reconciler.
 *
 * With JavaScript off, the whole table renders and the filter form does
 * nothing — the correct degradation for a reference page. That is why the
 * form markup is server-rendered too and this component only attaches
 * behaviour to it.
 */

import { useEffect } from 'react';

export default function CatalogFilter({
  formId = 'catalog-filters',
  tableId = 'catalog-table',
  countId = 'catalog-count',
}: {
  formId?: string;
  tableId?: string;
  countId?: string;
}) {
  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    const table = document.getElementById(tableId);
    const count = document.getElementById(countId);
    if (!form || !table) return;

    const rows = Array.from(table.querySelectorAll<HTMLTableRowElement>('tbody tr'));
    const total = rows.length;

    const apply = () => {
      const data = new FormData(form);
      const name = String(data.get('name') ?? '').trim().toLowerCase();
      const provider = String(data.get('provider') ?? '');
      const status = String(data.get('status') ?? '');
      const maxRaw = String(data.get('maxprice') ?? '').trim();
      const max = maxRaw === '' ? null : Number(maxRaw);

      let shown = 0;
      for (const row of rows) {
        const price = row.dataset.priceIn === '' ? null : Number(row.dataset.priceIn);
        const ok =
          (name === '' || (row.dataset.name ?? '').includes(name)) &&
          (provider === '' || row.dataset.provider === provider) &&
          (status === '' || row.dataset.status === status) &&
          // A row with no published price is not "cheap"; a max-price filter
          // excludes it rather than guessing it fits.
          (max === null || (price !== null && Number.isFinite(price) && price <= max));
        row.hidden = !ok;
        if (ok) shown += 1;
      }
      if (count) {
        count.textContent =
          shown === total ? `${total} rows` : `${shown} of ${total} rows`;
      }
    };

    form.addEventListener('input', apply);
    // `reset` fires before the fields are cleared.
    form.addEventListener('reset', () => window.setTimeout(apply, 0));
    form.addEventListener('submit', (e) => e.preventDefault());
    apply();

    return () => {
      form.removeEventListener('input', apply);
    };
  }, [formId, tableId, countId]);

  return null;
}
