// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AuditRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    struct Approval {
        address auditor;
        bytes32 artifactHash;
        string version;
        uint256 timestamp;
    }

    // Mapping of artifactHash => version => Approval
    mapping(bytes32 => mapping(string => Approval)) public approvals;

    event ArtifactApproved(address indexed auditor, bytes32 indexed artifactHash, string version, uint256 timestamp);
    event ApprovalRevoked(address indexed auditor, bytes32 indexed artifactHash, string version);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    function approveArtifact(address _auditor, bytes32 _artifactHash, string calldata _version) external onlyRole(AUDITOR_ROLE) {
        approvals[_artifactHash][_version] = Approval({
            auditor: _auditor,
            artifactHash: _artifactHash,
            version: _version,
            timestamp: block.timestamp
        });
        emit ArtifactApproved(_auditor, _artifactHash, _version, block.timestamp);
    }

    function revokeApproval(bytes32 _artifactHash, string calldata _version) external onlyRole(ADMIN_ROLE) {
        delete approvals[_artifactHash][_version];
        emit ApprovalRevoked(msg.sender, _artifactHash, _version);
    }

    function isApproved(address _auditor, bytes32 _artifactHash, string calldata _version) external view returns (bool) {
        Approval memory a = approvals[_artifactHash][_version];
        return a.auditor == _auditor && a.artifactHash == _artifactHash;
    }
}
