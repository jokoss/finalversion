const express = require('express');
const router = express.Router();
const governmentContractController = require('../controllers/governmentContract.controller');
const { upload } = require('../middleware/upload.middleware');

// Admin routes for government contracts (all require authentication)
router.get('/', governmentContractController.getAllContracts);
router.get('/:id', governmentContractController.getContract);
router.post('/', upload.single('logo'), governmentContractController.createContract);
router.put('/:id', upload.single('logo'), governmentContractController.updateContract);
router.delete('/:id', governmentContractController.deleteContract);
router.put('/reorder/bulk', governmentContractController.reorderContracts);

module.exports = router;
