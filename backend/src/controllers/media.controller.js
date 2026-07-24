const mediaService = require('../services/media.service');
const { success, error } = require('../utils/helpers');
const cloudinary = require('../utils/cloudinary');
const path = require('path');

exports.list = (req, res) => {
  const { folder, search, tags, page, limit, trashed } = req.query;
  const result = mediaService.list({ folder, search, tags, page, limit, trashed: trashed === '1' });
  success(res, result);
};

exports.getById = (req, res) => {
  const item = mediaService.getById(req.params.id);
  if (!item) return error(res, 'Archivo no encontrado', 404);
  success(res, item);
};

exports.getUsages = (req, res) => {
  const usages = mediaService.getUsages(req.params.id);
  success(res, usages);
};

exports.create = async (req, res) => {
  try {
    if (!req.file) return error(res, 'No se envió ningún archivo', 400);
    const result = await cloudinary.uploadToCloudinary(req.file.buffer);
    const item = await mediaService.create({
      name: req.file.originalname || 'unnamed',
      url: result.secure_url,
      cloudinaryId: result.public_id,
      size: req.file.size,
      width: result.width || 0,
      height: result.height || 0,
      mimeType: req.file.mimetype,
      folder: req.body.folder || '/',
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
      alt: req.body.alt || '',
    });
    success(res, item, 'Archivo subido', 201);
  } catch (err) {
    error(res, 'Error al subir archivo: ' + err.message, 500);
  }
};

exports.update = (req, res) => {
  const { name, folder, tags, alt } = req.body;
  const item = mediaService.update(req.params.id, {
    name, folder, tags: tags ? tags.split(',').map(t => t.trim()) : undefined, alt,
  });
  if (!item) return error(res, 'Archivo no encontrado', 404);
  success(res, item, 'Archivo actualizado');
};

exports.trash = (req, res) => {
  mediaService.trash(req.params.id);
  success(res, null, 'Archivo movido a la papelera');
};

exports.restore = (req, res) => {
  mediaService.restore(req.params.id);
  success(res, null, 'Archivo restaurado');
};

exports.deletePermanent = async (req, res) => {
  const deleted = await mediaService.deletePermanent(req.params.id);
  if (!deleted) return error(res, 'Archivo no encontrado', 404);
  success(res, null, 'Archivo eliminado permanentemente');
};

exports.emptyTrash = async (req, res) => {
  const { query } = require('../config/database');
  const trashed = query('SELECT id FROM media WHERE is_trashed = 1');
  for (const item of trashed) {
    await mediaService.deletePermanent(item.id);
  }
  success(res, null, 'Papelera vaciada');
};

exports.getFolders = (req, res) => {
  const folders = mediaService.getFolders();
  success(res, folders);
};

exports.getTags = (req, res) => {
  const tags = mediaService.getTags();
  success(res, tags);
};
