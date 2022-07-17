module.exports = {
    skipFiles: ['tests', 'interfaces', 'libraries/Errors.sol', 'libraries/TransferHelper.sol', 'tokens/ERC721Consumable.sol'],
    istanbulReporter: ['lcov', 'json', 'text', 'html']
};
