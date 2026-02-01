// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Snehal707 - Wallet Mood Ring
// https://github.com/Snehal707/wallet-mood-ring
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MoodBadge is ERC721, Ownable {
    using Strings for uint256;
    using ECDSA for bytes32;

    struct BadgeData {
        uint256 weekIndex;
        uint8 moodId;
        uint32 tx7d;
        uint32 swaps7d;
        uint32 approvals7d;
        uint8 rarityId;
    }

    mapping(uint256 => BadgeData) public badge;
    mapping(address => mapping(uint256 => bool)) public hasMintedWeek;
    uint256 private _tokenIdCounter;

    // EIP712 Domain
    bytes32 public constant DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );

    // MintAuth Type Hash
    bytes32 public constant MINT_AUTH_TYPEHASH = keccak256(
        "MintAuth(address to,uint256 weekIndex,uint8 moodId,uint32 tx7d,uint32 swaps7d,uint32 approvals7d,uint8 rarityId)"
    );

    bytes32 public DOMAIN_SEPARATOR;

    constructor(address initialOwner) ERC721("Wallet Mood Ring Badge", "MOOD") Ownable(initialOwner) {
        uint256 chainId = block.chainid;
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes("Wallet Mood Ring")),
                keccak256(bytes("1")),
                chainId,
                address(this)
            )
        );
    }

    function mint(
        address to,
        uint256 weekIndex,
        uint8 moodId,
        uint32 tx7d,
        uint32 swaps7d,
        uint32 approvals7d,
        uint8 rarityId,
        bytes memory signature
    ) external {
        require(msg.sender == to, "Caller must be recipient");
        require(moodId <= 4, "Invalid mood");
        require(rarityId <= 2, "Invalid rarity");
        require(!hasMintedWeek[to][weekIndex], "Already minted this week");

        // Verify signature
        bytes32 structHash = keccak256(
            abi.encode(
                MINT_AUTH_TYPEHASH,
                to,
                weekIndex,
                moodId,
                tx7d,
                swaps7d,
                approvals7d,
                rarityId
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );

        address signer = digest.recover(signature);
        require(signer == owner(), "Invalid signature");

        // Mark as minted before external calls to prevent reentrancy
        hasMintedWeek[to][weekIndex] = true;

        // Mint token
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);

        // Store badge data
        badge[tokenId] = BadgeData({
            weekIndex: weekIndex,
            moodId: moodId,
            tx7d: tx7d,
            swaps7d: swaps7d,
            approvals7d: approvals7d,
            rarityId: rarityId
        });

    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        BadgeData memory b = badge[tokenId];

        string memory name = string(
            abi.encodePacked(
                "Wallet Mood Ring Badge Week ",
                _weekLabel(b.weekIndex),
                " ",
                _moodName(b.moodId)
            )
        );

        string memory description = string(
            abi.encodePacked(
                "Weekly mood badge from Wallet Mood Ring. Mood ",
                _moodName(b.moodId),
                ". Stats tx ",
                uint256(b.tx7d).toString(),
                ", swaps ",
                uint256(b.swaps7d).toString(),
                ", approvals ",
                uint256(b.approvals7d).toString(),
                ". Rarity ",
                _rarityName(b.rarityId),
                "."
            )
        );

        string memory svg = _svg(tokenId, b);
        string memory image = string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(bytes(svg))
            )
        );

        string memory json = string(
            abi.encodePacked(
                '{"name":"', name,
                '","description":"', description,
                '","image":"', image,
                '","attributes":[',
                    '{"trait_type":"Mood","value":"', _moodName(b.moodId), '"},',
                    '{"trait_type":"Week","value":"', _weekLabel(b.weekIndex), '"},',
                    '{"trait_type":"Tx 7d","value":"', uint256(b.tx7d).toString(), '"},',
                    '{"trait_type":"Swaps 7d","value":"', uint256(b.swaps7d).toString(), '"},',
                    '{"trait_type":"Approvals 7d","value":"', uint256(b.approvals7d).toString(), '"},',
                    '{"trait_type":"Rarity","value":"', _rarityName(b.rarityId), '"}',
                "]}"
            )
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(bytes(json))
            )
        );
    }

    function _svg(uint256 tokenId, BadgeData memory b) internal pure returns (string memory) {
        (string memory bg1, string memory bg2, string memory accent) = _moodPalette(b.moodId);

        string memory t1 = string(abi.encodePacked("Week ", _weekLabel(b.weekIndex)));
        string memory t2 = string(abi.encodePacked("MOOD: ", _moodName(b.moodId)));
        string memory s1 = string(abi.encodePacked(uint256(b.tx7d).toString(), " tx"));
        string memory s2 = string(abi.encodePacked(uint256(b.swaps7d).toString(), " swaps"));
        string memory s3 = string(abi.encodePacked(uint256(b.approvals7d).toString(), " approvals"));
        string memory r1 = _rarityName(b.rarityId);

        return string(
            abi.encodePacked(
                _svgHeader(bg1, bg2, accent, b.moodId, b.rarityId),
                _svgContent(t1, t2, s1, s2, s3, r1, accent, tokenId, b.moodId, b.rarityId),
                "</svg>"
            )
        );
    }

    function _svgHeader(
        string memory bg1,
        string memory bg2,
        string memory accent,
        uint8 moodId,
        uint8 rarityId
    ) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">',
                '<defs>',
                    '<linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">',
                        '<stop offset="0%" stop-color="', bg1, '"/>',
                        '<stop offset="100%" stop-color="', bg2, '"/>',
                    '</linearGradient>',
                    '<pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">',
                        '<path d="M64 0H0V64" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>',
                    '</pattern>',
                    '<pattern id="noise" width="80" height="80" patternUnits="userSpaceOnUse">',
                        '<circle cx="10" cy="14" r="1.2" fill="#ffffff" opacity="0.06"/>',
                        '<circle cx="42" cy="30" r="1" fill="#ffffff" opacity="0.05"/>',
                        '<circle cx="68" cy="58" r="1.1" fill="#ffffff" opacity="0.05"/>',
                        '<circle cx="22" cy="66" r="1.2" fill="#ffffff" opacity="0.04"/>',
                    '</pattern>',
                '</defs>',
                '<rect x="0" y="0" width="1024" height="1024" rx="80" ry="80" fill="url(#bgGrad)"/>',
                _rarityBackdrop(rarityId, accent),
                _moodBackground(moodId, accent),
                _rarityShine(rarityId),
                '<rect x="0" y="0" width="1024" height="1024" rx="80" ry="80" fill="url(#grid)" opacity="0.35"/>',
                '<rect x="0" y="0" width="1024" height="1024" rx="80" ry="80" fill="url(#noise)" opacity="0.3"/>',
                _rarityBorderGlow(rarityId, accent),
                '<rect x="64" y="64" width="896" height="896" rx="60" ry="60" fill="none" opacity="0.9" stroke="', accent, '" stroke-width="6"/>',
                '<rect x="72" y="72" width="880" height="880" rx="56" ry="56" fill="none" opacity="0.2" stroke="#ffffff" stroke-width="1"/>',
                '<rect x="64" y="140" width="896" height="2" fill="', accent, '" opacity="0.35"/>'
            )
        );
    }

    function _svgContent(
        string memory t1,
        string memory t2,
        string memory s1,
        string memory s2,
        string memory s3,
        string memory r1,
        string memory accent,
        uint256 tokenId,
        uint8 moodId,
        uint8 rarityId
    ) internal pure returns (string memory) {
        string memory tagline = _moodTagline(moodId);
        return string(
            abi.encodePacked(
                '<text x="96" y="118" fill="#ffffff" opacity="0.95" style="font: 700 34px sans-serif;">Wallet Mood Ring</text>',
                '<text x="96" y="190" fill="#ffffff" opacity="0.8" style="font: 600 28px sans-serif;">', t1, '</text>',
                '<text x="96" y="320" fill="', accent, '" style="font: 800 64px sans-serif;">', t2, '</text>',
                '<text x="96" y="360" fill="#ffffff" opacity="0.72" style="font: 600 24px sans-serif;">', tagline, '</text>',
                _moodIcon(moodId, accent),
                _raritySparkles(rarityId, accent),
                _svgChips(s1, s2, s3, accent),
                _rarityBar(r1, accent, rarityId),
                _svgFooter(tokenId)
            )
        );
    }

    function _svgChips(string memory s1, string memory s2, string memory s3, string memory accent) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<rect x="96" y="380" width="420" height="56" rx="18" ry="18" fill="#ffffff" opacity="0.08"/>',
                '<rect x="108" y="392" width="32" height="32" rx="10" ry="10" fill="', accent, '" opacity="0.9"/>',
                '<text x="156" y="418" fill="#ffffff" opacity="0.92" style="font: 650 28px sans-serif;">', s1, '</text>',
                '<rect x="96" y="450" width="420" height="56" rx="18" ry="18" fill="#ffffff" opacity="0.08"/>',
                '<rect x="108" y="462" width="32" height="32" rx="10" ry="10" fill="', accent, '" opacity="0.75"/>',
                '<text x="156" y="488" fill="#ffffff" opacity="0.92" style="font: 650 28px sans-serif;">', s2, '</text>',
                '<rect x="96" y="520" width="420" height="56" rx="18" ry="18" fill="#ffffff" opacity="0.08"/>',
                '<rect x="108" y="532" width="32" height="32" rx="10" ry="10" fill="', accent, '" opacity="0.6"/>',
                '<text x="156" y="558" fill="#ffffff" opacity="0.92" style="font: 650 28px sans-serif;">', s3, '</text>'
            )
        );
    }

    function _rarityBar(string memory r1, string memory accent, uint8 rarityId) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<rect x="96" y="620" width="420" height="72" rx="20" ry="20" fill="#ffffff" opacity="0.06"/>',
                _rarityItem(110, "Common", accent, rarityId == 0),
                _rarityItem(250, "Rare", accent, rarityId == 1),
                _rarityItem(360, "Legendary", accent, rarityId == 2),
                '<text x="96" y="610" fill="#ffffff" opacity="0.5" style="font: 600 16px sans-serif; letter-spacing:1px;">RARITY</text>',
                '<text x="96" y="712" fill="#ffffff" opacity="0.75" style="font: 600 18px sans-serif;">Selected: ', r1, '</text>'
            )
        );
    }

    function _rarityItem(uint256 x, string memory label, string memory accent, bool active) internal pure returns (string memory) {
        string memory fill = active ? accent : "#ffffff";
        string memory fillOpacity = active ? "0.2" : "0.08";
        string memory text = active ? "#ffffff" : "#cbd5e1";
        return string(
            abi.encodePacked(
                '<rect x="', x.toString(), '" y="636" width="120" height="36" rx="12" ry="12" fill="', fill, '" fill-opacity="', fillOpacity, '" stroke="', accent, '" stroke-width="1" opacity="0.9"/>',
                '<text x="', (x + 12).toString(), '" y="660" fill="', text, '" opacity="0.9" style="font: 600 16px sans-serif;">', label, '</text>'
            )
        );
    }

    function _svgFooter(uint256 tokenId) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<text x="96" y="900" fill="#ffffff" opacity="0.55" style="font: 600 24px sans-serif;">Token ', tokenId.toString(), '</text>',
                '<text x="96" y="940" fill="#ffffff" opacity="0.55" style="font: 600 24px sans-serif;">Built on Base</text>'
            )
        );
    }

    function _moodPalette(uint8 moodId) internal pure returns (string memory bg1, string memory bg2, string memory accent) {
        if (moodId == 0) return ("#0a1024", "#061022", "#2b6cff");
        if (moodId == 1) return ("#180715", "#0f0411", "#ff2e88");
        if (moodId == 2) return ("#0f0b1f", "#1a0c2e", "#8a5cff");
        if (moodId == 3) return ("#07181a", "#042024", "#00c2b8");
        return ("#0b0d10", "#15181d", "#c7cbd1");
    }

    function _moodTagline(uint8 moodId) internal pure returns (string memory) {
        if (moodId == 0) return "Shipping onchain";
        if (moodId == 1) return "Fast rotations";
        if (moodId == 2) return "Curating the bag";
        if (moodId == 3) return "Cross chain wandering";
        return "Low noise energy";
    }

    function _moodIcon(uint8 moodId, string memory accent) internal pure returns (string memory) {
        if (moodId == 0) {
            return string(
                abi.encodePacked(
                    '<g transform="translate(860 250)">',
                        '<rect x="0" y="0" width="52" height="52" rx="12" ry="12" fill="none" stroke="', accent, '" stroke-width="3" opacity="0.9"/>',
                        '<path d="M10 34L34 10" stroke="', accent, '" stroke-width="3" opacity="0.8"/>',
                        '<rect x="12" y="12" width="14" height="14" fill="', accent, '" opacity="0.45"/>',
                    '</g>'
                )
            );
        }
        if (moodId == 1) {
            return string(
                abi.encodePacked(
                    '<g transform="translate(860 250)">',
                        '<path d="M26 4 C16 18 34 20 26 48 C10 40 8 24 26 4 Z" fill="', accent, '" opacity="0.85"/>',
                    '</g>'
                )
            );
        }
        if (moodId == 2) {
            return string(
                abi.encodePacked(
                    '<g transform="translate(860 250)">',
                        '<path d="M26 4 L48 26 L26 48 L4 26 Z" fill="none" stroke="', accent, '" stroke-width="3" opacity="0.9"/>',
                        '<circle cx="26" cy="26" r="6" fill="', accent, '" opacity="0.7"/>',
                    '</g>'
                )
            );
        }
        if (moodId == 3) {
            return string(
                abi.encodePacked(
                    '<g transform="translate(850 254)">',
                        '<path d="M8 20 H56" stroke="', accent, '" stroke-width="4" opacity="0.9"/>',
                        '<path d="M44 8 L56 20 L44 32" fill="none" stroke="', accent, '" stroke-width="4" opacity="0.9"/>',
                        '<circle cx="8" cy="20" r="6" fill="', accent, '" opacity="0.7"/>',
                    '</g>'
                )
            );
        }
        return string(
            abi.encodePacked(
                '<g transform="translate(860 250)">',
                    '<path d="M36 8 A18 18 0 1 1 18 44 A14 14 0 1 0 36 8 Z" fill="', accent, '" opacity="0.7"/>',
                '</g>'
            )
        );
    }

    function _moodBackground(uint8 moodId, string memory accent) internal pure returns (string memory) {
        if (moodId == 0) {
            return string(
                abi.encodePacked(
                    '<g opacity="0.18">',
                        '<path d="M120 240 H360 M120 240 V320 M220 240 V320 M320 240 V320" stroke="', accent, '" stroke-width="2"/>',
                        '<path d="M680 140 H900 M680 140 V220 M760 140 V220 M840 140 V220" stroke="', accent, '" stroke-width="2"/>',
                        '<circle cx="220" cy="320" r="6" fill="', accent, '" opacity="0.6"/>',
                        '<circle cx="320" cy="320" r="6" fill="', accent, '" opacity="0.6"/>',
                    '</g>'
                )
            );
        }
        if (moodId == 1) {
            return string(
                abi.encodePacked(
                    '<g opacity="0.2" stroke="', accent, '" stroke-width="2">',
                        '<line x1="140" y1="720" x2="140" y2="820"/>',
                        '<line x1="220" y1="700" x2="220" y2="830"/>',
                        '<line x1="300" y1="740" x2="300" y2="860"/>',
                        '<line x1="380" y1="690" x2="380" y2="800"/>',
                        '<rect x="130" y="760" width="20" height="40" fill="', accent, '" opacity="0.2"/>',
                        '<rect x="210" y="740" width="20" height="50" fill="', accent, '" opacity="0.2"/>',
                        '<rect x="290" y="780" width="20" height="30" fill="', accent, '" opacity="0.2"/>',
                        '<rect x="370" y="720" width="20" height="40" fill="', accent, '" opacity="0.2"/>',
                    '</g>'
                )
            );
        }
        if (moodId == 2) {
            return string(
                abi.encodePacked(
                    '<g opacity="0.18" stroke="', accent, '" stroke-width="2">',
                        '<rect x="640" y="200" width="200" height="140" fill="none"/>',
                        '<rect x="680" y="240" width="200" height="140" fill="none"/>',
                        '<rect x="720" y="280" width="200" height="140" fill="none"/>',
                    '</g>'
                )
            );
        }
        if (moodId == 3) {
            return string(
                abi.encodePacked(
                    '<path d="M120 640 C260 560 380 700 520 640 S 820 620 900 700" stroke="', accent, '" stroke-width="3" stroke-dasharray="8 10" opacity="0.3" fill="none"/>',
                    '<path d="M880 690 L900 700 L882 712" stroke="', accent, '" stroke-width="3" opacity="0.4" fill="none"/>'
                )
            );
        }
        return string(
            abi.encodePacked(
                '<g opacity="0.08">',
                    '<circle cx="220" cy="240" r="120" fill="#ffffff"/>',
                    '<circle cx="820" cy="300" r="140" fill="#ffffff"/>',
                    '<circle cx="520" cy="820" r="160" fill="#ffffff"/>',
                '</g>'
            )
        );
    }

    function _rarityBackdrop(uint8 rarityId, string memory accent) internal pure returns (string memory) {
        if (rarityId == 2) {
            return string(abi.encodePacked('<rect x="24" y="24" width="976" height="976" rx="92" ry="92" fill="', accent, '" opacity="0.08"/>'));
        }
        if (rarityId == 1) {
            return string(abi.encodePacked('<rect x="32" y="32" width="960" height="960" rx="90" ry="90" fill="', accent, '" opacity="0.06"/>'));
        }
        return string(abi.encodePacked('<rect x="40" y="40" width="944" height="944" rx="88" ry="88" fill="', accent, '" opacity="0.03"/>'));
    }

    function _rarityBorderGlow(uint8 rarityId, string memory accent) internal pure returns (string memory) {
        if (rarityId == 2) {
            return string(abi.encodePacked('<rect x="52" y="52" width="920" height="920" rx="70" ry="70" fill="none" stroke="', accent, '" stroke-width="10" opacity="0.35"/>'));
        }
        if (rarityId == 1) {
            return string(abi.encodePacked('<rect x="56" y="56" width="912" height="912" rx="68" ry="68" fill="none" stroke="', accent, '" stroke-width="8" opacity="0.22"/>'));
        }
        return string(abi.encodePacked('<rect x="60" y="60" width="904" height="904" rx="66" ry="66" fill="none" stroke="', accent, '" stroke-width="6" opacity="0.12"/>'));
    }

    function _rarityShine(uint8 rarityId) internal pure returns (string memory) {
        if (rarityId == 2) {
            return '<rect x="-120" y="470" width="1260" height="120" transform="rotate(-15 512 512)" fill="#ffffff" opacity="0.2"/>';
        }
        return "";
    }

    function _raritySparkles(uint8 rarityId, string memory accent) internal pure returns (string memory) {
        if (rarityId == 2) {
            return string(
                abi.encodePacked(
                    '<g opacity="0.9" fill="', accent, '">',
                        '<path d="M240 260 L250 286 L276 296 L250 306 L240 332 L230 306 L204 296 L230 286 Z"/>',
                        '<path d="M820 220 L826 238 L844 244 L826 250 L820 268 L814 250 L796 244 L814 238 Z"/>',
                    '</g>'
                )
            );
        }
        return "";
    }

    function _moodName(uint8 moodId) internal pure returns (string memory) {
        if (moodId == 0) return "Builder Mode";
        if (moodId == 1) return "Degen Mode";
        if (moodId == 2) return "Collector Mode";
        if (moodId == 3) return "Bridge Tourist";
        return "Quiet Mode";
    }

    function _rarityName(uint8 rarityId) internal pure returns (string memory) {
        if (rarityId == 2) return "Legendary";
        if (rarityId == 1) return "Rare";
        return "Common";
    }

    function _weekLabel(uint256 weekIndex) internal pure returns (string memory) {
        return weekIndex.toString();
    }
}
