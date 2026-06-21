// SPDX-License-Identifier: MIT
// Compile for Sidra Chain with EVM version "paris" (Remix: Compiler → EVM Version → paris).
pragma solidity ^0.8.20;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

/// @title SidraFeeRouter
/// @notice One-click SidraDX swaps with automatic tiered platform fees.
/// @dev Fee tiers: 1% below 300 SDA, 1.5% at 300–500 SDA, 2% at 500+ SDA notional.
contract SidraFeeRouter {
    address public immutable sidraSwap;
    address public immutable wsda;
    address public feeRecipient;
    address public owner;

    uint256 public constant TIER_MID = 300 ether;
    uint256 public constant TIER_HIGH = 500 ether;
    uint256 public constant BPS_LOW = 100;
    uint256 public constant BPS_MID = 150;
    uint256 public constant BPS_HIGH = 200;
    uint256 public constant SLIPPAGE_PARAM = 10000;

    bytes4 private constant SIDRA_BUY_SELECTOR = 0xdde6379f;
    bytes4 private constant SIDRA_SELL_SELECTOR = 0x968e7276;

    event FeeCollected(address indexed payer, uint256 notional, uint256 fee);
    event FeeRecipientUpdated(address indexed previous, address indexed next);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address _sidraSwap, address _wsda, address _feeRecipient) {
        require(_sidraSwap != address(0) && _wsda != address(0) && _feeRecipient != address(0), "zero addr");
        sidraSwap = _sidraSwap;
        wsda = _wsda;
        feeRecipient = _feeRecipient;
        owner = msg.sender;
    }

    function platformFee(uint256 notionalWei) public pure returns (uint256) {
        if (notionalWei == 0) return 0;
        uint256 bps;
        if (notionalWei >= TIER_HIGH) {
            bps = BPS_HIGH;
        } else if (notionalWei >= TIER_MID) {
            bps = BPS_MID;
        } else {
            bps = BPS_LOW;
        }
        return (notionalWei * bps) / 10_000;
    }

    /// @notice Buy tokens with SDA. Send `swapSdaAmount + platformFee(swapSdaAmount)` as msg.value.
    function sidraBuyWithFee(
        address token,
        uint256 swapSdaAmount,
        uint256 minOut,
        uint256 deadline
    ) external payable {
        uint256 fee = platformFee(swapSdaAmount);
        require(msg.value == swapSdaAmount + fee, "bad value");

        _sendSda(feeRecipient, fee);
        emit FeeCollected(msg.sender, swapSdaAmount, fee);

        uint256 tokenBefore = IERC20(token).balanceOf(address(this));

        bytes memory data = abi.encodeWithSelector(
            SIDRA_BUY_SELECTOR,
            token,
            SLIPPAGE_PARAM,
            minOut,
            deadline
        );

        (bool ok, ) = sidraSwap.call{value: swapSdaAmount}(data);
        require(ok, "sidra buy failed");

        uint256 tokenOut = IERC20(token).balanceOf(address(this)) - tokenBefore;
        require(tokenOut >= minOut, "insufficient out");
        require(IERC20(token).transfer(msg.sender, tokenOut), "token transfer failed");
    }

    /// @notice Sell tokens for WSDA. Fee is deducted from WSDA output automatically.
    function sidraSellWithFee(
        address token,
        uint256 tokenAmount,
        uint256 minWsdaOut,
        uint256 deadline
    ) external {
        require(IERC20(token).transferFrom(msg.sender, address(this), tokenAmount), "transferFrom failed");
        require(IERC20(token).approve(sidraSwap, tokenAmount), "approve failed");

        uint256 wsdaBefore = IERC20(wsda).balanceOf(address(this));

        bytes memory data = abi.encodeWithSelector(
            SIDRA_SELL_SELECTOR,
            token,
            tokenAmount,
            SLIPPAGE_PARAM,
            minWsdaOut,
            deadline
        );

        (bool ok, ) = sidraSwap.call(data);
        require(ok, "sidra sell failed");

        uint256 wsdaOut = IERC20(wsda).balanceOf(address(this)) - wsdaBefore;
        uint256 fee = platformFee(wsdaOut);
        require(wsdaOut > fee, "fee exceeds output");

        emit FeeCollected(msg.sender, wsdaOut, fee);

        require(IERC20(wsda).transfer(feeRecipient, fee), "fee transfer failed");
        require(IERC20(wsda).transfer(msg.sender, wsdaOut - fee), "wsda transfer failed");
    }

    function setFeeRecipient(address next) external onlyOwner {
        require(next != address(0), "zero addr");
        emit FeeRecipientUpdated(feeRecipient, next);
        feeRecipient = next;
    }

    receive() external payable {}

    function _sendSda(address to, uint256 amount) private {
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "sda transfer failed");
    }
}
