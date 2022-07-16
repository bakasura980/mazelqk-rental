// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../interfaces/tokens/IERC721Consumable.sol";

abstract contract ERC721Consumable is IERC165, IERC721Consumable {
    mapping(uint256 => address) private _consumers;

    function consumerOf(uint256 tokenId) public view returns (address) {
        return _consumers[tokenId];
    }

    function changeConsumer(address consumer, uint256 tokenId) public {
        require(
            msg.sender == ownerOf(tokenId),
            "ConsumableAdapter: sender is not owner of tokenId"
        );

        _consumers[tokenId] = consumer;
        emit ConsumerChanged(msg.sender, consumer, tokenId);
    }

    function ownerOf(uint256 tokenId) public view virtual returns (address);

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        returns (bool)
    {
        return interfaceId == type(IERC721Consumable).interfaceId;
    }
}
