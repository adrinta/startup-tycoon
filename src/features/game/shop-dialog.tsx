"use client";

import { Coins, ShoppingCart, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  computeBuffs,
  describeBuff,
  SHOP_ITEMS,
  summarizeBuffs,
  type ShopItem,
} from "@/content/shop/items";
import { localProgressRepository } from "@/lib/services/progress-repository";
import { useGameStore } from "@/lib/stores/game-store";
import { formatRupiah } from "@/lib/utils/format";

export function ShopDialog() {
  const revenue = useGameStore((state) => state.revenue);
  const ownedItemIds = useGameStore((state) => state.ownedItemIds);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const buffSummary = summarizeBuffs(computeBuffs(ownedItemIds));

  function handleBuy(item: ShopItem) {
    const result = localProgressRepository.buyItem(item.id);
    if (result.ok) {
      setNotice(`${item.name} dipasang di kantor! Efek: ${describeBuff(item.buff)}.`);
      return;
    }
    if (result.reason === "insufficient") {
      setNotice(`Koin belum cukup untuk ${item.name}. Selesaikan misi dulu!`);
    } else if (result.reason === "owned") {
      setNotice(`${item.name} sudah kamu miliki.`);
    } else {
      setNotice("Barang tidak ditemukan.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setNotice(null);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 border-primary/40 bg-primary/[0.06] px-2 font-mono text-[10px] uppercase tracking-wider text-primary hover:bg-primary/[0.12]"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Toko
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            Katalog Dekorasi Kantor
          </DialogTitle>
          <DialogDescription>
            Belanja dengan Revenue-mu — setiap barang memberi efek pasif. Saldo saat ini:{" "}
            <span className="font-mono font-semibold text-amber-700">
              {formatRupiah(revenue)}
            </span>
          </DialogDescription>
        </DialogHeader>

        {buffSummary.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-primary/25 bg-primary/[0.05] px-2.5 py-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
              Buff aktif:
            </span>
            {buffSummary.map((label) => (
              <span
                key={label}
                className="rounded-full border border-primary/30 bg-white px-2 py-0.5 font-mono text-[10px] text-primary"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="scroll-slim max-h-[52vh] space-y-2 overflow-y-auto pr-1">
          {SHOP_ITEMS.map((item) => {
            const owned = ownedItemIds.includes(item.id);
            const affordable = revenue >= item.cost;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-md border border-border/70 bg-card px-3 py-2.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/50 text-xl">
                  {item.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[13px] font-semibold">{item.name}</span>
                    <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/[0.06] px-2 py-0.5 font-mono text-[9.5px] text-primary">
                      <Sparkles className="h-2.5 w-2.5" />
                      {describeBuff(item.buff)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-700">
                    <Coins className="h-3 w-3" />
                    {formatRupiah(item.cost)}
                  </span>
                  {owned ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] text-emerald-700">
                      Dimiliki ✓
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant={affordable ? "default" : "outline"}
                      disabled={!affordable}
                      onClick={() => handleBuy(item)}
                      className="h-7 px-3 text-[11px]"
                    >
                      {affordable ? "Beli" : "Koin kurang"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {notice && (
          <p className="rounded-md border border-primary/25 bg-primary/[0.05] px-3 py-2 text-[11.5px] text-foreground">
            {notice}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
