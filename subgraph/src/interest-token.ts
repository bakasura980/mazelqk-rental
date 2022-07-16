import { BigInt } from "@graphprotocol/graph-ts";
import {
  Snapshot as SnapshotEvent,
  Transfer,
} from "../generated/InterestToken/InterestToken";
import { Snapshot } from "../generated/schema";

export function handleSnapshot(event: SnapshotEvent): void {
  const snapshot = new Snapshot(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );

  snapshot.contract = event.address.toHexString();
  snapshot.interestIndex = event.params.index;
  snapshot.balanceAtIndex = event.params.balance;

  snapshot.save();
}

export function handleTransfer(event: Transfer): void {}
