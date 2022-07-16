import { ethers } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();

  const MyContract = await ethers.getContractFactory("InterestToken");
  const contract = await MyContract.attach(
    "0x9462BaC7722Da114C11893EC6b50b15F92cB109a"
  );

  let tx = await contract.mint(
    signers[1].address,
    ethers.utils.parseEther("1"),
    { gasLimit: 1000000 }
  );
  console.log(await tx.wait());

  console.log("before");
  tx = await contract.snapshot({ gasLimit: 1000000 });

  console.log(await tx.wait());
  console.log("after");

  console.log(await contract.decimals());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
