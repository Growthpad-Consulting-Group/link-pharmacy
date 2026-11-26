"use client";

import { useEffect, useState } from "react";
import { Alert, Panel, Tag, formatDateTime } from "./format";
import { apiFetch, errorMessage } from "./api";
import { Pager } from "./pager";
import { TableSkeleton } from "./loading";

type Order = {
  id: string;
  reference: string;
  customer: { name: string; email: string; phone: string; city: string };
  lines: { productId: number; quantity: number }[];
  total: number;
  currency: string;
  demo: boolean;
  createdAt: string;
};
type OrdersResponse = { orders: Order[]; total: number; page: number; pageSize: number };

export function OrdersList() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<OrdersResponse>(`/api/admin/orders?page=${page}`)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Orders</h1>
        <p className="text-sm text-muted">Orders placed through checkout. Change an order in Odoo, not here.</p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Panel>
        {!data && !error && <TableSkeleton rows={5} />}
        {data && data.orders.length === 0 && <p className="py-8 text-center text-muted">No orders yet.</p>}
        {data && data.orders.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="pb-3 font-semibold">Order</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Items</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.orders.map((order) => (
                    <tr key={order.id} className="align-top">
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-ink">{order.reference}</p>
                        {order.demo && <Tag tone="amber">Demo</Tag>}
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-ink">{order.customer.name}</p>
                        <p className="text-muted">{order.customer.email}</p>
                        <p className="text-muted">
                          {order.customer.phone} · {order.customer.city}
                        </p>
                      </td>
                      <td className="py-3 pr-4 text-ink/85">
                        {order.lines.reduce((sum, line) => sum + line.quantity, 0)} item(s) in {order.lines.length} line(s)
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 font-semibold text-ink">
                        {order.total.toFixed(2)} {order.currency}
                      </td>
                      <td className="whitespace-nowrap py-3 text-muted">{formatDateTime(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={page} total={data.total} pageSize={data.pageSize} onPage={setPage} />
          </>
        )}
      </Panel>
    </div>
  );
}
