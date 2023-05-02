const Contato = require("../models/ContatoModel");

exports.index = async (req, res) => {
  const contatos = await Contato.searchContatos();
  res.render('index', { contatos });
};
