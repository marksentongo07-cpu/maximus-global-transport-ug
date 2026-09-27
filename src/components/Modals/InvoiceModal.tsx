import React from 'react';
import { Job, Currency } from '../../types';
import { formatMoney } from '../../services/currency';
import { Printer, Download, CheckCircle2, ShieldCheck, X, Truck } from 'lucide-react';

interface InvoiceModalProps {
  job: Job;
  currency: Currency;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ job, currency, onClose }) => {
  const agreedTotalUGX = job.agreedPriceUGX || job.marketPriceEstimateUGX;
  const adminFeeUGX = Math.round(agreedTotalUGX * 0.10);
  const baseFreightUGX = agreedTotalUGX - adminFeeUGX;

  const invoiceNo = `INV-MAX-${job.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400">Electronic Commercial Invoice</span>
            <span className="text-xs text-slate-400">· {invoiceNo}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs bg-white text-slate-900">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg">
                  M
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900">MAXIMUS</h1>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Global Transport &amp; Service Link
                  </p>
                </div>
              </div>
              <p className="mt-3 text-slate-600 text-[11px] leading-relaxed">
                Maximus Digital Logistics Network Ltd.<br />
                Plot 18 Lumumba Avenue, Kampala, Uganda<br />
                TIN: 1009842109 · support@maximuslink.com
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-md mb-2">
                {job.status === 'delivered' ? 'PAID & DELIVERED' : 'ESCROW SECURED'}
              </div>
              <div className="font-mono text-xs font-bold text-slate-800">{invoiceNo}</div>
              <div className="text-slate-500 text-[11px] mt-1">Date: {new Date().toLocaleDateString('en-GB')}</div>
            </div>
          </div>

          {/* Client & Transporter info */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Billed To (Client):</span>
              <div className="text-xs font-bold text-slate-900 mt-1">{job.clientName}</div>
              <div className="text-slate-600 text-[11px]">{job.clientPhone}</div>
              <div className="text-slate-600 text-[11px] mt-1">Payment Method: {job.paymentMethod || 'Mobile Money Escrow'}</div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Carrier / Transporter:</span>
              <div className="text-xs font-bold text-slate-900 mt-1">
                {job.offers[0]?.transporterName || 'Verified Maximus Carrier'}
              </div>
              <div className="text-slate-600 text-[11px]">Vehicle: {job.desiredVehicleType.toUpperCase()} Carrier</div>
              <div className="text-slate-600 text-[11px] mt-1">KYC Status: Verified Commercial Hauler</div>
            </div>
          </div>

          {/* Route & Cargo Specifications */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-4">Item &amp; Cargo Description</th>
                  <th className="py-2.5 px-4">Weight / Specs</th>
                  <th className="py-2.5 px-4">Origin &amp; Destination</th>
                  <th className="py-2.5 px-4 text-right">Distance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">{job.title}</td>
                  <td className="py-3 px-4">{job.weightTons} Tonnes ({job.category})</td>
                  <td className="py-3 px-4">
                    {job.pickupLocation.name.split(' ')[0]} → {job.deliveryLocation.name.split(' ')[0]}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">{job.estimatedDistanceKm} km</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown Table */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Haulage Fare:</span>
                <span className="font-semibold text-slate-900">{formatMoney(baseFreightUGX, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Maximus Platform &amp; Escrow Fee (10%):</span>
                <span className="font-semibold text-slate-900">{formatMoney(adminFeeUGX, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>URA VAT / Local Transit Taxes:</span>
                <span className="font-semibold text-slate-900">Included</span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-base text-amber-700">{formatMoney(agreedTotalUGX, currency)}</span>
              </div>
            </div>
          </div>

          {/* Legal Note on Invoice */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 leading-normal">
            <strong>Legal Clause:</strong> Maximus is a linking platform only. We are not liable for damages, loss, accidents, delays, or disputes that occur between client and transporter. Transport is executed under agreement between the two parties. Users are advised to have cargo insurance.
          </div>

        </div>

      </div>
    </div>
  );
};
