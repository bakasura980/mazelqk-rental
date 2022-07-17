// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class Approval extends ethereum.Event {
  get params(): Approval__Params {
    return new Approval__Params(this);
  }
}

export class Approval__Params {
  _event: Approval;

  constructor(event: Approval) {
    this._event = event;
  }

  get owner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get approved(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class ApprovalForAll extends ethereum.Event {
  get params(): ApprovalForAll__Params {
    return new ApprovalForAll__Params(this);
  }
}

export class ApprovalForAll__Params {
  _event: ApprovalForAll;

  constructor(event: ApprovalForAll) {
    this._event = event;
  }

  get owner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get operator(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get approved(): boolean {
    return this._event.parameters[2].value.toBoolean();
  }
}

export class ClaimEarnigns extends ethereum.Event {
  get params(): ClaimEarnigns__Params {
    return new ClaimEarnigns__Params(this);
  }
}

export class ClaimEarnigns__Params {
  _event: ClaimEarnigns;

  constructor(event: ClaimEarnigns) {
    this._event = event;
  }

  get claimer(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get recipient(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class ClaimInsurance extends ethereum.Event {
  get params(): ClaimInsurance__Params {
    return new ClaimInsurance__Params(this);
  }
}

export class ClaimInsurance__Params {
  _event: ClaimInsurance;

  constructor(event: ClaimInsurance) {
    this._event = event;
  }

  get renter(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get recipient(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class ConsumerChanged extends ethereum.Event {
  get params(): ConsumerChanged__Params {
    return new ConsumerChanged__Params(this);
  }
}

export class ConsumerChanged__Params {
  _event: ConsumerChanged;

  constructor(event: ConsumerChanged) {
    this._event = event;
  }

  get owner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get consumer(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class DamageReport extends ethereum.Event {
  get params(): DamageReport__Params {
    return new DamageReport__Params(this);
  }
}

export class DamageReport__Params {
  _event: DamageReport;

  constructor(event: DamageReport) {
    this._event = event;
  }

  get tokenId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get health(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class Extend extends ethereum.Event {
  get params(): Extend__Params {
    return new Extend__Params(this);
  }
}

export class Extend__Params {
  _event: Extend;

  constructor(event: Extend) {
    this._event = event;
  }

  get tokenId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get duration(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class Liquidate extends ethereum.Event {
  get params(): Liquidate__Params {
    return new Liquidate__Params(this);
  }
}

export class Liquidate__Params {
  _event: Liquidate;

  constructor(event: Liquidate) {
    this._event = event;
  }

  get tokenId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class List extends ethereum.Event {
  get params(): List__Params {
    return new List__Params(this);
  }
}

export class List__Params {
  _event: List;

  constructor(event: List) {
    this._event = event;
  }

  get tokenId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get price(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get tokenUri(): string {
    return this._event.parameters[2].value.toString();
  }

  get collateral(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get insuranceShare(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }

  get reviewPeriod(): BigInt {
    return this._event.parameters[5].value.toBigInt();
  }

  get insuranceOperator(): Address {
    return this._event.parameters[6].value.toAddress();
  }

  get ownershipContract(): Address {
    return this._event.parameters[7].value.toAddress();
  }
}

export class OwnershipTransferred extends ethereum.Event {
  get params(): OwnershipTransferred__Params {
    return new OwnershipTransferred__Params(this);
  }
}

export class OwnershipTransferred__Params {
  _event: OwnershipTransferred;

  constructor(event: OwnershipTransferred) {
    this._event = event;
  }

  get previousOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newOwner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class Rent extends ethereum.Event {
  get params(): Rent__Params {
    return new Rent__Params(this);
  }
}

export class Rent__Params {
  _event: Rent;

  constructor(event: Rent) {
    this._event = event;
  }

  get tokenId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get renter(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get duration(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class Repair extends ethereum.Event {
  get params(): Repair__Params {
    return new Repair__Params(this);
  }
}

export class Repair__Params {
  _event: Repair;

  constructor(event: Repair) {
    this._event = event;
  }

  get tokenId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class Return extends ethereum.Event {
  get params(): Return__Params {
    return new Return__Params(this);
  }
}

export class Return__Params {
  _event: Return;

  constructor(event: Return) {
    this._event = event;
  }

  get tokenId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get leaseStart(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get leaseReturn(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get leaseEnd(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class SetCollateral extends ethereum.Event {
  get params(): SetCollateral__Params {
    return new SetCollateral__Params(this);
  }
}

export class SetCollateral__Params {
  _event: SetCollateral;

  constructor(event: SetCollateral) {
    this._event = event;
  }

  get tokenId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get collateral(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class SetInsuranceShare extends ethereum.Event {
  get params(): SetInsuranceShare__Params {
    return new SetInsuranceShare__Params(this);
  }
}

export class SetInsuranceShare__Params {
  _event: SetInsuranceShare;

  constructor(event: SetInsuranceShare) {
    this._event = event;
  }

  get tokenId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get insuranceShare(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class Transfer extends ethereum.Event {
  get params(): Transfer__Params {
    return new Transfer__Params(this);
  }
}

export class Transfer__Params {
  _event: Transfer;

  constructor(event: Transfer) {
    this._event = event;
  }

  get from(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get to(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class UnList extends ethereum.Event {
  get params(): UnList__Params {
    return new UnList__Params(this);
  }
}

export class UnList__Params {
  _event: UnList;

  constructor(event: UnList) {
    this._event = event;
  }

  get tokenId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class Vault__carDataResultValue0Struct extends ethereum.Tuple {
  get price(): BigInt {
    return this[0].toBigInt();
  }

  get tokenURI(): string {
    return this[1].toString();
  }

  get collateral(): BigInt {
    return this[2].toBigInt();
  }

  get insuranceShare(): BigInt {
    return this[3].toBigInt();
  }

  get reviewPeriod(): BigInt {
    return this[4].toBigInt();
  }

  get insuranceOperator(): Address {
    return this[5].toAddress();
  }

  get ownershipContract(): Address {
    return this[6].toAddress();
  }
}

export class Vault extends ethereum.SmartContract {
  static bind(address: Address): Vault {
    return new Vault("Vault", address);
  }

  balanceOf(owner: Address): BigInt {
    let result = super.call("balanceOf", "balanceOf(address):(uint256)", [
      ethereum.Value.fromAddress(owner)
    ]);

    return result[0].toBigInt();
  }

  try_balanceOf(owner: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall("balanceOf", "balanceOf(address):(uint256)", [
      ethereum.Value.fromAddress(owner)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  carData(tokenId: BigInt): Vault__carDataResultValue0Struct {
    let result = super.call(
      "carData",
      "carData(uint256):((uint256,string,uint256,uint256,uint256,address,address))",
      [ethereum.Value.fromUnsignedBigInt(tokenId)]
    );

    return changetype<Vault__carDataResultValue0Struct>(result[0].toTuple());
  }

  try_carData(
    tokenId: BigInt
  ): ethereum.CallResult<Vault__carDataResultValue0Struct> {
    let result = super.tryCall(
      "carData",
      "carData(uint256):((uint256,string,uint256,uint256,uint256,address,address))",
      [ethereum.Value.fromUnsignedBigInt(tokenId)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      changetype<Vault__carDataResultValue0Struct>(value[0].toTuple())
    );
  }

  consumerOf(tokenId: BigInt): Address {
    let result = super.call("consumerOf", "consumerOf(uint256):(address)", [
      ethereum.Value.fromUnsignedBigInt(tokenId)
    ]);

    return result[0].toAddress();
  }

  try_consumerOf(tokenId: BigInt): ethereum.CallResult<Address> {
    let result = super.tryCall("consumerOf", "consumerOf(uint256):(address)", [
      ethereum.Value.fromUnsignedBigInt(tokenId)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  earningsProvider(): Address {
    let result = super.call(
      "earningsProvider",
      "earningsProvider():(address)",
      []
    );

    return result[0].toAddress();
  }

  try_earningsProvider(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "earningsProvider",
      "earningsProvider():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getApproved(tokenId: BigInt): Address {
    let result = super.call("getApproved", "getApproved(uint256):(address)", [
      ethereum.Value.fromUnsignedBigInt(tokenId)
    ]);

    return result[0].toAddress();
  }

  try_getApproved(tokenId: BigInt): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "getApproved",
      "getApproved(uint256):(address)",
      [ethereum.Value.fromUnsignedBigInt(tokenId)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  interestToken(): Address {
    let result = super.call("interestToken", "interestToken():(address)", []);

    return result[0].toAddress();
  }

  try_interestToken(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "interestToken",
      "interestToken():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  isApprovedForAll(owner: Address, operator: Address): boolean {
    let result = super.call(
      "isApprovedForAll",
      "isApprovedForAll(address,address):(bool)",
      [ethereum.Value.fromAddress(owner), ethereum.Value.fromAddress(operator)]
    );

    return result[0].toBoolean();
  }

  try_isApprovedForAll(
    owner: Address,
    operator: Address
  ): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "isApprovedForAll",
      "isApprovedForAll(address,address):(bool)",
      [ethereum.Value.fromAddress(owner), ethereum.Value.fromAddress(operator)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  list(
    owners: Array<Address>,
    shares: Array<BigInt>,
    price: BigInt,
    tokenUri: string,
    collateral: BigInt,
    insuranceShare: BigInt,
    reviewPeriod: BigInt,
    insuranceOperator: Address
  ): BigInt {
    let result = super.call(
      "list",
      "list(address[],uint256[],uint256,string,uint256,uint256,uint256,address):(uint256)",
      [
        ethereum.Value.fromAddressArray(owners),
        ethereum.Value.fromUnsignedBigIntArray(shares),
        ethereum.Value.fromUnsignedBigInt(price),
        ethereum.Value.fromString(tokenUri),
        ethereum.Value.fromUnsignedBigInt(collateral),
        ethereum.Value.fromUnsignedBigInt(insuranceShare),
        ethereum.Value.fromUnsignedBigInt(reviewPeriod),
        ethereum.Value.fromAddress(insuranceOperator)
      ]
    );

    return result[0].toBigInt();
  }

  try_list(
    owners: Array<Address>,
    shares: Array<BigInt>,
    price: BigInt,
    tokenUri: string,
    collateral: BigInt,
    insuranceShare: BigInt,
    reviewPeriod: BigInt,
    insuranceOperator: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "list",
      "list(address[],uint256[],uint256,string,uint256,uint256,uint256,address):(uint256)",
      [
        ethereum.Value.fromAddressArray(owners),
        ethereum.Value.fromUnsignedBigIntArray(shares),
        ethereum.Value.fromUnsignedBigInt(price),
        ethereum.Value.fromString(tokenUri),
        ethereum.Value.fromUnsignedBigInt(collateral),
        ethereum.Value.fromUnsignedBigInt(insuranceShare),
        ethereum.Value.fromUnsignedBigInt(reviewPeriod),
        ethereum.Value.fromAddress(insuranceOperator)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  name(): string {
    let result = super.call("name", "name():(string)", []);

    return result[0].toString();
  }

  try_name(): ethereum.CallResult<string> {
    let result = super.tryCall("name", "name():(string)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }

  owner(): Address {
    let result = super.call("owner", "owner():(address)", []);

    return result[0].toAddress();
  }

  try_owner(): ethereum.CallResult<Address> {
    let result = super.tryCall("owner", "owner():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  ownerOf(tokenId: BigInt): Address {
    let result = super.call("ownerOf", "ownerOf(uint256):(address)", [
      ethereum.Value.fromUnsignedBigInt(tokenId)
    ]);

    return result[0].toAddress();
  }

  try_ownerOf(tokenId: BigInt): ethereum.CallResult<Address> {
    let result = super.tryCall("ownerOf", "ownerOf(uint256):(address)", [
      ethereum.Value.fromUnsignedBigInt(tokenId)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  supportsInterface(interfaceId: Bytes): boolean {
    let result = super.call(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(interfaceId)]
    );

    return result[0].toBoolean();
  }

  try_supportsInterface(interfaceId: Bytes): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(interfaceId)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  symbol(): string {
    let result = super.call("symbol", "symbol():(string)", []);

    return result[0].toString();
  }

  try_symbol(): ethereum.CallResult<string> {
    let result = super.tryCall("symbol", "symbol():(string)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }

  tokenByIndex(index: BigInt): BigInt {
    let result = super.call("tokenByIndex", "tokenByIndex(uint256):(uint256)", [
      ethereum.Value.fromUnsignedBigInt(index)
    ]);

    return result[0].toBigInt();
  }

  try_tokenByIndex(index: BigInt): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "tokenByIndex",
      "tokenByIndex(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(index)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  tokenOfOwnerByIndex(owner: Address, index: BigInt): BigInt {
    let result = super.call(
      "tokenOfOwnerByIndex",
      "tokenOfOwnerByIndex(address,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(owner),
        ethereum.Value.fromUnsignedBigInt(index)
      ]
    );

    return result[0].toBigInt();
  }

  try_tokenOfOwnerByIndex(
    owner: Address,
    index: BigInt
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "tokenOfOwnerByIndex",
      "tokenOfOwnerByIndex(address,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(owner),
        ethereum.Value.fromUnsignedBigInt(index)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  tokenURI(tokenId: BigInt): string {
    let result = super.call("tokenURI", "tokenURI(uint256):(string)", [
      ethereum.Value.fromUnsignedBigInt(tokenId)
    ]);

    return result[0].toString();
  }

  try_tokenURI(tokenId: BigInt): ethereum.CallResult<string> {
    let result = super.tryCall("tokenURI", "tokenURI(uint256):(string)", [
      ethereum.Value.fromUnsignedBigInt(tokenId)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }

  totalSupply(): BigInt {
    let result = super.call("totalSupply", "totalSupply():(uint256)", []);

    return result[0].toBigInt();
  }

  try_totalSupply(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("totalSupply", "totalSupply():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get earningsProviderAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get perDayFactor_(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ApproveCall extends ethereum.Call {
  get inputs(): ApproveCall__Inputs {
    return new ApproveCall__Inputs(this);
  }

  get outputs(): ApproveCall__Outputs {
    return new ApproveCall__Outputs(this);
  }
}

export class ApproveCall__Inputs {
  _call: ApproveCall;

  constructor(call: ApproveCall) {
    this._call = call;
  }

  get to(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class ApproveCall__Outputs {
  _call: ApproveCall;

  constructor(call: ApproveCall) {
    this._call = call;
  }
}

export class ChangeConsumerCall extends ethereum.Call {
  get inputs(): ChangeConsumerCall__Inputs {
    return new ChangeConsumerCall__Inputs(this);
  }

  get outputs(): ChangeConsumerCall__Outputs {
    return new ChangeConsumerCall__Outputs(this);
  }
}

export class ChangeConsumerCall__Inputs {
  _call: ChangeConsumerCall;

  constructor(call: ChangeConsumerCall) {
    this._call = call;
  }

  get consumer(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class ChangeConsumerCall__Outputs {
  _call: ChangeConsumerCall;

  constructor(call: ChangeConsumerCall) {
    this._call = call;
  }
}

export class ClaimEarnignsCall extends ethereum.Call {
  get inputs(): ClaimEarnignsCall__Inputs {
    return new ClaimEarnignsCall__Inputs(this);
  }

  get outputs(): ClaimEarnignsCall__Outputs {
    return new ClaimEarnignsCall__Outputs(this);
  }
}

export class ClaimEarnignsCall__Inputs {
  _call: ClaimEarnignsCall;

  constructor(call: ClaimEarnignsCall) {
    this._call = call;
  }

  get to(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class ClaimEarnignsCall__Outputs {
  _call: ClaimEarnignsCall;

  constructor(call: ClaimEarnignsCall) {
    this._call = call;
  }
}

export class ClaimInsuranceCall extends ethereum.Call {
  get inputs(): ClaimInsuranceCall__Inputs {
    return new ClaimInsuranceCall__Inputs(this);
  }

  get outputs(): ClaimInsuranceCall__Outputs {
    return new ClaimInsuranceCall__Outputs(this);
  }
}

export class ClaimInsuranceCall__Inputs {
  _call: ClaimInsuranceCall;

  constructor(call: ClaimInsuranceCall) {
    this._call = call;
  }

  get to(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class ClaimInsuranceCall__Outputs {
  _call: ClaimInsuranceCall;

  constructor(call: ClaimInsuranceCall) {
    this._call = call;
  }
}

export class DamageReportCall extends ethereum.Call {
  get inputs(): DamageReportCall__Inputs {
    return new DamageReportCall__Inputs(this);
  }

  get outputs(): DamageReportCall__Outputs {
    return new DamageReportCall__Outputs(this);
  }
}

export class DamageReportCall__Inputs {
  _call: DamageReportCall;

  constructor(call: DamageReportCall) {
    this._call = call;
  }

  get tokenId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get health(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class DamageReportCall__Outputs {
  _call: DamageReportCall;

  constructor(call: DamageReportCall) {
    this._call = call;
  }
}

export class ExtendCall extends ethereum.Call {
  get inputs(): ExtendCall__Inputs {
    return new ExtendCall__Inputs(this);
  }

  get outputs(): ExtendCall__Outputs {
    return new ExtendCall__Outputs(this);
  }
}

export class ExtendCall__Inputs {
  _call: ExtendCall;

  constructor(call: ExtendCall) {
    this._call = call;
  }

  get tokenId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class ExtendCall__Outputs {
  _call: ExtendCall;

  constructor(call: ExtendCall) {
    this._call = call;
  }
}

export class HeadBackCall extends ethereum.Call {
  get inputs(): HeadBackCall__Inputs {
    return new HeadBackCall__Inputs(this);
  }

  get outputs(): HeadBackCall__Outputs {
    return new HeadBackCall__Outputs(this);
  }
}

export class HeadBackCall__Inputs {
  _call: HeadBackCall;

  constructor(call: HeadBackCall) {
    this._call = call;
  }

  get tokenId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class HeadBackCall__Outputs {
  _call: HeadBackCall;

  constructor(call: HeadBackCall) {
    this._call = call;
  }
}

export class LiquidateCall extends ethereum.Call {
  get inputs(): LiquidateCall__Inputs {
    return new LiquidateCall__Inputs(this);
  }

  get outputs(): LiquidateCall__Outputs {
    return new LiquidateCall__Outputs(this);
  }
}

export class LiquidateCall__Inputs {
  _call: LiquidateCall;

  constructor(call: LiquidateCall) {
    this._call = call;
  }

  get tokenId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class LiquidateCall__Outputs {
  _call: LiquidateCall;

  constructor(call: LiquidateCall) {
    this._call = call;
  }
}

export class ListCall extends ethereum.Call {
  get inputs(): ListCall__Inputs {
    return new ListCall__Inputs(this);
  }

  get outputs(): ListCall__Outputs {
    return new ListCall__Outputs(this);
  }
}

export class ListCall__Inputs {
  _call: ListCall;

  constructor(call: ListCall) {
    this._call = call;
  }

  get owners(): Array<Address> {
    return this._call.inputValues[0].value.toAddressArray();
  }

  get shares(): Array<BigInt> {
    return this._call.inputValues[1].value.toBigIntArray();
  }

  get price(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get tokenUri(): string {
    return this._call.inputValues[3].value.toString();
  }

  get collateral(): BigInt {
    return this._call.inputValues[4].value.toBigInt();
  }

  get insuranceShare(): BigInt {
    return this._call.inputValues[5].value.toBigInt();
  }

  get reviewPeriod(): BigInt {
    return this._call.inputValues[6].value.toBigInt();
  }

  get insuranceOperator(): Address {
    return this._call.inputValues[7].value.toAddress();
  }
}

export class ListCall__Outputs {
  _call: ListCall;

  constructor(call: ListCall) {
    this._call = call;
  }

  get value0(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class MigrateEarningsProviderCall extends ethereum.Call {
  get inputs(): MigrateEarningsProviderCall__Inputs {
    return new MigrateEarningsProviderCall__Inputs(this);
  }

  get outputs(): MigrateEarningsProviderCall__Outputs {
    return new MigrateEarningsProviderCall__Outputs(this);
  }
}

export class MigrateEarningsProviderCall__Inputs {
  _call: MigrateEarningsProviderCall;

  constructor(call: MigrateEarningsProviderCall) {
    this._call = call;
  }

  get newProvider(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class MigrateEarningsProviderCall__Outputs {
  _call: MigrateEarningsProviderCall;

  constructor(call: MigrateEarningsProviderCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall extends ethereum.Call {
  get inputs(): RenounceOwnershipCall__Inputs {
    return new RenounceOwnershipCall__Inputs(this);
  }

  get outputs(): RenounceOwnershipCall__Outputs {
    return new RenounceOwnershipCall__Outputs(this);
  }
}

export class RenounceOwnershipCall__Inputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall__Outputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class RentCall extends ethereum.Call {
  get inputs(): RentCall__Inputs {
    return new RentCall__Inputs(this);
  }

  get outputs(): RentCall__Outputs {
    return new RentCall__Outputs(this);
  }
}

export class RentCall__Inputs {
  _call: RentCall;

  constructor(call: RentCall) {
    this._call = call;
  }

  get tokenId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class RentCall__Outputs {
  _call: RentCall;

  constructor(call: RentCall) {
    this._call = call;
  }
}

export class RepairCall extends ethereum.Call {
  get inputs(): RepairCall__Inputs {
    return new RepairCall__Inputs(this);
  }

  get outputs(): RepairCall__Outputs {
    return new RepairCall__Outputs(this);
  }
}

export class RepairCall__Inputs {
  _call: RepairCall;

  constructor(call: RepairCall) {
    this._call = call;
  }

  get tokenId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class RepairCall__Outputs {
  _call: RepairCall;

  constructor(call: RepairCall) {
    this._call = call;
  }
}

export class SafeTransferFromCall extends ethereum.Call {
  get inputs(): SafeTransferFromCall__Inputs {
    return new SafeTransferFromCall__Inputs(this);
  }

  get outputs(): SafeTransferFromCall__Outputs {
    return new SafeTransferFromCall__Outputs(this);
  }
}

export class SafeTransferFromCall__Inputs {
  _call: SafeTransferFromCall;

  constructor(call: SafeTransferFromCall) {
    this._call = call;
  }

  get from(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get to(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class SafeTransferFromCall__Outputs {
  _call: SafeTransferFromCall;

  constructor(call: SafeTransferFromCall) {
    this._call = call;
  }
}

export class SafeTransferFrom1Call extends ethereum.Call {
  get inputs(): SafeTransferFrom1Call__Inputs {
    return new SafeTransferFrom1Call__Inputs(this);
  }

  get outputs(): SafeTransferFrom1Call__Outputs {
    return new SafeTransferFrom1Call__Outputs(this);
  }
}

export class SafeTransferFrom1Call__Inputs {
  _call: SafeTransferFrom1Call;

  constructor(call: SafeTransferFrom1Call) {
    this._call = call;
  }

  get from(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get to(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get _data(): Bytes {
    return this._call.inputValues[3].value.toBytes();
  }
}

export class SafeTransferFrom1Call__Outputs {
  _call: SafeTransferFrom1Call;

  constructor(call: SafeTransferFrom1Call) {
    this._call = call;
  }
}

export class SetApprovalForAllCall extends ethereum.Call {
  get inputs(): SetApprovalForAllCall__Inputs {
    return new SetApprovalForAllCall__Inputs(this);
  }

  get outputs(): SetApprovalForAllCall__Outputs {
    return new SetApprovalForAllCall__Outputs(this);
  }
}

export class SetApprovalForAllCall__Inputs {
  _call: SetApprovalForAllCall;

  constructor(call: SetApprovalForAllCall) {
    this._call = call;
  }

  get operator(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get approved(): boolean {
    return this._call.inputValues[1].value.toBoolean();
  }
}

export class SetApprovalForAllCall__Outputs {
  _call: SetApprovalForAllCall;

  constructor(call: SetApprovalForAllCall) {
    this._call = call;
  }
}

export class SetCollateralCall extends ethereum.Call {
  get inputs(): SetCollateralCall__Inputs {
    return new SetCollateralCall__Inputs(this);
  }

  get outputs(): SetCollateralCall__Outputs {
    return new SetCollateralCall__Outputs(this);
  }
}

export class SetCollateralCall__Inputs {
  _call: SetCollateralCall;

  constructor(call: SetCollateralCall) {
    this._call = call;
  }

  get tokenId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get collateral(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class SetCollateralCall__Outputs {
  _call: SetCollateralCall;

  constructor(call: SetCollateralCall) {
    this._call = call;
  }
}

export class SetInsuranceShareCall extends ethereum.Call {
  get inputs(): SetInsuranceShareCall__Inputs {
    return new SetInsuranceShareCall__Inputs(this);
  }

  get outputs(): SetInsuranceShareCall__Outputs {
    return new SetInsuranceShareCall__Outputs(this);
  }
}

export class SetInsuranceShareCall__Inputs {
  _call: SetInsuranceShareCall;

  constructor(call: SetInsuranceShareCall) {
    this._call = call;
  }

  get tokenId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get insuranceShare(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class SetInsuranceShareCall__Outputs {
  _call: SetInsuranceShareCall;

  constructor(call: SetInsuranceShareCall) {
    this._call = call;
  }
}

export class TransferFromCall extends ethereum.Call {
  get inputs(): TransferFromCall__Inputs {
    return new TransferFromCall__Inputs(this);
  }

  get outputs(): TransferFromCall__Outputs {
    return new TransferFromCall__Outputs(this);
  }
}

export class TransferFromCall__Inputs {
  _call: TransferFromCall;

  constructor(call: TransferFromCall) {
    this._call = call;
  }

  get from(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get to(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class TransferFromCall__Outputs {
  _call: TransferFromCall;

  constructor(call: TransferFromCall) {
    this._call = call;
  }
}

export class TransferOwnershipCall extends ethereum.Call {
  get inputs(): TransferOwnershipCall__Inputs {
    return new TransferOwnershipCall__Inputs(this);
  }

  get outputs(): TransferOwnershipCall__Outputs {
    return new TransferOwnershipCall__Outputs(this);
  }
}

export class TransferOwnershipCall__Inputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }

  get newOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferOwnershipCall__Outputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }
}

export class UnlistCall extends ethereum.Call {
  get inputs(): UnlistCall__Inputs {
    return new UnlistCall__Inputs(this);
  }

  get outputs(): UnlistCall__Outputs {
    return new UnlistCall__Outputs(this);
  }
}

export class UnlistCall__Inputs {
  _call: UnlistCall;

  constructor(call: UnlistCall) {
    this._call = call;
  }

  get tokenId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get signatures(): Array<Bytes> {
    return this._call.inputValues[1].value.toBytesArray();
  }
}

export class UnlistCall__Outputs {
  _call: UnlistCall;

  constructor(call: UnlistCall) {
    this._call = call;
  }
}
