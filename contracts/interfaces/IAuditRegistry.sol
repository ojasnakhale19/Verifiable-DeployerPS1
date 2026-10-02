// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAuditRegistry {
    function isApproved(address auditor, bytes32 artifactHash, string calldata version) external view returns (bool);
}
