const { GovernmentContract } = require('../models');
const path = require('path');
const fs = require('fs').promises;

// Get all government contracts (admin)
const getAllContracts = async (req, res) => {
  try {
    const contracts = await GovernmentContract.findAll({
      order: [['display_order', 'ASC'], ['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: contracts
    });
  } catch (error) {
    console.error('Error fetching government contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch government contracts',
      error: error.message
    });
  }
};

// Get active government contracts (public)
const getActiveContracts = async (req, res) => {
  try {
    const contracts = await GovernmentContract.getActiveContracts();

    res.json({
      success: true,
      data: contracts
    });
  } catch (error) {
    console.error('Error fetching active government contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch government contracts',
      error: error.message
    });
  }
};

// Get single government contract
const getContract = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await GovernmentContract.findByPk(id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Government contract not found'
      });
    }

    res.json({
      success: true,
      data: contract
    });
  } catch (error) {
    console.error('Error fetching government contract:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch government contract',
      error: error.message
    });
  }
};

// Create new government contract
const createContract = async (req, res) => {
  try {
    const { agency_name, description, is_active } = req.body;
    
    // Handle file upload
    let logo_url = null;
    if (req.file) {
      logo_url = `/uploads/${req.file.filename}`;
    }

    // Get next display order
    const display_order = await GovernmentContract.getNextDisplayOrder();

    const contract = await GovernmentContract.create({
      agency_name,
      description,
      logo_url,
      display_order,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({
      success: true,
      message: 'Government contract created successfully',
      data: contract
    });
  } catch (error) {
    console.error('Error creating government contract:', error);
    
    // Delete uploaded file if contract creation failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create government contract',
      error: error.message
    });
  }
};

// Update government contract
const updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { agency_name, description, is_active } = req.body;

    const contract = await GovernmentContract.findByPk(id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Government contract not found'
      });
    }

    // Handle file upload
    let logo_url = contract.logo_url;
    if (req.file) {
      // Delete old logo if it exists
      if (contract.logo_url) {
        const oldLogoPath = path.join(__dirname, '..', 'uploads', path.basename(contract.logo_url));
        try {
          await fs.unlink(oldLogoPath);
        } catch (error) {
          console.log('Old logo file not found or already deleted');
        }
      }
      logo_url = `/uploads/${req.file.filename}`;
    }

    await contract.update({
      agency_name,
      description,
      logo_url,
      is_active: is_active !== undefined ? is_active : contract.is_active
    });

    res.json({
      success: true,
      message: 'Government contract updated successfully',
      data: contract
    });
  } catch (error) {
    console.error('Error updating government contract:', error);
    
    // Delete uploaded file if update failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update government contract',
      error: error.message
    });
  }
};

// Delete government contract
const deleteContract = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await GovernmentContract.findByPk(id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Government contract not found'
      });
    }

    // Delete logo file if it exists
    if (contract.logo_url) {
      const logoPath = path.join(__dirname, '..', 'uploads', path.basename(contract.logo_url));
      try {
        await fs.unlink(logoPath);
      } catch (error) {
        console.log('Logo file not found or already deleted');
      }
    }

    await contract.destroy();

    res.json({
      success: true,
      message: 'Government contract deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting government contract:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete government contract',
      error: error.message
    });
  }
};

// Reorder government contracts
const reorderContracts = async (req, res) => {
  try {
    const { contracts } = req.body;

    if (!Array.isArray(contracts)) {
      return res.status(400).json({
        success: false,
        message: 'Contracts must be an array'
      });
    }

    // Update display order for each contract
    const updatePromises = contracts.map(({ id, display_order }) =>
      GovernmentContract.update(
        { display_order },
        { where: { id } }
      )
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Government contracts reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering government contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder government contracts',
      error: error.message
    });
  }
};

module.exports = {
  getAllContracts,
  getActiveContracts,
  getContract,
  createContract,
  updateContract,
  deleteContract,
  reorderContracts
};
