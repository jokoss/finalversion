const express = require('express');
const router = express.Router();
const governmentContractController = require('../controllers/governmentContract.controller');

// Public routes for government contracts
router.get('/', governmentContractController.getActiveContracts);
router.get('/:id', governmentContractController.getContract);

module.exports = router;
