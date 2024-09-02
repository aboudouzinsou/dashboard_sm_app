// components/InvoicePrint.tsx
import { SaleItem, Settings, Product } from "@/types";

interface InvoicePrintProps {
  saleItems: SaleItem[];
  settings: Settings;
  products: Product[];
  calculateTotal: number;
  calculateVAT: number;
  calculateGrandTotal: number;
}

export function InvoicePrint({
  saleItems,
  settings,
  products,
  calculateTotal,
  calculateVAT,
  calculateGrandTotal,
}: InvoicePrintProps) {
  return (
    <div className="invoice-print">
      <h1>{settings.storeName}</h1>
      <p>Date: {new Date().toLocaleDateString()}</p>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {saleItems.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return (
              <tr key={item.productId}>
                <td>{product?.name}</td>
                <td>{item.quantity}</td>
                <td>
                  {settings.currency}
                  {item.price.toFixed(2)}
                </td>
                <td>
                  {settings.currency}
                  {(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div>
        <p>
          Subtotal: {settings.currency}
          {calculateTotal.toFixed(2)}
        </p>
        <p>
          VAT ({settings.vatRate}%): {settings.currency}
          {calculateVAT.toFixed(2)}
        </p>
        <p>
          Total: {settings.currency}
          {calculateGrandTotal.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
