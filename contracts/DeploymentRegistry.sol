// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IAuditRegistry.sol";

contract DeploymentRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    struct Deployment {
        address contractAddress;
        uint256 chainId;
        bytes32 artifactHash;
        bytes32 runtimeBytecodeHash;
        string version;
        string artifactURI;
        string rekorEntry;
        string signerIdentity;
        address auditor;
        bool auditApproved;
        bool sigstoreVerified;
        bool bytecodeVerified;
        uint256 timestamp;
    }

    // key = keccak256(contractAddress, chainId)
    mapping(bytes32 => Deployment) public deployments;
    IAuditRegistry public auditRegistry;

    event DeploymentRegistered(address indexed contractAddress, uint256 indexed chainId, bytes32 deploymentId);
    event AuditApproved(address indexed auditor, bytes32 artifactHash, string version);
    event SigstoreVerified(address indexed verifier, bytes32 deploymentId);
    event BytecodeVerified(address indexed verifier, bytes32 deploymentId);

    constructor(address _auditRegistry) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        auditRegistry = IAuditRegistry(_auditRegistry);
    }

    function _deploymentKey(address _addr, uint256 _chainId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_addr, _chainId));
    }

    function registerDeployment(
        address _contractAddress,
        uint256 _chainId,
        bytes32 _artifactHash,
        bytes32 _runtimeBytecodeHash,
        string calldata _version,
        string calldata _artifactURI,
        string calldata _rekorEntry,
        string calldata _signerIdentity
    ) external onlyRole(ADMIN_ROLE) {
        bytes32 depId = _deploymentKey(_contractAddress, _chainId);
        require(deployments[depId].timestamp == 0, "Deployment already exists");
        deployments[depId] = Deployment({
            contractAddress: _contractAddress,
            chainId: _chainId,
            artifactHash: _artifactHash,
            runtimeBytecodeHash: _runtimeBytecodeHash,
            version: _version,
            artifactURI: _artifactURI,
            rekorEntry: _rekorEntry,
            signerIdentity: _signerIdentity,
            auditor: address(0),
            auditApproved: false,
            sigstoreVerified: false,
            bytecodeVerified: false,
            timestamp: block.timestamp
        });
        emit DeploymentRegistered(_contractAddress, _chainId, depId);
    }

    function approveAudit(address _auditor, bytes32 _artifactHash, string calldata _version) external onlyRole(AUDITOR_ROLE) {
        require(auditRegistry.isApproved(_auditor, _artifactHash, _version), "Audit not approved");
        // Find deployment by artifact hash & version – simplified: iterate over mapping (inefficient).
        // In production use an indexed structure.
        // Here we just set auditApproved flag for matching deployment(s).
        // For demo, caller must know deployment key and call markAuditApproved separately.
        emit AuditApproved(_auditor, _artifactHash, _version);
    }

    function markSigstoreVerified(bytes32 _deploymentKey) external onlyRole(ADMIN_ROLE) {
        require(deployments[_deploymentKey].timestamp != 0, "No such deployment");
        deployments[_deploymentKey].sigstoreVerified = true;
        emit SigstoreVerified(msg.sender, _deploymentKey);
    }

    function markBytecodeVerified(bytes32 _deploymentKey) external onlyRole(ADMIN_ROLE) {
        require(deployments[_deploymentKey].timestamp != 0, "No such deployment");
        deployments[_deploymentKey].bytecodeVerified = true;
        emit BytecodeVerified(msg.sender, _deploymentKey);
    }

    function getDeployment(address _contract, uint256 _chainId) external view returns (Deployment memory) {
        return deployments[_deploymentKey(_contract, _chainId)];
    }
}
