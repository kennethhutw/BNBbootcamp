// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract MyToken is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 100;
    uint256 public constant MINT_AMOUNT = 10;

    // ************* //
    // * Variables * //
    // ************* //

    address public owner;

    //mapping(address => bool) public alreadyMinted;

    // ********** //
    // * Events * //
    // ********** //

    event Mint(address indexed user, uint256 amount);
    event Burn(address indexed user, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // *************** //
    // * Constructor * //
    // *************** //

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {
        owner = msg.sender;
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // ************* //
    // * Modifiers * //
    // ************* //

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // ************* //
    // * Functions * //
    // ************* //

    function mint(address to , uint256 amount) external {
       // require(!alreadyMinted[msg.sender], "Already minted");

        // console.log("\n Balance before mint is ", balanceOf(msg.sender), "\n");

        // _mint(msg.sender, MINT_AMOUNT);
        // alreadyMinted[msg.sender] = true;
            _mint(to, amount);
         //    alreadyMinted[msg.sender] = true;
        // console.log("\n Balance after mint is ", balanceOf(msg.sender), "\n");

        emit Mint(msg.sender, MINT_AMOUNT);
    }

    function burn(address _user) external onlyOwner {
        uint256 _amount = balanceOf(_user);
        _burn(_user, _amount);
        // delete alreadyMinted[_user];

        emit Burn(_user, _amount);
    }

    function _beforeTokenTransfer(
        address _from,
        address _to,
        uint256
    ) internal view override{

        // require(
        //      _to == address(0) || _from == address(0) ,
        //     "Transfer not allowed111111"
        // );

    
    }

 function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

}
