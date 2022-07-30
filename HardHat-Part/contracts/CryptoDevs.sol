//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable{
    string _baseTokenURI;
    IWhitelist whitelist;
    bool public presaleStarted;
    uint256 public presaleEnded;
    bool public _paused;
uint256 public maxTokenIds = 20;
uint256 public tokenIds;
uint56 public _price = 0.01 ether;

modifier onlyWhenNotPaused {
    require(!_paused, "Contract Currently Paused");
    _;
}


    constructor (string memory _basURI, address whitelistContract) ERC721 ("Crypto Devs", "CD"){
_baseTokenURI = _basURI;
whitelist = IWhitelist(whitelistContract);
    }


function startPresale () public onlyOwner {
    presaleStarted=true;    
    presaleEnded = block.timestamp + 5 minutes;

}


function presaleMint() public payable onlyWhenNotPaused{
    require(presaleStarted && block.timestamp < presaleEnded, "Presale time is not right now");
    require(whitelist.whitelistedAddresses(msg.sender), "You are not in whitelist" );
    require(tokenIds< maxTokenIds, "limit reached for number of token Ids");
    require(msg.value == _price, "not the right amount for price of token");

    tokenIds++;
    _safeMint(msg.sender, tokenIds);
}

function mint() public payable onlyWhenNotPaused{
          require(presaleStarted && block.timestamp >=  presaleEnded, "Presale has not ended yet");
          require(tokenIds < maxTokenIds, "Exceed maximum Crypto Devs supply");
          require(msg.value == _price, "Ether sent is not correct");
          tokenIds += 1;
          _safeMint(msg.sender, tokenIds);
      }

 function _baseURI ()   internal view virtual override returns  (string memory) {
        return _baseTokenURI;
        
 }

function withdraw () public onlyOwner {
    address  _owner = owner();
    uint256 amount = address(this).balance;
    (bool sent, ) = _owner.call{value: amount} ("");
    require (sent, "Failed to send ether");
}

function setPaused (bool val) public onlyOwner {
    _paused = val;
}

 receive() external payable {}

  
      fallback() external payable {}

}