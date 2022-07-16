import { BigInt } from "@graphprotocol/graph-ts";
import {
  List,
  UnList,
  ConsumerChanged,
  Return,
  DamageReport,
} from "../generated/Vault/Vault";
import { Car } from "../generated/schema";

class Status {
  Available: string;
  Rented: string;
  Returned: string;
  Damaged: string;
  Unlisted: string;
}

const CarStatus: Status = {
  Available: "Available",
  Rented: "Rented",
  Returned: "Returned",
  Damaged: "Damaged",
  Unlisted: "Unlisted",
};
const zeroAddress = "0x0000000000000000000000000000000000000000";

export function handleList(event: List): void {
  const car = new Car(event.params.tokenId.toString());

  car.insuranceOperator = event.params.insuranceOperator;
  car.status = CarStatus.Available;
  car.save();
}

export function handleUnList(event: UnList): void {
  const car = Car.load(event.params.tokenId.toString());
  if (car === null) {
    return;
  }

  car.status = CarStatus.Unlisted;
  car.save();
}

export function handleConsumerChanged(event: ConsumerChanged): void {
  const car = Car.load(event.params.tokenId.toString());
  if (car === null) {
    return;
  }

  if (event.params.consumer.toString() === zeroAddress) {
    car.status = CarStatus.Available;
  } else {
    car.status = CarStatus.Rented;
    car.renter = event.params.consumer;
  }

  car.save();
}

export function handleReturn(event: Return): void {
  const car = Car.load(event.params.tokenId.toString());
  if (car === null) {
    return;
  }

  car.status = CarStatus.Returned;
  car.save();
}

export function handleDamageReport(event: DamageReport): void {
  const car = Car.load(event.params.tokenId.toString());
  if (car === null) {
    return;
  }

  if (event.params.health < BigInt.fromString("100")) {
    car.status = CarStatus.Damaged;
    car.save();
  }
}
