"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryItem } from "@/app/inventory/page";

interface TransactionModalProps {
  item: InventoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TransactionModal({ item, open, onOpenChange, onSuccess }: TransactionModalProps) {
  const [type, setType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: { type: string; quantity: number; notes: string }) => {
      const res = await fetch(`/api/inventory/${item.id}/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save transaction");
      }
      return res.json();
    },
    onSuccess: () => {
      setError(null);
      setQuantity("");
      setNotes("");
      onSuccess();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a valid positive quantity");
      return;
    }
    mutation.mutate({ type, quantity: qty, notes });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock: {item.name}</DialogTitle>
          <DialogDescription>
            Record a stock movement for {item.sku}. Current stock: {item.quantity} {item.unit}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={type === "IN" ? "default" : "outline"}
              onClick={() => setType("IN")}
            >
              Receive (IN)
            </Button>
            <Button
              type="button"
              variant={type === "OUT" ? "default" : "outline"}
              onClick={() => setType("OUT")}
            >
              Use (OUT)
            </Button>
            <Button
              type="button"
              variant={type === "ADJUSTMENT" ? "default" : "outline"}
              onClick={() => setType("ADJUSTMENT")}
            >
              Adjust
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity ({item.unit})</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received shipment, used for batch #123"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-500">{error}</p>}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Confirm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
